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

  const accessStatus = await requireAccessOrRespond({ req, res, spreadAccess: 'member', spreadKey: 'celtic-cross' });
  if (!accessStatus) return;

  const { cards, question } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 10) {
    return res.status(400).json({ error: 'Invalid cards data: Expected 10 cards' });
  }

  // TODO: 会员验证预留接口
  // 接入会员系统后，在此处验证用户会员状态
  // 示例代码：
  // const userId = req.headers['x-user-id'] || req.cookies.userId;
  // const isMember = await checkMembershipStatus(userId);
  // if (!isMember) {
  //   return res.status(403).json({ 
  //     error: 'Membership required',
  //     message: '此功能需要会员权限'
  //   });
  // }

  const isEn = isEnglishRequest(req);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 判断是否有用户问题
  const hasQuestion = question && question.trim().length > 0;

  // 牌位名称（固定顺序，按用户要求）
  const positionNames = [
    '现状',
    '阻碍',
    '重点',
    '过去',
    '优势',
    '近期',
    '应对',
    '提醒',
    '期待恐惧',
    '走向',
  ];

  // 构建系统提示词
  const systemPrompt = hasQuestion
    ? `你是一位温柔、口语化且理性克制的塔罗解读师，擅长围绕用户的具体问题展开深度解读。

你的解读风格：
- 温柔、口语化、理性克制
- 不制造焦虑，不做命运宣判
- 绝对禁止使用"一定/注定/必然/肯定会/百分百/无法改变"等绝对化表达
- 给出可供参考的提醒或方向，而非直接替用户下结论
- 提供情绪安抚与现实可执行的建议

【解读要求】
1. 解读必须围绕用户输入的问题展开
2. 结合凯尔特十字牌阵的 10 个牌位含义 + 每张牌的正逆位，对该问题进行分析
3. 解释每张牌在其牌位上如何影响该问题
4. 不给 Yes/No 的强行判断，保持温和表述
5. 禁止在正文中使用英文牌名，必须使用中文译名
6. 禁止使用"这张牌"等生硬指代，应直接使用牌名
7. 每张牌都要说明：当前位置的含义、现实中可能出现的表现、它对问题的影响，以及用户可以观察什么
8. 必须串联至少 3 组牌面关系，说明不同牌之间的呼应、矛盾或转折，不能写成 10 段互不相关的牌义
9. 不把牌面推测写成现实事实，使用“可能、比较像、建议留意、可以核对一下”等表达

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供实用的思考角度和行动建议
- 包含现实提醒与情绪安抚
- 像面对面聊天一样使用短句和常用词。避免只写“价值呈现、资源调配、协调性、需求脱节、转化闭环、情感连接、核心定位”等抽象词；如需表达，必须马上换成普通人能理解的具体场景
- 不重复同一个结论凑字数，先直接回应问题，再解释判断依据

【温柔提醒要求】
- 根据用户问题和牌面情况，给出贴合问题的鼓励与提醒
- 语气温和、口语化，不说教，约40-70字`
    : `你是一位温柔、口语化且理性克制的塔罗解读师，擅长通用解读模式。

你的解读风格：
- 温柔、口语化、理性克制
- 不制造焦虑，不做命运宣判
- 绝对禁止使用"一定/注定/必然/肯定会/百分百/无法改变"等绝对化表达
- 不假设具体场景（如感情/事业/财富）
- 提供情绪安抚与现实可执行的建议

【解读要求】
1. 采用「通用解读模式」
2. 解读只基于凯尔特十字牌阵的 10 个牌位本身的含义与每张牌的正逆位
3. 不假设用户处于何种具体情境
4. 不要强行代入具体问题，只解读牌面含义
5. 解读目标：
   - 描述当下整体状态与能量趋势
   - 点出 10 张牌之间的关系或共通主题
   - 给出温和、不绝对的整体提醒
6. 禁止在正文中使用英文牌名，必须使用中文译名
7. 禁止使用"这张牌"等生硬指代，应直接使用牌名
8. 每张牌都要说明当前位置的含义、可能出现的现实感受或表现，以及用户可以观察什么
9. 必须串联至少 3 组牌面关系，不能写成 10 段互不相关的牌义
10. 不把牌面推测写成现实事实，使用“可能、比较像、建议留意”等表达

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供通用的思考角度
- 像面对面聊天一样使用短句和常用词，抽象概念必须换成普通人能理解的具体说法
- 不重复同一个结论凑字数

【温柔提醒要求】
- 通用鼓励，强调选择与行动
- 语气温和、口语化，不说教，约40-70字`;

  // 构建牌面描述
  const cardsDescription = cards
    .map((card: any, idx: number) => 
      `${idx + 1}：${card.name}（${card.orientation === 'upright' ? '正位' : '逆位'}）`
    )
    .join('\n');

  // 构建用户提示词
  const userPrompt = hasQuestion
    ? `你是一个温柔、口语化且理性克制的塔罗解读师。用户提出了一个问题，请你结合"凯尔特十字牌阵"的10个牌位含义，对10张牌进行解读，并且所有解读都要围绕用户问题展开（包含正/逆位差异）。

用户问题：
${question}

请严格按以下 JSON 结构输出（只输出 JSON，不要任何额外文字），并且不要出现英文（包括牌名也要翻译成中文）。
禁止使用" 一定/注定/必然/肯定会/百分百/无法改变 "等绝对化表达。

牌位说明：
1 现状；2 阻碍；3 重点；4 过去；5 优势；6 近期；7 应对；8 提醒；9 期待恐惧；10 走向。

10张牌如下（按牌位顺序）：
${cardsDescription}

这是会员付费深度解读，不是简短摘要。整体解读约 450-650 字，每张牌约 180-260 字，行动建议约 250-400 字。cards 必须严格包含 position 1 到 10 的全部十项，一张都不能省略。正逆位必须与输入完全一致，不能自行改变或同时解释两种方向。

输出 JSON 结构：
{
  "overall": "string (先直接回应问题，再串联至少3组牌面关系，讲清现状、根源、阻碍、内外因素和走向之间的联系，约 450-650 字)",
  "cards": [
    {"position": 1, "positionTitle": "现状", "interpretation": "string (说明当前位置含义、现实表现、对问题的影响和可观察信号，约 180-260 字)"},
    {"position": 2, "positionTitle": "阻碍", "interpretation": "string"},
    {"position": 3, "positionTitle": "重点", "interpretation": "string"},
    {"position": 4, "positionTitle": "过去", "interpretation": "string"},
    {"position": 5, "positionTitle": "优势", "interpretation": "string"},
    {"position": 6, "positionTitle": "近期", "interpretation": "string"},
    {"position": 7, "positionTitle": "应对", "interpretation": "string"},
    {"position": 8, "positionTitle": "提醒", "interpretation": "string"},
    {"position": 9, "positionTitle": "期待恐惧", "interpretation": "string"},
    {"position": 10, "positionTitle": "走向", "interpretation": "string"}
  ],
  "actionAdvice": "string (按先后顺序给出具体可做的 3-5 条建议，约 250-400 字，自然语言段落)",
  "reminder": "string (理性提醒，强调选择与行动，约 40-70 字)"
}`
    : `你是一个温柔、口语化且理性克制的塔罗解读师。请根据"凯尔特十字牌阵"的10个牌位含义，对以下10张牌做【通用解读】。注意：用户没有提出具体问题，所以不要代入具体事件，只解读牌面含义与该牌位的象征意义（包含正/逆位差异）。

请严格按以下 JSON 结构输出（只输出 JSON，不要任何额外文字），并且不要出现英文（包括牌名也要翻译成中文）。
禁止使用" 一定/注定/必然/肯定会/百分百/无法改变 "等绝对化表达。

牌位说明：
1 现状；2 阻碍；3 重点；4 过去；5 优势；6 近期；7 应对；8 提醒；9 期待恐惧；10 走向。

10张牌如下（按牌位顺序）：
${cardsDescription}

这是会员付费深度解读，不是简短摘要。整体解读约 400-600 字，每张牌约 180-260 字。cards 必须严格包含 position 1 到 10 的全部十项，一张都不能省略。正逆位必须与输入完全一致，不能自行改变或同时解释两种方向。

输出 JSON 结构：
{
  "overall": "string (串联至少3组牌面关系，讲清整体状态怎样发展，约 400-600 字)",
  "cards": [
    {"position": 1, "positionTitle": "现状", "interpretation": "string (说明当前位置含义、可能出现的现实表现和可观察信号，约 180-260 字)"},
    {"position": 2, "positionTitle": "阻碍", "interpretation": "string"},
    {"position": 3, "positionTitle": "重点", "interpretation": "string"},
    {"position": 4, "positionTitle": "过去", "interpretation": "string"},
    {"position": 5, "positionTitle": "优势", "interpretation": "string"},
    {"position": 6, "positionTitle": "近期", "interpretation": "string"},
    {"position": 7, "positionTitle": "应对", "interpretation": "string"},
    {"position": 8, "positionTitle": "提醒", "interpretation": "string"},
    {"position": 9, "positionTitle": "期待恐惧", "interpretation": "string"},
    {"position": 10, "positionTitle": "走向", "interpretation": "string"}
  ],
  "reminder": "string (理性提醒，强调选择与行动，约 40-70 字)"
}`;

  try {
    let reading: any = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryReminder = attempt === 0 ? '' : '\n\n上一次输出不完整。请重新生成，并确认 cards 严格包含 position 1 到 10 的全部十项，正逆位与输入完全一致。';
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
        max_tokens: 7800,
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
          && parsed.cards.length === 10
          && parsed.cards.every((item: any, index: number) => Number(item?.position) === index + 1);
        if (complete) {
          reading = parsed;
          break;
        }
        console.error('Incomplete celtic-cross reading:', { attempt: attempt + 1, cardCount: parsed?.cards?.length ?? 0 });
      } catch (parseError: unknown) {
        console.error('Invalid celtic-cross JSON:', parseError);
      }
    }

    if (!reading) throw new Error('AI 返回的牌阵解读不完整，请重试');

    try {
      await recordSuccessfulReading({
        accessStatus,
        spreadType: 'celtic-cross',
        featureKey: 'celtic-cross',
        question: question || null,
        cards,
        readingResult: reading,
        resultPath: '/reading/general/celtic-cross/reading',
      });
      return res.status(200).json(reading);
    } catch (recordError: unknown) {
      console.error('Failed to record celtic-cross reading:', recordError);
      throw recordError;
    }
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
