export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 6) {
      return res.status(400).json({ error: '需要提供6张卡牌信息' });
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

    // 构建 prompt（按用户提供的优化后的提示词）
    const userMessage = `你是一位经验丰富、表达克制但温柔的塔罗占卜师。
你的任务是：根据「未来恋人牌阵」的抽牌结果，为单身用户提供清晰、具体、可安抚情绪的爱情指引。

【重要风格要求】
- 语气：温柔、清醒、有边界感，不夸张、不制造焦虑
- 避免：绝对化判断（如"一定会""已经错过"）
- 多用：可能性、状态、识别信号、行动建议
- 目标：让用户看完后"更安心 + 知道接下来可以做什么"
  
【牌阵说明】
本次使用的牌阵为「未来恋人牌阵」，共 6 张牌，含义如下：
1. 指引牌（整体能量与当下你需要调整的心态）
2. 他 / 她是什么类型
3. 他 / 她已经出现了吗？
4. 你们之间可能遇到的阻力
5. 你们的相处模式
6. 怎样才能遇到他 / 她（行动与状态建议）
  
【输入数据】
本次抽牌结果如下：

${cardsInfo}

【输出要求】
请严格以 JSON 格式输出，结构如下（不要输出多余文本，不要使用 Markdown 代码块标记）：

{
  "sections": [
    {
      "slotKey": "guide",
      "title": "指引牌",
      "text": "120-180字中文解读"
    },
    {
      "slotKey": "type",
      "title": "他 / 她是什么类型",
      "text": "120-180字中文解读"
    },
    {
      "slotKey": "appeared",
      "title": "他 / 她已经出现了吗？",
      "text": "120-180字中文解读（避免绝对是/否，用情境与识别信号）"
    },
    {
      "slotKey": "obstacle",
      "title": "遇到的阻力",
      "text": "120-180字中文解读（指出阻力来源 + 温和提醒）"
    },
    {
      "slotKey": "pattern",
      "title": "相处模式",
      "text": "120-180字中文解读（描述节奏与互动方式）"
    },
    {
      "slotKey": "how_to_meet",
      "title": "怎样才能遇到他 / 她",
      "text": "120-180字中文解读（给出具体可执行建议）"
    }
  ],
  "summary": {
    "title": "一句话总结",
    "text": "用一句话总结这段未来关系的核心关键词"
  },
  "actions": [
    { "text": "一条具体、可执行的行动建议" },
    { "text": "一条具体、可执行的行动建议" },
    { "text": "一条具体、可执行的行动建议" }
  ]
}

【额外规则】
- appeared（是否出现）牌位：
  - 不要直接回答"是 / 否"
  - 使用：生活圈、状态、阶段、你可能忽略的信号等角度
- how_to_meet（如何遇到）：
  - 不要只给心理建议
  - 至少包含一个"现实行动或场景"的建议
- 不要使用"命中注定""宇宙安排"等强宿命措辞
- 不要提及"AI / 模型 / 提示词"
  
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
            content: '你是一位经验丰富、表达克制但温柔的塔罗占卜师。你的解读温柔、清醒、有边界感，不夸张、不制造焦虑，让用户看完后更安心并知道接下来可以做什么。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
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

