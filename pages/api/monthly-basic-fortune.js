export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 3) {
      return res.status(400).json({ error: '需要提供三张卡牌信息' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // 调试信息（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API Key exists:', !!apiKey);
    }
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'API Key 未配置',
        debug: process.env.NODE_ENV === 'development' ? '请检查 .env.local 文件是否存在且包含 DEEPSEEK_API_KEY' : undefined
      });
    }

    // 构建三张牌的信息
    const cardsInfo = cards.map((card, index) => {
      const orientationText = card.orientation === 'upright' ? '正位' : '逆位';
      const baseMeaning = card.orientation === 'upright' ? card.upright : card.reversed;
      return `第${index + 1}张牌：
- 牌名：${card.name}
- 正逆位：${orientationText}
- 牌义说明：${baseMeaning}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `用户本月抽到的三张塔罗牌信息如下：

${cardsInfo}

请根据以上三张牌的信息，用中文生成本月的详细运势解读，要求输出为一个 JSON 对象，字段包括：

- overall：综合运势，2～3句话，结合三张牌的整体能量
- love：爱情运势，2～3句话
- career：事业和学业运势，2～3句话
- wealth：财运，2句话
- health：健康建议，2句话
- luckyColor：幸运色，中文颜色名称即可
- luckyNumber：幸运数字，1～99之间
- quote：幸运箴言，不超过20个字，语气温柔治愈，需要和整体运势呼应
- card1Meaning：第一张牌的解读（结合其在三张牌中的位置），1～2句话
- card2Meaning：第二张牌的解读（结合其在三张牌中的位置），1～2句话
- card3Meaning：第三张牌的解读（结合其在三张牌中的位置），1～2句话

只返回JSON，不要任何解释文字。`;

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
            content: '你现在是一名温柔、专业的塔罗占卜师，擅长解读多张牌的组合含义。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
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

    // 解析 JSON 响应
    let fortuneData;
    try {
      // 尝试提取 JSON（可能被包裹在代码块中）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fortuneData = JSON.parse(jsonMatch[0]);
      } else {
        fortuneData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      console.error('原始内容:', content);
      return res.status(500).json({ 
        error: '解析运势数据失败',
        rawContent: content 
      });
    }

    // 验证返回的数据结构
    const requiredFields = ['overall', 'love', 'career', 'wealth', 'health', 'luckyColor', 'luckyNumber', 'quote', 'card1Meaning', 'card2Meaning', 'card3Meaning'];
    const missingFields = requiredFields.filter(field => !fortuneData[field]);
    
    if (missingFields.length > 0) {
      console.error('缺少必需字段:', missingFields);
      return res.status(500).json({ 
        error: '运势数据不完整',
        missingFields 
      });
    }

    return res.status(200).json({
      success: true,
      fortune: fortuneData
    });

  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ 
      error: '服务器内部错误',
      message: error.message 
    });
  }
}

