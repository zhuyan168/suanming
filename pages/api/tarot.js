export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, cardName, orientation } = req.body;

    // 验证必需参数
    if (!question || !cardName || !orientation) {
      return res.status(400).json({ error: '缺少必需参数' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // 调试信息（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Key exists:', !!apiKey);
      console.log('API Key length:', apiKey ? apiKey.length : 0);
    }
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DEEPSEEK')));
      return res.status(500).json({ 
        error: 'API Key 未配置',
        debug: process.env.NODE_ENV === 'development' ? '请检查 .env.local 文件是否存在且包含 DEEPSEEK_API_KEY' : undefined
      });
    }

    // 构建 prompt
    const orientationText = orientation === 'upright' ? '正位' : '逆位';
    const userMessage = `用户的问题是：「${question}」抽到的塔罗牌是：「${cardName}（${orientationText}）」。请根据这张牌的含义判断问题的答案倾向（yes 或 no），并给出一段细腻且完整的解析（50字左右，语气温柔但直白，像在轻声安慰对方）。\n输出格式如下：\n答案：Yes / No\n解析：……`;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的塔罗占卜师。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { raw: errorText };
      }
      
      console.error('DeepSeek API error status:', response.status);
      console.error('DeepSeek API error response:', errorData);
      console.error('Request URL:', 'https://api.deepseek.com/chat/completions');
      console.error('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.substring(0, 10)}...` // 只显示前10个字符
      });
      
      return res.status(500).json({ 
        error: 'DeepSeek API 调用失败',
        status: response.status,
        details: errorData,
        message: errorData.error?.message || errorData.message || '未知错误'
      });
    }

    const data = await response.json();
    
    // 提取返回内容
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: '未能获取有效响应' });
    }

    // 解析返回内容
    const lines = content.split('\n').filter(line => line.trim());
    let answer = '';
    let interpretation = '';

    for (const line of lines) {
      if (line.includes('答案：') || line.includes('答案:')) {
        answer = line.replace(/答案[：:]\s*/, '').trim();
      } else if (line.includes('解析：') || line.includes('解析:')) {
        interpretation = line.replace(/解析[：:]\s*/, '').trim();
      }
    }

    // 如果没有正确解析到答案和解析，尝试直接使用内容
    if (!answer || !interpretation) {
      interpretation = content.trim();
      // 尝试从内容中提取 Yes/No
      if (content.toLowerCase().includes('yes')) {
        answer = 'Yes';
      } else if (content.toLowerCase().includes('no')) {
        answer = 'No';
      }
    }

    return res.status(200).json({
      answer: answer || 'Yes',
      interpretation: interpretation || content,
    });

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message 
    });
  }
}

