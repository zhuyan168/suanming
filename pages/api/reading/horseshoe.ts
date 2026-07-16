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

  const accessStatus = await requireAccessOrRespond({ req, res, spreadAccess: 'member', spreadKey: 'horseshoe' });
  if (!accessStatus) return;

  const { cards, question } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 7) {
    return res.status(400).json({ error: 'Invalid cards data: Expected 7 cards' });
  }

  const isEn = isEnglishRequest(req);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 判断是否有用户问题
  const hasQuestion = question && question.trim().length > 0;

  // 牌位名称（固定顺序）
  const positionNames = [
    '过去的影响',
    '当下的状态',
    '隐藏的影响',
    '阻碍与挑战',
    '潜在的发展',
    '行动建议',
    '可能的结果',
  ];

  // 构建系统提示词
  const systemPrompt = hasQuestion
    ? `你是一位专业的塔罗解读师，擅长围绕用户的具体问题展开深度解读。

你的解读风格：
- 温和、清晰、偏口语化
- 不制造焦虑，不做命运宣判
- 绝对避免使用"一定/注定/必然/肯定会/百分百/无法改变/应该/必须"等绝对化、指令式措辞
- 给出可供参考的提醒或方向，而非直接替用户下结论
- 提供情绪安抚与现实可执行的建议

【解读要求】
1. 解读必须围绕用户输入的问题展开
2. 结合马蹄铁牌阵的 7 个牌位含义 + 每张牌的正逆位，对该问题进行分析
3. 解释每张牌在其牌位上如何影响该问题。每张牌都要讲清楚：它在当前位置说明什么、现实中可能怎样表现、为什么会影响用户的问题、用户可以观察或调整什么
4. 不给 Yes/No 的强行判断，保持温和表述
5. 禁止在正文中使用英文牌名，必须使用中文译名
6. 禁止使用"这张牌"等生硬指代，应直接使用牌名
7. 必须结合至少 2 组牌面关系进行综合判断，说明哪些牌彼此呼应、补充或形成转折，不能把 7 张牌写成互不相关的 7 段牌义
8. 区分牌面提醒与现实事实。对无法仅凭牌面确认的原因，使用“可能、比较像、建议留意、可以检查一下”等表达，不把推测写成已经发生的事实

【输出风格】
- 使用自然、口语化的中文，像一位有经验的解读师在面对面交流；句子不要过长
- 不空谈玄学和宿命论
- 提供实用的思考角度和行动建议
- 包含现实提醒与情绪安抚
- 避免只写“价值呈现、价值主张、资源调配、协调性、需求脱节、转化闭环、情感连接、社群感、价值交换、核心定位”等抽象词。如果确实需要表达这些意思，必须紧接着换成普通人能直接听懂的具体说法或生活场景
- 少用空泛评价，多写用户可能遇到的具体情况；不要为了增加字数重复同一个结论
- 先直接回应用户最关心的问题，再解释牌面依据。行动建议按轻重缓急表达，让用户知道先关注什么

【温柔提醒要求】
- 有问题：根据用户问题和牌面情况，给出贴合问题的鼓励与提醒（如：感情问题→相信自己的节奏；工作问题→每一步都在累积经验）
- 无问题：通用鼓励，强调真正改变来自自己的选择与行动
- 语气温和、口语化，不说教，约40-60字`
    : `你是一位专业的塔罗解读师，擅长通用解读模式。

你的解读风格：
- 温和、清晰、偏口语化
- 不制造焦虑，不做命运宣判
- 绝对避免使用"一定/注定/必然/肯定会/百分百/无法改变/应该/必须"等绝对化、指令式措辞
- 不假设具体场景（如感情/事业/财富）
- 提供情绪安抚与现实可执行的建议

【解读要求】
1. 采用「通用解读模式」
2. 解读只基于马蹄铁牌阵的 7 个牌位本身的含义与每张牌的正逆位
3. 不假设用户处于何种具体情境
4. 解读目标：
   - 描述当下整体状态与能量趋势
   - 点出 7 张牌之间的关系或共通主题
   - 给出温和、不绝对的整体提醒和行动建议
5. 禁止在正文中使用英文牌名，必须使用中文译名
6. 禁止使用"这张牌"等生硬指代，应直接使用牌名
7. 每张牌都要讲清楚：它在当前位置说明什么、现实中可能怎样表现、会带来什么影响、用户可以观察什么
8. 必须结合至少 2 组牌面关系进行综合判断，不能把 7 张牌写成互不相关的 7 段牌义
9. 不把牌面推测写成现实事实，使用“可能、比较像、建议留意”等温和表达

【输出风格】
- 使用自然、口语化的中文，像一位有经验的解读师在面对面交流；句子不要过长
- 不空谈玄学和宿命论
- 提供通用的思考角度和行动建议
- 避免只写“价值呈现、价值主张、资源调配、协调性、需求脱节、转化闭环、情感连接、社群感、价值交换、核心定位”等抽象词。如果必须使用，要马上换成普通人能直接听懂的具体说法
- 少用空泛评价，多写可能出现的具体感受或表现；不要为了增加字数重复同一个结论

【温柔提醒要求】
- 通用鼓励，强调牌只是提醒能量流动，真正的改变来自用户自己的选择与行动
- 语气温和、口语化，不说教，约40-60字`;

  // 构建牌面描述
  const cardsDescription = cards
    .map((card: any, idx: number) => 
      `第${idx + 1}张牌（${positionNames[idx]}）：${card.name}（${card.orientation === 'upright' ? '正位' : '逆位'}）`
    )
    .join('\n');

  // 构建用户提示词
  const userPrompt = hasQuestion
    ? `【问题定向解读模式 - 马蹄铁牌阵】

用户问题：${question}

抽到的牌：
${cardsDescription}

请根据以上信息生成一次完整、连贯的解读。
这是会员付费深度解读，不是简短摘要。整体解读约 400-600 字，每张牌解读约 180-260 字；内容要充实，但不要重复凑字数。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
- cards 中的英文牌名请自动翻译为准确的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚者）
- cards 数组必须严格包含 7 项，position 必须依次为 1、2、3、4、5、6、7，一张都不能省略
- 每张牌的正逆位必须与“抽到的牌”完全一致，不能自行改变，也不能同时解释正位和逆位

{
  "overall": "整体解读（先用通俗的话直接回应用户的问题，再串联至少2组牌面关系，讲清过去、当下、阻碍、发展与结果之间怎样一步步演进；区分牌面提示和现实事实）",
  "cards": [
    {
      "position": 1,
      "position_name": "过去的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "结合用户问题说明牌在此位置代表什么、现实中可能怎样表现、如何影响目前状况，以及用户可以回头观察什么。开头直接使用'[正位/逆位]的[中文牌名]出现在过去的影响位，比较像是...'格式。"
    },
    {
      "position": 2,
      "position_name": "当下的状态",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "结合用户问题说明当前最明显的状态，用具体、易懂的现实表现解释，并说明它怎样影响事情。"
    },
    {
      "position": 3,
      "position_name": "隐藏的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明用户可能尚未注意到的影响，同时保留其他可能解释，不把推测写成事实，并给出可观察的信号。"
    },
    {
      "position": 4,
      "position_name": "阻碍与挑战",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这是核心牌位。用通俗、具体的方式讲清主要困难、它为什么会卡住事情，以及用户怎样判断这一困难是否符合现实。"
    },
    {
      "position": 5,
      "position_name": "潜在的发展",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明按照当前状态继续发展时可能出现的变化，同时指出哪些前提或选择可能改变这个趋势。"
    },
    {
      "position": 6,
      "position_name": "行动建议",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "根据牌意给出有先后顺序、现实可行的行动方向，重点说明最先可以做的一件事，避免空泛口号。"
    },
    {
      "position": 7,
      "position_name": "可能的结果",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明在当前条件下较可能出现的结果，以及促成或阻碍这个结果的关键条件；强调这是趋势，不是保证。"
    }
  ],
  "tips": [
    "一句现实提醒（提醒用户关注某个方面或警惕某种倾向）",
    "一句行动建议（具体、可执行的行动方向）",
    "一句情绪安抚（温柔、口语化，强调选择权在自己手中）"
  ],
  "reminder": "一句温柔的结尾提示。需要根据用户的问题和牌面情况，给出贴合问题的鼓励与提醒。语气温和、口语化，强调改变来自用户自己的选择与行动。约40-60字。"
}`
    : `【通用解读模式 - 马蹄铁牌阵】

用户未输入具体问题。

抽到的牌：
${cardsDescription}

请根据以上信息生成一次完整、连贯的通用解读。
这是会员付费深度解读，不是简短摘要。整体解读约 400-600 字，每张牌解读约 180-260 字；内容要充实，但不要重复凑字数。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
- cards 中的英文牌名请自动翻译为准确的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚者）
- cards 数组必须严格包含 7 项，position 必须依次为 1、2、3、4、5、6、7，一张都不能省略
- 每张牌的正逆位必须与“抽到的牌”完全一致，不能自行改变，也不能同时解释正位和逆位

{
  "overall": "整体解读（先用通俗的话概括核心信息，再串联至少2组牌面关系，讲清过去、当下、阻碍、发展与结果之间怎样一步步演进）",
  "cards": [
    {
      "position": 1,
      "position_name": "过去的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明牌在此位置代表什么、现实中可能怎样表现、会带来什么影响，以及用户可以回头观察什么。开头直接使用'[正位/逆位]的[中文牌名]出现在过去的影响位，比较像是...'格式。"
    },
    {
      "position": 2,
      "position_name": "当下的状态",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明当前最明显的状态，用具体、易懂的表现解释，并说明它可能带来的影响。"
    },
    {
      "position": 3,
      "position_name": "隐藏的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明用户可能尚未注意到的影响，保留其他可能解释，并给出可观察的信号。"
    },
    {
      "position": 4,
      "position_name": "阻碍与挑战",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这是核心牌位。用通俗、具体的方式讲清主要困难、它为什么会卡住事情，以及怎样判断是否符合现实。"
    },
    {
      "position": 5,
      "position_name": "潜在的发展",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明按照当前状态继续发展时可能出现的变化，同时指出哪些选择可能改变这个趋势。"
    },
    {
      "position": 6,
      "position_name": "行动建议",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "根据牌意给出有先后顺序、现实可行的行动方向，重点说明最先可以做的一件事。"
    },
    {
      "position": 7,
      "position_name": "可能的结果",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "说明在当前条件下较可能出现的结果，以及促成或阻碍这个结果的关键条件；强调这是趋势，不是保证。"
    }
  ],
  "tips": [
    "一句现实提醒（提醒关注某个方面或警惕某种倾向）",
    "一句行动建议（通用、可执行的行动方向）",
    "一句情绪安抚（温柔、口语化，强调选择权在自己手中）"
  ],
  "reminder": "一句温柔的结尾提示。通用的鼓励，不涉及具体问题，强调牌只是提醒能量流动，真正的改变来自用户自己的选择与行动。语气温和、口语化。约40-60字。"
}`;

  try {
    let reading: any = null;

    // 偶尔模型会漏掉牌位。最多自动重试一次，避免把残缺的付费结果展示给用户。
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryReminder = attempt === 0
        ? ''
        : '\n\n上一次输出不完整。请重新生成，并再次确认 cards 数组严格包含 position 1 到 7 的全部七项，正逆位与输入完全一致。';

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
        const parsed = parseAIJson(content);
        const hasAllPositions = Array.isArray(parsed?.cards)
          && parsed.cards.length === 7
          && parsed.cards.every((item: any, index: number) => Number(item?.position) === index + 1);

        if (hasAllPositions) {
          reading = parsed;
          break;
        }

        console.error('Incomplete horseshoe reading returned by AI:', {
          attempt: attempt + 1,
          cardCount: Array.isArray(parsed?.cards) ? parsed.cards.length : 0,
        });
      } catch (parseError: unknown) {
        if (parseError instanceof AIJsonParseError) {
          console.error('JSON parse error:', parseError.message);
        } else {
          console.error('Unexpected parse error:', parseError);
        }
      }
    }

    if (!reading) {
      throw new Error('AI 返回的牌阵解读不完整，请重试');
    }

    try {
      await recordSuccessfulReading({
        accessStatus,
        spreadType: 'horseshoe',
        featureKey: 'horseshoe',
        question: question || null,
        cards,
        readingResult: reading,
        resultPath: '/reading/general/horseshoe/reading',
      });
      return res.status(200).json(reading);
    } catch (recordError: unknown) {
      console.error('Failed to record horseshoe reading:', recordError);
      throw recordError;
    }
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
