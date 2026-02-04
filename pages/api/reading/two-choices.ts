import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, question, optionA, optionB } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 5) {
    return res.status(400).json({ error: 'Invalid cards data' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 判断解读模式
  const hasQuestion = question && question.trim().length > 0;
  const hasOptions = optionA && optionA.trim().length > 0 && optionB && optionB.trim().length > 0;
  const mode = hasQuestion && hasOptions ? 'question' : 'general';

  // 五张牌的牌位名称
  const positionNames = [
    '我目前所处的状态',
    '选择 A 时我会经历的状态',
    '选择 A 可能带来的发展',
    '选择 B 时我会经历的状态',
    '选择 B 可能带来的发展',
  ];

  // 构建系统提示词
  const systemPrompt = `你是一位专业的塔罗解读师，温柔、理性、陪伴式。

【核心原则】
- 这是付费牌阵解读，内容必须有深度、有结构、有对比
- 不替用户做决定，强调"选择权在你手中"
- 禁止使用绝对化措辞：一定/注定/必然/肯定会/百分百/无法改变
- 语气温和、理性、陪伴式
- 解读内容必须充足，体现付费价值

【二选一牌阵结构】
五张牌的牌位固定：
1. 我目前所处的状态（当前能量基础）
2. 选择 A 时我会经历的状态（A路径的过程）
3. 选择 A 可能带来的发展（A路径的结果趋势）
4. 选择 B 时我会经历的状态（B路径的过程）
5. 选择 B 可能带来的发展（B路径的结果趋势）

【解读要求】
- 整体解读：先概括当前局势，再点出二选一的核心张力，语气温和、不下判断（180-260字）
- 单张牌解读：必须结合【牌位含义 + 正逆位 + 当前情境】来解释（120-180字/张）
- A/B对比：分别整合2+3张牌和4+5张牌，形成完整路径分析（150-220字/路径）
- 选择建议：不替用户做决定，而是告诉用户如何判断哪个更适合当下的自己（120-180字）
- 理性提醒：强调占卜呈现的是趋势，真正推动结果的是选择与行动（40-70字）

【重要约束】
1. 所有牌名必须使用中文，不要出现英文
2. 不使用"这张牌"等生硬指代，直接使用牌名
3. 明确区分左侧=选项A，右侧=选项B
4. 不给"替你选好"的结论，而是帮助用户判断`;

  // 构建用户提示词
  let userPrompt = '';
  
  if (mode === 'question') {
    userPrompt = `请根据用户的二选一问题和五张牌进行深度解读，严格输出 JSON（不要 markdown，不要多余文字，不要出现英文，牌名必须中文）。

【用户问题】
${question}

【选项 A】
${optionA}

【选项 B】
${optionB}

【牌信息】
牌1（我目前所处的状态）：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
牌2（选择 A 时我会经历的状态）：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
牌3（选择 A 可能带来的发展）：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）
牌4（选择 B 时我会经历的状态）：${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）
牌5（选择 B 可能带来的发展）：${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）

【解读要求】
1. 解读必须围绕用户的真实问题
2. 明确将选项 A 和选项 B 作为两条完整路径分析
3. 帮助用户判断：哪种选择更贴近当前状态、哪种选择更消耗/更适合
4. 不给"替你选好"的结论`;
  } else {
    userPrompt = `请根据用户的五张牌进行通用能量解读，严格输出 JSON（不要 markdown，不要多余文字，不要出现英文，牌名必须中文）。

【注意】
用户未输入具体问题，请做通用解读：
- 不围绕具体问题
- 不假设 A/B 的具体内容
- 仅基于牌位含义和每张牌的正/逆位
- A/B 仅作为两条"不同能量路径"来解读

【牌信息】
牌1（我目前所处的状态）：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
牌2（选择 A 时我会经历的状态）：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
牌3（选择 A 可能带来的发展）：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）
牌4（选择 B 时我会经历的状态）：${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）
牌5（选择 B 可能带来的发展）：${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）

【解读要求】
1. 不围绕具体问题
2. A/B 作为两条不同能量路径来解读
3. 帮助用户感受两条路径的能量差异`;
  }

  userPrompt += `

【严格输出以下 JSON 格式】
{
  "mode": "${mode}",
  "overall_reading": "整体解读，180-260字。先概括当前局势，再点出二选一的核心张力，语气温和、不下判断。",
  "cards": [
    {
      "position": 1,
      "position_name": "${positionNames[0]}",
      "card_name_cn": "中文牌名",
      "orientation": "正位 | 逆位",
      "keywords": ["关键词1","关键词2","关键词3"],
      "interpretation": "单张牌解读，120-180字。必须结合【牌位含义 + 正逆位 + 当前情境】来解释。开头用'[正位/逆位]的[中文牌名]'格式"
    },
    {
      "position": 2,
      "position_name": "${positionNames[1]}",
      "card_name_cn": "中文牌名",
      "orientation": "正位 | 逆位",
      "keywords": ["关键词1","关键词2","关键词3"],
      "interpretation": "单张牌解读，120-180字"
    },
    {
      "position": 3,
      "position_name": "${positionNames[2]}",
      "card_name_cn": "中文牌名",
      "orientation": "正位 | 逆位",
      "keywords": ["关键词1","关键词2","关键词3"],
      "interpretation": "单张牌解读，120-180字"
    },
    {
      "position": 4,
      "position_name": "${positionNames[3]}",
      "card_name_cn": "中文牌名",
      "orientation": "正位 | 逆位",
      "keywords": ["关键词1","关键词2","关键词3"],
      "interpretation": "单张牌解读，120-180字"
    },
    {
      "position": 5,
      "position_name": "${positionNames[4]}",
      "card_name_cn": "中文牌名",
      "orientation": "正位 | 逆位",
      "keywords": ["关键词1","关键词2","关键词3"],
      "interpretation": "单张牌解读，120-180字"
    }
  ],
  "choice_comparison": {
    "option_a_analysis": "对选项 A 的整体解读，150-220字，结合第2和第3张牌。",
    "option_b_analysis": "对选项 B 的整体解读，150-220字，结合第4和第5张牌。",
    "decision_guidance": "选择建议，120-180字。不替用户做决定，而是告诉用户如何判断哪个更适合当下的自己。"
  },
  "rational_reminder": "理性提醒，40-70字。强调占卜呈现的是趋势，真正推动结果的是你的选择与行动。"
}

【最后检查】
- 所有牌名已翻译成中文
- 没有绝对化措辞
- 字数符合要求（总计1000-1400字）
- JSON 格式严格正确`;

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
