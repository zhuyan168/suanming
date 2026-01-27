import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 免费牌阵：我现在的财运如何？
 * API 解读接口 (DeepSeek)
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 3) {
    return res.status(400).json({ error: 'Invalid cards data: need exactly 3 cards' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `你是一位温柔、现实、生活化的占卜解读助手。你用中文输出，不使用任何英文。你不会做绝对化判断，不会使用“一定/注定/必然/肯定会/百分百/无法改变”等词。你给的建议务实、可执行，语气安抚但不悬浮。你尊重用户的选择与行动，强调趋势而非结论。请直接进入主题进行解读，不要使用诸如“看到你关心自己的财运”、“这种对生活的关注很自然”等客套开场白，直接针对牌面给结论。`;

  const userPrompt = `我做了一个“我现在的财运如何？”三张牌阵，请你根据牌位含义解读。请按以下结构输出 JSON 对象，不要出现英文（包括牌名也要翻译成中文，例如：Ace of Pentacles 翻译为 星币一），不要出现“一定/注定/必然/肯定会/百分百/无法改变”等词。

请注意：开头直接说正题，严禁使用“看到你关心自己的财运”、“这种关注很自然”等废话文学，直接从财运能量和牌阵整体氛围开始。

牌位1：当前的财运状态；牌：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
牌位2：正在影响你财运的因素；牌：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
牌位3：近期的财运走向与提醒；牌：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）

牌位说明：
1. 当前的财运状态：你现在整体的金钱状况与能量基调，反映你当下与财富的关系。
2. 正在影响你财运的因素：无论是外在环境、现实条件，还是你的选择与心态，正在对财运产生作用的关键因素。
3. 近期的财运走向与提醒：接下来一段时间财运的整体趋势，以及你需要留意或调整的方向。

请严格按照以下格式输出 JSON：
{
  "overall": "总览（150-200字）：先承接情绪 + 给一个总体财运氛围。仅中文。",
  "positions": [
    {
      "title": "当前的财运状态",
      "card_name_zh": "中文牌名",
      "reading": "分牌解读（140-260字）。要求结合牌位含义，给出深刻且具启发性的详细解析。仅中文。"
    },
    {
      "title": "正在影响你财运的因素",
      "card_name_zh": "中文牌名",
      "reading": "分牌解读（140-260字）。要求结合牌位含义，给出深刻且具启发性的详细解析。仅中文。"
    },
    {
      "title": "近期的财运走向与提醒",
      "card_name_zh": "中文牌名",
      "reading": "分牌解读（140-260字）。要求结合牌位含义，给出深刻且具启发性的详细解析。仅中文。"
    }
  ],
  "actions": ["建议1（15-30字）", "建议2（15-30字）", "建议3（15-30字）"],
  "closing": "温柔收尾（50-90字）：给一点安抚与方向感。仅中文。"
}`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
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
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API Error:', errorData);
      throw new Error(errorData.message || `DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(content);
  } catch (error: any) {
    console.error('Error in wealth-current-status reading API:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export default handler;
