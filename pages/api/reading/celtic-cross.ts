import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供实用的思考角度和行动建议
- 包含现实提醒与情绪安抚

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

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供通用的思考角度

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

输出 JSON 结构：
{
  "overall": "string (整体概况，围绕用户问题展开，约 250-380 字)",
  "cards": [
    {"position": 1, "positionTitle": "现状", "interpretation": "string (该牌在该牌位下针对用户问题的解读，约 90-140 字)"},
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
  "actionAdvice": "string (具体可做的 3-5 条建议，约 120-200 字，自然语言段落)",
  "reminder": "string (理性提醒，强调选择与行动，约 40-70 字)"
}`
    : `你是一个温柔、口语化且理性克制的塔罗解读师。请根据"凯尔特十字牌阵"的10个牌位含义，对以下10张牌做【通用解读】。注意：用户没有提出具体问题，所以不要代入具体事件，只解读牌面含义与该牌位的象征意义（包含正/逆位差异）。

请严格按以下 JSON 结构输出（只输出 JSON，不要任何额外文字），并且不要出现英文（包括牌名也要翻译成中文）。
禁止使用" 一定/注定/必然/肯定会/百分百/无法改变 "等绝对化表达。

牌位说明：
1 现状；2 阻碍；3 重点；4 过去；5 优势；6 近期；7 应对；8 提醒；9 期待恐惧；10 走向。

10张牌如下（按牌位顺序）：
${cardsDescription}

输出 JSON 结构：
{
  "overall": "string (整体概况，只解读牌面含义，不代入具体问题，约 220-320 字)",
  "cards": [
    {"position": 1, "positionTitle": "现状", "interpretation": "string (该牌在该牌位下的通用解读，约 90-140 字)"},
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
    const content = data.choices[0].message.content;
    
    // 记录原始返回内容用于调试
    console.log('DeepSeek raw response:', content);
    
    try {
      const reading = JSON.parse(content);
      return res.status(200).json(reading);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('AI 返回的内容格式有误，请重试');
    }
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
