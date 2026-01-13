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
    const userMessage = `你是一位温柔、知性且富有共情力的塔罗占卜师。
你的任务是：根据「复合可能性牌阵」的抽牌结果，为纠结于过去关系的女性用户提供温暖、清晰、口语化且具有慰藉感的复合指引。

【重要风格要求】
- 语气：温和且贴心。像是一位懂她的知心姐姐，坐在她身边拍拍她的肩膀，陪她聊聊心里话。
- 口语化：禁止使用“能量场”、“维度”、“潜意识投射”、“因果法则”等生硬词汇。
- 比喻化：用生活中的琐事来比喻感情。比如“就像鞋里进了沙子，虽然还能走，但总归是不舒服”，而不是说“存在不可调和的内在矛盾”。
- 重点：多共情她的难过，多肯定她的付出。即使结果是不建议复合，也要温柔地引导她看向未来，而不是冷冰冰地否定。
- 目标：让她感觉到被理解、被治愈，同时也清楚接下来的路该怎么走。
  
【牌阵说明】
本次使用的牌阵为「复合可能性牌阵」，共 10 张牌，含义如下：
1. 这段关系是如何走散的（当初真正分开的原因）
2. 你当前的情绪状态与纠结来源（用户当下的痛点）
3. 前任目前的真实状态（TA现在对这段关系的真实立场）
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
      "text": "120-180字解读，温柔地剖析分开的真实无奈"
    },
    {
      "slotKey": "p2",
      "title": "你当前的情绪状态与纠结来源",
      "text": "120-180字解读，深度共情她的这些不甘和难过"
    },
    {
      "slotKey": "p3",
      "title": "前任目前的真实状态",
      "text": "120-180字解读，用平实的语言描述对方现在的想法"
    },
    {
      "slotKey": "p4",
      "title": "你内心对复合的感受",
      "text": "120-180字解读，温柔地指出她潜意识里还没放下的点"
    },
    {
      "slotKey": "p5",
      "title": "前任内心对复合的感受",
      "text": "120-180字解读，客观但温婉地说明对方是否有回头的打算"
    },
    {
      "slotKey": "p6",
      "title": "你们之间最大的阻碍是什么",
      "text": "120-180字解读，像讲故事一样说明那个最现实的问题"
    },
    {
      "slotKey": "p7",
      "title": "对你有利的帮助或转机",
      "text": "120-180字解读，给她一些具体的希望或慰藉"
    },
    {
      "slotKey": "p8",
      "title": "被你忽略的重要因素",
      "text": "120-180字解读，温和地提醒她一直没注意到的真相"
    },
    {
      "slotKey": "p9",
      "title": "你需要做出的选择",
      "text": "120-180字解读，给她一个明确但体贴的建议"
    },
    {
      "slotKey": "guide",
      "title": "指引牌",
      "text": "150-200字解读，升华情感，给她一个大大的拥抱式的总结"
    }
  ],
  "summary": {
    "title": "治愈寄语",
    "text": "用一句话温柔地戳中核心，给她力量"
  },
  "actions": [
    { "text": "一条具体的、关于如何处理与对方沟通的建议" },
    { "text": "一条具体的、关于如何安顿自己情绪的建议" },
    { "text": "一条关于是否采取下一步行动的温婉建议" }
  ]
}

【额外规则】
- 不要出现任何“AI、模型、提示词、数据”等破坏氛围的词。
- 强调：语言要像在耳边呢喃，亲切、自然、通俗易懂。
  
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
            content: '你是一位温柔知性、说话亲切自然的女性塔罗占卜师。你的解读像是在和闺蜜聊天，充满了情感支持和真实的智慧。',
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

