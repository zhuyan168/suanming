export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards, positions, year } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 13) {
      return res.status(400).json({ error: '需要提供13张卡牌信息' });
    }

    // 验证 positions (可选，如果前端传了就用，没传就用默认)
    const positionNames = positions || [
      "一月", "二月", "三月", "四月", "五月", "六月",
      "七月", "八月", "九月", "十月", "十一月", "十二月",
      "年度主题牌"
    ];

    // 使用传递的年份，如果没有则生成当前年份
    const yearDisplay = year || (() => {
      const now = new Date();
      return `${now.getFullYear()}年`;
    })();

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
      const isYearTheme = index === 12;
      return `位置 ${index + 1} [${positionName}]${isYearTheme ? '（年度核心主题）' : ''}：
- 牌名：${card.name}
- 正逆位：${orientationText}
- 牌义参考：${baseMeaning}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `用户在 ${yearDisplay} 抽到的13张塔罗牌（Year Ahead Spread 年度运势）信息如下：

${cardsInfo}

这是一个经典的 Year Ahead Spread，其中：
- 前12张牌分别对应未来一年的12个月份（一月到十二月）
- 第13张牌位于中心，代表整年的核心主题或精神指引

请根据以上13张牌的信息及对应位置，生成 ${yearDisplay} 的深度年度运势解读。

风格要求：  
- 内容必须更加生活化，而不是哲学式空谈。  
- 结合真实的生活场景、日常行为、情绪体验和人际互动来解释。  
- 让用户能联想到自己的生活，并感受到解读"贴地气"和具体可行动。  
- 建议必须具体，例如：沟通方式、工作习惯调整、人际处理方式、金钱管理、学习成长等。  
- 不要使用过度玄学、抽象或难以理解的表达方式。  
- 语言保持温暖、有洞察力，但务实且贴近人心。
- 对于每个月份，要结合该月份的季节特点、节日、常见生活节奏来解读。
- 年度主题牌要特别强调，它是贯穿全年的核心能量。

要求输出为一个 JSON 对象，必须包含以下字段：
1. year: 必须严格使用 "${yearDisplay}"（不要自己判断年份）
2. summary: 年度整体运势总结（350字左右）
   - 必须从用户真实生活角度出发，例如：全年主要主题、重要转折期、关系发展、事业规划、成长方向  
   - 表述要自然、明晰、有画面感，避免抽象论述
   - 结合年度主题牌的能量，说明这一年的核心议题  
3. cards: 一个数组，包含13个对象，每个对象对应一张牌的解读。每个对象需包含：
   - position: 位置名称（如"一月"、"年度主题牌"）
   - name: 牌名
   - orientation: "upright" 或 "reversed"
   - meaning: 
       - 对于月份牌：120字左右  
       - 对于年度主题牌：200字左右（因为它最重要）
       - 解读必须结合该位置含义（月份或年度主题）
       - 用真实生活化语言解释这张牌如何影响该月/全年  
       - 包含具体可执行的建议  
       - 避免抽象的玄学形容，应聚焦行为、心态和生活应用
       - 对于月份牌，可以结合该月份的季节特点（如春季、夏季、秋季、冬季）和节日（如春节、五一、中秋、国庆、圣诞等）

JSON 结构示例：
{
  "year": "${yearDisplay}",
  "summary": "...",
  "cards": [
    { "position": "一月", "name": "...", "orientation": "...", "meaning": "..." },
    { "position": "二月", "name": "...", "orientation": "...", "meaning": "..." },
    ...
    { "position": "十二月", "name": "...", "orientation": "...", "meaning": "..." },
    { "position": "年度主题牌", "name": "...", "orientation": "...", "meaning": "..." }
  ]
}

请确保返回的是合法的 JSON 格式，不要包含 Markdown 代码块标记。年份字段必须严格使用 "${yearDisplay}"。`;

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
            content: '你是一位资深的塔罗占卜师，擅长进行深度、多维度的年度运势分析。你精通 Year Ahead Spread（年度展望牌阵），能够将13张牌的能量融会贯通，提供贴近生活、具体可行的年度指引。你的解读风格温暖、洞察力强且富有启发性。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
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

