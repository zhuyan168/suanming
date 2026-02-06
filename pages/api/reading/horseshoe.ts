import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, question } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 7) {
    return res.status(400).json({ error: 'Invalid cards data: Expected 7 cards' });
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
3. 解释每张牌在其牌位上如何影响该问题
4. 不给 Yes/No 的强行判断，保持温和表述
5. 禁止在正文中使用英文牌名，必须使用中文译名
6. 禁止使用"这张牌"等生硬指代，应直接使用牌名

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供实用的思考角度和行动建议
- 包含现实提醒与情绪安抚`
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

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供通用的思考角度和行动建议`;

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
字数要求：整体解读约 250-350 字，每张牌解读约 80-120 字。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
- cards 中的英文牌名请自动翻译为准确的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚者）

{
  "overall": "整体解读（先回应用户问题，再综合 7 张牌的信息给出分析，强调过去-当下-未来的演进关系）",
  "cards": [
    {
      "position": 1,
      "position_name": "过去的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。开头直接使用'[正位/逆位]的[中文牌名]在过去的影响位显示...'格式。"
    },
    {
      "position": 2,
      "position_name": "当下的状态",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。"
    },
    {
      "position": 3,
      "position_name": "隐藏的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。"
    },
    {
      "position": 4,
      "position_name": "阻碍与挑战",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。这是核心牌位，需要重点关注。"
    },
    {
      "position": 5,
      "position_name": "潜在的发展",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。"
    },
    {
      "position": 6,
      "position_name": "行动建议",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。给出可执行的行动方向。"
    },
    {
      "position": 7,
      "position_name": "可能的结果",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "针对该问题，这张牌在此牌位的具体解读。强调这是可能性，不是注定。"
    }
  ],
  "tips": [
    "一句现实提醒（提醒用户关注某个方面或警惕某种倾向）",
    "一句行动建议（具体、可执行的行动方向）",
    "一句情绪安抚（温柔、口语化，强调选择权在自己手中）"
  ]
}`
    : `【通用解读模式 - 马蹄铁牌阵】

用户未输入具体问题。

抽到的牌：
${cardsDescription}

请根据以上信息生成一次完整、连贯的通用解读。
字数要求：整体解读约 250-350 字，每张牌解读约 80-120 字。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
- cards 中的英文牌名请自动翻译为准确的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚者）

{
  "overall": "整体解读（描述当下整体状态与能量趋势，点出 7 张牌之间的关系或共通主题，强调过去-当下-未来的演进关系）",
  "cards": [
    {
      "position": 1,
      "position_name": "过去的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。开头直接使用'[正位/逆位]的[中文牌名]在过去的影响位显示...'格式。"
    },
    {
      "position": 2,
      "position_name": "当下的状态",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。"
    },
    {
      "position": 3,
      "position_name": "隐藏的影响",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。"
    },
    {
      "position": 4,
      "position_name": "阻碍与挑战",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。这是核心牌位，需要重点关注。"
    },
    {
      "position": 5,
      "position_name": "潜在的发展",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。"
    },
    {
      "position": 6,
      "position_name": "行动建议",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。给出通用的行动方向。"
    },
    {
      "position": 7,
      "position_name": "可能的结果",
      "card_name_cn": "（中文牌名）",
      "orientation_cn": "正位/逆位",
      "interpretation": "这张牌在此牌位的通用解读。强调这是可能性，不是注定。"
    }
  ],
  "tips": [
    "一句现实提醒（提醒关注某个方面或警惕某种倾向）",
    "一句行动建议（通用、可执行的行动方向）",
    "一句情绪安抚（温柔、口语化，强调选择权在自己手中）"
  ]
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
