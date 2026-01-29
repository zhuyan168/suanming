import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * 财富阻碍牌阵 (5张)
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

  if (!cards || !Array.isArray(cards) || cards.length !== 5) {
    return res.status(400).json({ error: 'Invalid cards data: need exactly 5 cards' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `你是一位温和、现实、生活化的财务占卜解读助手。
你的目标是帮助用户看清“阻碍与突破点”，提供可执行建议，而不是制造焦虑。
避免玄学腔，避免夸张承诺，避免恐吓语气。
解读时必须明确区分正位与逆位的含义差异，并将这种差异自然融入分析中，而不是忽略。
解读文字风格：生活化、具体、像朋友在讲道理，不要塔罗味过重（不要频繁出现“宇宙、能量、命运注定”等）。`;

  const userPrompt = `我做了一个“财富阻碍牌阵”（5张牌）。请你根据牌位含义，用生活化、现实、可执行的方式解读，并按要求输出 JSON。
要求：
1）只输出 JSON，不要出现任何多余文字或 Markdown。
2）全中文，不要出现英文（包括牌名也要翻译成中文）。
3）不要出现“一定/注定/必然/肯定会/百分百/无法改变”等绝对化词语。
4）整体概况 250-300 字；每张牌解析 200-250 字。
5）解读尽量像朋友在分析现实问题：结合日常场景、行为习惯、选择成本、风险提醒；少用塔罗术语（例如“能量、宇宙、灵性指引”等）。

牌位1：你当前的财务状况；牌：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
牌位2：影响你财务的外在因素；牌：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
牌位3：你对自己财务状况的态度；牌：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）
牌位4：阻碍你财务改善的原因；牌：${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）
牌位5：你可以如何突破这一财务阻碍；牌：${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）

请严格按以下 JSON 结构输出：
{
  "overall": "整体概况文字（250-300字）",
  "cards": [
    {
      "position": 1,
      "title": "你当前的财务状况",
      "card": "（中文牌名）",
      "orientation": "正位/逆位",
      "reading": "单张解析（200-250字）"
    },
    {
      "position": 2,
      "title": "影响你财务的外在因素",
      "card": "（中文牌名）",
      "orientation": "正位/逆位",
      "reading": "单张解析（200-250字）"
    },
    {
      "position": 3,
      "title": "你对自己财务状况的态度",
      "card": "（中文牌名）",
      "orientation": "正位/逆位",
      "reading": "单张解析（200-250字）"
    },
    {
      "position": 4,
      "title": "阻碍你财务改善的原因",
      "card": "（中文牌名）",
      "orientation": "正位/逆位",
      "reading": "单张解析（200-250字）"
    },
    {
      "position": 5,
      "title": "你可以如何突破这一财务阻碍",
      "card": "（中文牌名）",
      "orientation": "正位/逆位",
      "reading": "单张解析（200-250字）"
    }
  ],
  "disclaimer": "占卜只是呈现你当下能量的趋势，而真正带来财富突破的，是你正在做出的选择与行动。"
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
    console.error('Error in wealth-obstacles reading API:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export default handler;
