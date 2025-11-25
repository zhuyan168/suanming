export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards, positions } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 7) {
      return res.status(400).json({ error: '需要提供七张卡牌信息' });
    }

    // 验证 positions (可选，如果前端传了就用，没传就用默认)
    const positionNames = positions || [
      "月初状态",
      "本月感情/桃花",
      "本月事业",
      "本月财运",
      "本月人际关系",
      "月末状态",
      "本月建议"
    ];

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    // 构建卡牌信息字符串
    const cardsInfo = cards.map((card, index) => {
      const orientationText = card.orientation === 'upright' ? '正位' : '逆位';
      const baseMeaning = card.orientation === 'upright' ? card.upright : card.reversed;
      const positionName = positionNames[index] || `位置${index + 1}`;
      return `位置 ${index + 1} [${positionName}]：
- 牌名：${card.name}
- 正逆位：${orientationText}
- 牌义参考：${baseMeaning}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `用户本月抽到的七张塔罗牌（会员版月运）信息如下：

${cardsInfo}

请根据以上七张牌的信息及对应位置，生成本月的深度运势解读。
风格要求：  
- 内容必须更加生活化，而不是哲学式空谈。  
- 结合真实的生活场景、日常行为、情绪体验和人际互动来解释。  
- 让用户能联想到自己的生活，并感受到解读“贴地气”和具体可行动。  
- 建议必须具体，例如：沟通方式、工作习惯调整、人际处理方式、金钱管理等。  
- 不要使用过度玄学、抽象或难以理解的表达方式。  
- 语言保持温暖、有洞察力，但务实且贴近人心。

要求输出为一个 JSON 对象，必须包含以下字段：
1. month: 当前月份（例如 "2025年1月"）
2. summary: 本月整体运势总结（250字左右）
   - 必须从用户真实生活角度出发，例如：工作节奏、情绪变化、关系主题、重点挑战、应对方式  
   - 表述要自然、明晰、有画面感，避免抽象论述  
3. cards: 一个数组，包含7个对象，每个对象对应一张牌的解读。每个对象需包含：
   - position: 位置名称（如"月初状态"）
   - name: 牌名
   - orientation: "upright" 或 "reversed"
   - meaning: 
       - 150字左右  
       - 解读必须结合该位置含义  
       - 用真实生活化语言解释这张牌如何影响本月该领域  
       - 包含至少 1–2 条“具体可执行的建议”  
       - 避免抽象的玄学形容，应聚焦行为、心态和生活应用 

JSON 结构示例：
{
  "month": "2025年X月",
  "summary": "...",
  "cards": [
    { "position": "月初状态", "name": "...", "orientation": "...", "meaning": "..." },
    ...
  ]
}

请确保返回的是合法的 JSON 格式，不要包含 Markdown 代码块标记。`;

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
            content: '你是一位资深的塔罗占卜师，擅长进行深度、多维度的运势分析。你的解读风格神秘、洞察力强且富有启发性。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 2500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return res.status(500).json({ error: 'DeepSeek API 调用失败' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: '未能获取有效响应' });
    }

    // 解析 JSON
    let fortuneData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fortuneData = JSON.parse(jsonMatch[0]);
      } else {
        fortuneData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Content:', content);
      return res.status(500).json({ error: '解析运势数据失败' });
    }

    return res.status(200).json(fortuneData);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

