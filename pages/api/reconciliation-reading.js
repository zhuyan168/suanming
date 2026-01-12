export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 10) {
      return res.status(400).json({ error: '需要提供10张卡牌信息' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    // 构建卡牌信息字符串
    const cardsInfo = cards.map((card, index) => {
      const orientationText = card.isReversed ? '逆位' : '正位';
      const keywords = card.keywords ? card.keywords.join('、') : '';
      return `牌位 ${index + 1} [${card.slotName}]：
- 牌名：${card.cardName}
- 正逆位：${orientationText}
- 关键词：${keywords}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `你是一位经验丰富、表达克制但温柔的塔罗占卜师。
你的任务是：根据「复合可能性牌阵」的抽牌结果，为纠结于过去关系的女性用户提供清晰、具体、深度且能直面现实的复合指引。

【重要风格要求】
- 语气：温柔且清醒。像一位在深夜陪她喝茶的长辈，既能体恤她的痛，也能一针见血地指出真相。
- 避免：绝对化判断（如"一定会复合""他已经彻底不爱你了"），也不要过度美化现实。
- 重点：分析双方的状态差异、阻碍的本质，以及这份执着对用户当下的价值。
- 目标：让用户看清"能不能复合"、"应不应该复合"以及"如果想复合/放下，我该怎么做"。
  
【牌阵说明】
本次使用的牌阵为「复合可能性牌阵」，共 10 张牌，含义如下：
1. 这段关系是如何走散的（当初真正分开的原因）
2. 你当前的情绪状态与纠结来源（用户当下的痛点）
3. 前任目前的真实状态（TA对这段关系的真实立场）
4. 你内心对复合的感受（用户内心深处真实的渴望与恐惧）
5. 前任内心对复合的感受（TA对复合这件事的真实态度）
6. 你们之间最大的阻碍是什么（核心矛盾）
7. 对你有利的帮助或转机（可能的支持力量）
8. 被你忽略的重要因素（被情绪遮蔽的客观事实）
9. 你需要做出的选择（最终的功课）
10. 指引牌（整体的智慧点拨）

【输入数据】
本次抽牌结果如下：

${cardsInfo}

【输出要求】
请严格以 JSON 格式输出，结构如下（不要输出多余文本，不要使用 Markdown 代码块标记）：

{
  "sections": [
    {
      "slotKey": "p1",
      "title": "这段关系是如何走散的",
      "text": "120-180字解读，深度剖析本质原因"
    },
    {
      "slotKey": "p2",
      "title": "你当前的情绪状态与纠结来源",
      "text": "120-180字解读，共情她的纠结"
    },
    {
      "slotKey": "p3",
      "title": "前任目前的真实状态",
      "text": "120-180字解读，冷静分析对方立场"
    },
    {
      "slotKey": "p4",
      "title": "你内心对复合的感受",
      "text": "120-180字解读，挖掘潜意识里的渴望"
    },
    {
      "slotKey": "p5",
      "title": "前任内心对复合的感受",
      "text": "120-180字解读，洞察对方真实的复合意愿"
    },
    {
      "slotKey": "p6",
      "title": "你们之间最大的阻碍是什么",
      "text": "120-180字解读，点明难以逾越的鸿沟"
    },
    {
      "slotKey": "p7",
      "title": "对你有利的帮助或转机",
      "text": "120-180字解读，寻找希望的火种"
    },
    {
      "slotKey": "p8",
      "title": "被你忽略的重要因素",
      "text": "120-180字解读，提醒被忽略的关键细节"
    },
    {
      "slotKey": "p9",
      "title": "你需要做出的选择",
      "text": "120-180字解读，指明当前最该完成的课题"
    },
    {
      "slotKey": "guide",
      "title": "指引牌",
      "text": "150-200字解读，升华主题，提供灵魂层面的建议"
    }
  ],
  "summary": {
    "title": "灵魂一问",
    "text": "用一句话精准戳中这份关系的核心本质"
  },
  "actions": [
    { "text": "一条具体的、关于如何处理与对方沟通的建议" },
    { "text": "一条具体的、关于如何安顿自己情绪的建议" },
    { "text": "一条关于是否采取下一步行动（如联系或断联）的建议" }
  ]
}

【额外规则】
- 如果 TA 的复合意愿牌（p5）和立场牌（p3）非常消极，不要勉强找希望，要温和地提醒用户"放手也是一种圆满"。
- 强调成长性。解读要落脚到用户自身的能量提升上。
- 不要提及"AI / 模型 / 提示词"。
  
请开始解读。`;

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
            content: '你是一位经验丰富、表达克制但温柔的塔罗占卜师。你的解读深度、清醒且具有共情力，能引导用户看清关系本质。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.75,
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
    let readingData;
    try {
      // 尝试提取 JSON（移除可能的 Markdown 代码块标记）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        readingData = JSON.parse(jsonMatch[0]);
      } else {
        readingData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Content:', content);
      return res.status(500).json({ error: '解析解读数据失败' });
    }

    return res.status(200).json(readingData);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

