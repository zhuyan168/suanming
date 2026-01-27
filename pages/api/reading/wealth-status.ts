import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 3) {
    return res.status(400).json({ error: '请提供完整的 3 张牌数据' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API 配置异常，请检查环境变量' });
  }

  const slotNames = [
    "当前的财运状态",
    "正在影响你财运的因素",
    "近期的财运走向与提醒"
  ];

  const slotDescs = [
    "你现在整体的金钱状况与能量基调，反映你当下与财富的关系。",
    "无论是外在环境、现实条件，还是你的选择与心态，正在对财运产生作用的关键因素。",
    "接下来一段时间财运的整体趋势，以及你需要留意或调整的方向。"
  ];

  const cardsInfo = cards.map((card, index) => {
    const orientation = card.orientation === 'reversed' ? '逆位' : '正位';
    return `牌位${index + 1}：${slotNames[index]}；牌：${card.name}（${orientation}）\n说明：${slotDescs[index]}`;
  }).join('\n\n');

  const systemPrompt = `你是一位温柔、现实、生活化的占卜解读助手。你用中文输出，不使用任何英文。你不会做绝对化判断，不会使用“一定/注定/必然/肯定会/百分百/无法改变”等词。你给的建议务实、可执行，语气安抚但不悬浮。你尊重用户的选择与行动，强调趋势而非结论。`;

  const userPrompt = `我做了一个“我现在的财运如何？”三张牌阵，请你根据牌位含义解读。请按以下结构输出 JSON：
{
  "overview": "总览（80-140字）：先承接情绪 + 给一个总体财运氛围",
  "cardDetails": [
    {
      "slotName": "牌位1：当前的财运状态",
      "interpretation": "解读内容（90-140字）"
    },
    {
      "slotName": "牌位2：正在影响你财运的因素",
      "interpretation": "解读内容（90-140字）"
    },
    {
      "slotName": "牌位3：近期的财运走向与提醒",
      "interpretation": "解读内容（90-140字）"
    }
  ],
  "actionSuggestions": ["务实、可做、不过度承诺的建议1（15-30字）", "建议2", "建议3"],
  "closing": "温柔收尾（50-90字）：给一点安抚与方向感"
}

不要出现英文，不要出现“一定/注定/必然/肯定会/百分百/无法改变”等词。

以下是用户抽到的牌：
${cardsInfo}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: '生成解读时遇到问题，请稍后再试' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    let result = JSON.parse(content);

    // 再次过滤确定性词汇
    const soften = (text: string) => {
        if (!text) return text;
        return text
            .replace(/一定/g, '也许')
            .replace(/注定/g, '可能')
            .replace(/绝对/g, '大概率')
            .replace(/必然/g, '倾向于')
            .replace(/肯定/g, '看起来');
    };

    result.overview = soften(result.overview);
    result.closing = soften(result.closing);
    result.cardDetails = result.cardDetails.map((item: any) => ({
        ...item,
        interpretation: soften(item.interpretation)
    }));
    result.actionSuggestions = result.actionSuggestions.map(soften);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: '网络开小差了，重试一下吧' });
  }
}
