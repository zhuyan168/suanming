import { isEnglishRequest, withAiOutputLanguage } from '../../../lib/aiLanguage';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAccessOrRespond, recordSuccessfulReading } from '../../../lib/accessServer';
import { parseAIJson, AIJsonParseError } from '../../../lib/parseAIJson';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessStatus = await requireAccessOrRespond({ req, res, spreadAccess: 'member', spreadKey: 'hexagram' });
  if (!accessStatus) return;

  const { cards, question } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 7) {
    return res.status(400).json({ error: 'Invalid cards data' });
  }

  const isEn = isEnglishRequest(req);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 判断是否有用户问题
  const hasQuestion = question && question.trim().length > 0;

  // 六芒星牌位含义
  const positionMeanings = [
    '过去｜问题的根源',
    '现在｜问题的真实状态',
    '未来｜问题的发展趋势',
    '内在｜情绪与心态的影响',
    '外在｜环境与他人的影响',
    '行动｜你对问题的态度与对策',
    '指引牌｜对整体局势的总结与提醒'
  ];

  // 构建系统提示词
  const systemPrompt = `你是一名专业且克制的塔罗解读助手，擅长把复杂问题讲清楚，给出可执行建议。

【核心原则】
- 温和但不悬浮，偏现实建议
- 禁止使用绝对化承诺："一定/注定/百分百/无法改变"等绝对化措辞
- 语气口语化，便于手机阅读
- 不过度恐吓或夸张承诺
- 像面对面聊天一样使用短句和常用词。避免只写“价值呈现、资源调配、协调性、需求脱节、转化闭环、情感连接、核心定位”等抽象词；如需表达，必须马上换成具体、易懂的现实场景
- 对仅凭牌面不能确认的内容，使用“可能、比较像、建议留意、可以核对一下”等表达，不把推测写成事实

【六芒星牌阵的特点】
这是一个深度分析牌阵，从6个维度（过去、现在、未来、内在、外在、行动）剖析问题，第7张牌为"指引牌"，对整体局势进行总结与提醒。

【输出要求】
- overall: 400-600字，串联至少2组牌面关系，讲清过去、现在、内在、外在、行动和未来怎样互相影响
- 每张牌的meaning: 180-260字，说明当前位置含义、现实中可能怎样表现、对问题的影响和可观察或调整之处
- reminder: 40-60字，一句温柔的结尾提示
  - 有问题：根据用户问题给出贴合的鼓励（如：感情问题→相信自己的节奏；工作问题→每一步都在累积经验）
  - 无问题：通用鼓励，强调真正改变来自自己的选择与行动
  - 语气温和、口语化，不说教
- 必须使用中文牌名，不要出现英文
- 禁止使用"这张牌"等生硬指代，直接使用牌名`;

  // 构建用户提示词
  const userPrompt = hasQuestion 
    ? `【问题定向解读模式】

用户的问题是：${question}

你将收到一个六芒星牌阵的7张塔罗牌与牌位含义。请围绕用户问题进行定向解读。
要求：结合"牌位含义 + 牌名 + 正逆位"给出整体解读与每张牌的具体解释，并给出温和但可执行的建议。
按要求输出严格 JSON（不要 Markdown、不要多余文字）。
避免使用"一定/注定/百分百/无法改变"等绝对措辞。

牌位与牌如下：
1 ${positionMeanings[0]}：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
2 ${positionMeanings[1]}：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
3 ${positionMeanings[2]}：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）
4 ${positionMeanings[3]}：${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）
5 ${positionMeanings[4]}：${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）
6 ${positionMeanings[5]}：${cards[5].name}（${cards[5].orientation === 'upright' ? '正位' : '逆位'}）
7 ${positionMeanings[6]}：${cards[6].name}（${cards[6].orientation === 'upright' ? '正位' : '逆位'}）

这是会员付费深度解读，不是简短摘要。cards 数组必须严格包含 index 1 到 7 的全部七项，一张都不能省略。每张牌的正逆位必须与输入完全一致，不能自行改变或同时解释两种方向。内容要充实，但不要重复凑字数。

【严格输出以下 JSON 格式】
{
  "overall": "整体解读，先直接回应用户问题，再串联至少2组牌面关系（400-600字）",
  "cards": [
    {
      "index": 1,
      "position": "${positionMeanings[0]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "针对问题说明当前位置含义、现实表现、影响和可观察之处（180-260字）"
    },
    {
      "index": 2,
      "position": "${positionMeanings[1]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "针对该问题，这张牌在这个牌位上的解读（120-200字）"
    },
    {
      "index": 3,
      "position": "${positionMeanings[2]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "针对该问题，这张牌在这个牌位上的解读（120-200字）"
    },
    {
      "index": 4,
      "position": "${positionMeanings[3]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "针对该问题，这张牌在这个牌位上的解读（120-200字）"
    },
    {
      "index": 5,
      "position": "${positionMeanings[4]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "针对该问题，这张牌在这个牌位上的解读（120-200字）"
    },
    {
      "index": 6,
      "position": "${positionMeanings[5]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "针对该问题，这张牌在这个牌位上的解读（120-200字）"
    },
    {
      "index": 7,
      "position": "${positionMeanings[6]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "作为指引牌，对整体局势的总结与方向性建议（120-200字）"
    }
  ],
  "reminder": "一句温柔的结尾提示。需要根据用户的问题和牌面情况，给出贴合问题的鼓励与提醒。语气温和、口语化，强调改变来自用户自己的选择与行动。约40-60字。"
}

【重要】
- 英文牌名必须翻译为准确的中文牌名（例如：Eight of Wands → 权杖八，The Fool → 愚者）
- 不要使用 Markdown 格式
- 不要在 JSON 外输出任何文本`
    : `【通用解读模式】

用户没有输入具体问题。

你将收到一个六芒星牌阵的7张塔罗牌与牌位含义。请仅基于"牌位含义 + 牌名 + 正逆位"进行通用解读，不要编造用户背景。
按要求输出严格 JSON（不要 Markdown、不要多余文字）。

牌位与牌如下：
1 ${positionMeanings[0]}：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
2 ${positionMeanings[1]}：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
3 ${positionMeanings[2]}：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）
4 ${positionMeanings[3]}：${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）
5 ${positionMeanings[4]}：${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）
6 ${positionMeanings[5]}：${cards[5].name}（${cards[5].orientation === 'upright' ? '正位' : '逆位'}）
7 ${positionMeanings[6]}：${cards[6].name}（${cards[6].orientation === 'upright' ? '正位' : '逆位'}）

这是会员付费深度解读，不是简短摘要。cards 数组必须严格包含 index 1 到 7 的全部七项，一张都不能省略。每张牌的正逆位必须与输入完全一致，不能自行改变或同时解释两种方向。内容要充实，但不要重复凑字数。

【严格输出以下 JSON 格式】
{
  "overall": "整体解读，串联至少2组牌面关系，描述整体状态怎样发展（400-600字）",
  "cards": [
    {
      "index": 1,
      "position": "${positionMeanings[0]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "说明当前位置含义、可能出现的现实表现、影响和可观察之处（180-260字）"
    },
    {
      "index": 2,
      "position": "${positionMeanings[1]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "这张牌在这个牌位上的通用解读（120-200字）"
    },
    {
      "index": 3,
      "position": "${positionMeanings[2]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "这张牌在这个牌位上的通用解读（120-200字）"
    },
    {
      "index": 4,
      "position": "${positionMeanings[3]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "这张牌在这个牌位上的通用解读（120-200字）"
    },
    {
      "index": 5,
      "position": "${positionMeanings[4]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "这张牌在这个牌位上的通用解读（120-200字）"
    },
    {
      "index": 6,
      "position": "${positionMeanings[5]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "这张牌在这个牌位上的通用解读（120-200字）"
    },
    {
      "index": 7,
      "position": "${positionMeanings[6]}",
      "cardName": "中文牌名",
      "orientation": "正位/逆位",
      "meaning": "作为指引牌，对整体局势的总结与提醒（120-200字）"
    }
  ],
  "reminder": "一句温柔的结尾提示。通用的鼓励，不涉及具体问题，强调牌只是提醒能量流动，真正的改变来自用户自己的选择与行动。语气温和、口语化。约40-60字。"
}

【重要】
- 英文牌名必须翻译为准确的中文牌名（例如：Eight of Wands → 权杖八，The Fool → 愚者）
- 不要使用 Markdown 格式
- 不要在 JSON 外输出任何文本`;

  try {
    let reading: any = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryReminder = attempt === 0 ? '' : '\n\n上一次输出不完整。请重新生成，并确认 cards 严格包含 index 1 到 7 的全部七项，正逆位与输入完全一致。';
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: withAiOutputLanguage(systemPrompt, isEn) },
          { role: 'user', content: withAiOutputLanguage(`${userPrompt}${retryReminder}`, isEn) },
        ],
        temperature: 0.7,
        max_tokens: 7000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to call DeepSeek API');
    }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        const parsed: any = parseAIJson(content);
        const complete = Array.isArray(parsed?.cards)
          && parsed.cards.length === 7
          && parsed.cards.every((item: any, index: number) => Number(item?.index) === index + 1);
        if (complete) {
          reading = parsed;
          break;
        }
        console.error('Incomplete hexagram reading:', { attempt: attempt + 1, cardCount: parsed?.cards?.length ?? 0 });
      } catch (parseError: unknown) {
        console.error('Invalid hexagram JSON:', parseError);
      }
    }

    if (!reading) throw new Error('AI 返回的牌阵解读不完整，请重试');

    try {
      await recordSuccessfulReading({
        accessStatus,
        spreadType: 'hexagram',
        featureKey: 'hexagram',
        question: question || null,
        cards,
        readingResult: reading,
        resultPath: '/reading/general/hexagram/reading',
      });
      return res.status(200).json(reading);
    } catch (recordError: unknown) {
      console.error('Failed to record hexagram reading:', recordError);
      throw recordError;
    }
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
