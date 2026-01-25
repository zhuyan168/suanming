import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, questionTitle } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 7) {
    return res.status(400).json({ error: '请提供完整的 7 张牌数据' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API 配置异常，请检查环境变量' });
  }

  const slotNames = [
    "你目前的职业状态",
    "这份工作的优势",
    "这份工作的劣势",
    "领导/上司对你的看法",
    "同事/下属对你的看法",
    "个人成长进步空间",
    "工作未来发展趋势"
  ];

  const cardsInfo = cards.map((card, index) => {
    const orientation = card.orientation === 'reversed' ? '逆位' : '正位';
    return `${index + 1}【${slotNames[index]}】：${card.name}（${orientation}）`;
  }).join('\n');

  const systemPrompt = `你是一个冷静、专业且具共情力的职场心态观察者。
你的职责：
1. 像照镜子一样反映用户目前的职场现状和内心波动，而不是替用户做决定。
2. 严禁引导：绝对禁止使用“值得吗？”、“建议离职”、“该坚持下去”等带有明显决策引导的词汇。你的目标是“帮用户看清”，而不是“帮用户选择”。
3. 语言风格：自然口语化，但要保持分寸感，不要过度话痨。
4. 具象化：用具体的职场细节（如：开会时的走神、对消息提醒的生理性抵触、对某个项目的隐隐期待）来还原牌面能量，但不做价值判断。`;

  const userPrompt = `用户问题：${questionTitle || '这份工作是否值得继续做下去？'}

以下是用户抽到的7张牌（请按牌位解读）：
${cardsInfo}

请严格按 JSON 格式输出解读：
{
  "overview": "现状复盘。总结目前工作中各方能量的交织状态，描述这种状态对人精力的牵引，不要给结论。200-300字",
  "cardDetails": [
    {
      "slotName": "牌位名",
      "cardName": "地道中文名（如：宝剑六）",
      "orientation": "正/逆位",
      "interpretation": "描述现状与感受。结合具体的职场生活细节反映牌面。150-200字"
    }
  ],
  "actionSuggestions": ["可以尝试的自我调节或现状优化建议1", "建议2", "建议3"],
  "realityReminder": "冷静的现实反馈。提醒用户回归事实，不过渡依赖占卜，看清客观环境的局限与机会。100字左右"
}

要求：
- 严禁使用“注定、一定、绝对、肯定”等词。
- 严禁出现“你觉得值得吗”、“快离开吧”、“坚持就是胜利”等任何引导性结论。
- 减少感叹号的使用，语气要温和且客观。
- 仅输出 JSON。`;

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
    
    // 解析并简单脱敏确定性词汇
    let result = JSON.parse(content);
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
    result.realityReminder = soften(result.realityReminder);
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
