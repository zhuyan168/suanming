import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, question } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 5) {
    return res.status(400).json({ error: 'Invalid cards data' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `你是一位擅长「职业方向判断」的塔罗解读师。
你的语言温柔、克制、务实，不空谈命运，也不制造焦虑。
你的目标是：
- 帮助用户看清 当下更适合的工作方向
- 给出 可以立刻执行的现实建议

【撰写要求】：
1. 禁止使用“这张牌”这种生硬的指代。
2. 禁止在正文中使用英文牌名（如 Eight of Wands），必须使用对应的中文译名（如 权杖八）。
3. 每段解读的开头请直接点题，格式参考：“[正位/逆位]的[中文牌名]意味着...”、“当[中文牌名]以[正位/逆位]出现，它预示着...”
4. 保持表达的自然、口语化，像一个资深的职场前辈在和你聊天。
5. 禁止使用“仅供娱乐”“不保证准确性”等免责声明。
6. 禁止使用夸张玄学、宿命论、神秘力量暗示。
输出风格应像一个可靠的职业规划朋友，说话直接、有逻辑、有行动步骤。`;

  const userPrompt = `牌阵：该找什么工作
用户问题（如有）：${question || '未提供'}
以下是用户在本次占卜中抽到的五张牌（按顺序）：

1）内心真正渴望的状态：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
2）最适合的靠近方向：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
3）核心优势或潜力：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）
4）可获得的资源支持：${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）
5）需要调整或补强：${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）

请根据以上信息，生成一次完整、连贯的职业方向解读。
请注意：cards 中提供的 name 是英文，请你在 JSON 输出中自动翻译为准确、地道的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚人）。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
{
  "title": "一句话点题（不超过20字）",
  "warm_opening": "1-2 句情绪承接，安抚但不矫情",
  "overall": "整体解读（220-320字）：先给结论，再解释为什么现在适合这个方向或策略。注意不要出现“这张牌”字眼。",
  "positions": [
    {
      "position": "内心真正渴望的状态",
      "card": "中文牌名",
      "reading": "150-230字。要求：开头直接使用“[正位/逆位]的[中文牌名]显示...”或类似表达，严禁使用“这张牌”或英文名。"
    },
    {
      "position": "最适合的靠近方向",
      "card": "中文牌名",
      "reading": "150-230字"
    },
    {
      "position": "核心优势或潜力",
      "card": "中文牌名",
      "reading": "150-230字"
    },
    {
      "position": "可获得的资源支持",
      "card": "中文牌名",
      "reading": "150-230字"
    },
    {
      "position": "需要调整或补强",
      "card": "中文牌名",
      "reading": "150-230字"
    }
  ],
  "action_plan": {
    "fit_directions": ["方向关键词1", "方向关键词2", "方向关键词3"],
    "next_7_days": ["明确可执行动作1（动词开头）", "动作2", "动作3", "动作4"],
    "next_30_days": ["动作1", "动作2", "动作3", "动作4"],
    "avoid": ["最容易踩的坑1", "坑2", "坑3"]
  },
  "closing": "一句收尾：温柔但有推动力，鼓励用户开始行动"
}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to call DeepSeek API');
    }

    const data = await response.json();
    const reading = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(reading);
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

