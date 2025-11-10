export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, result } = req.body;

    // 验证必需参数
    if (!result) {
      return res.status(400).json({ error: '缺少必需参数：result' });
    }

    // 如果没有问题，返回默认解释
    if (!question || !question.trim()) {
      const defaultInterpretations = {
        sheng: '此事可行，顺势而为。神明已允准你的请求，时机成熟，把握当下，勇敢前行。',
        yin: '暂缓行事，宜再思量。此时不宜轻举妄动，建议沉淀思考，等待更好的时机。',
        xiao: '神明含笑未答，再问一次吧。或许你的问题需要更明确，或者神明希望你再思考一下。',
      };
      return res.status(200).json({
        interpretation: defaultInterpretations[result] || defaultInterpretations.sheng,
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'API Key 未配置',
        debug: process.env.NODE_ENV === 'development' ? '请检查 .env.local 文件' : undefined
      });
    }

    // 构建 prompt
    const resultNames = {
      sheng: '圣筊（一阳一阴，表示允准、可行）',
      yin: '阴筊（两阳，表示否定、不宜）',
      xiao: '笑筊（两阴，神明含笑未答、需再问）',
    };

    const resultName = resultNames[result] || resultNames.sheng;
    const userMessage = `用户的问题是：「${question.trim()}」\n掷筊结果是：「${resultName}」\n\n请根据这个掷筊结果，给出一段温和、具体的建议（50字左右）。语气要亲切但不失神圣感，像在传达神明的旨意。`;

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
            content: '你是一位掷筊占卜的解读者，擅长将神明的旨意用温和、贴近生活的语言传达给问卜者。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
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

    return res.status(200).json({
      interpretation: content.trim(),
    });

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message 
    });
  }
}

