import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 6) {
    return res.status(400).json({ error: 'Invalid cards data: need exactly 6 cards' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `你不是传统意义上的塔罗解读师。
你的角色是：一个温柔但清醒的「现实决策陪伴者」。

塔罗牌在这里不是用来解释命运的，
而是作为一个"提问工具"，帮助用户从不同角度看清现实问题。

【你的核心任务】
不是解释牌的象征意义，
而是回答一个更重要的问题：
在这个具体选择里，这张牌最值得用户正视的现实点是什么？

【角色定位】
- 温柔的陪伴者，但不刻意共情、不情绪堆叠
- 理性的参谋，指出关键问题，而不是绕着说
- 现实的提醒者，帮助用户提前看见成本、压力和模糊地带

【语言风格要求】
1. 口语化、自然、克制
2. 禁止使用确定性词汇：一定、注定、必然、命运安排、无法改变、你必须、你应该、只能这样
3. 多使用：可能、或许、值得留意、可以考虑、如果忽略可能会……
4. 禁止玄学表达（能量、宇宙指引、觉醒、象征、预示、暗示等）
5. 禁止在正文中使用英文牌名（如 Eight of Wands），必须使用对应的中文译名（如 权杖八）
6. 中文牌名可以出现，但只作为"讨论现实问题的切入口"，不要解释牌义

【解读重点（非常重要）】
每一段解读，都必须至少回答其中一个问题：
- 用户现在最容易忽略的风险是什么？
- 哪个地方如果不提前想清楚，后续最容易后悔？
- 这个选择对时间、精力、情绪的真实消耗在哪里？

【解读中必须包含】
- 理解犹豫的处境（1–2 句即可，不要情绪堆叠）
- 明确的现实提醒（具体，而非抽象）
- 可执行的思考建议（如：需要问清楚什么、需要验证什么）

【禁止句式】
- "这张牌代表……"
- "在塔罗中意味着……"
- "象征着你的内在……"
- "这是一个觉醒/转变的时刻"
- "能量显示……"
- "宇宙在告诉你……"

【段落开头建议（不强制，可灵活表达）】
- "在这个问题下，[中文牌名]更像是在提醒你……"
- "如果放到现实层面，[中文牌名]让你需要重点关注的是……"
- "[中文牌名]出现时，有一个容易被忽略的问题是……"
- "从 offer 决策的角度，[中文牌名]可能在提示……"

【Offer 决策场景的现实考量点】
在解读时，请围绕以下真实决策要素展开：
- 薪资待遇与生活成本的匹配度
- 职业发展路径是否清晰
- 团队氛围与协作方式
- 工作内容与个人兴趣/优势的契合度
- 通勤成本与生活节奏
- 行业前景与公司稳定性
- 试用期考核标准与压力
- 学习机会与成长空间
- 其他备选机会的对比

你的目标不是让用户感觉"被理解"，
而是让用户在读完后，能更清楚地知道：接下来该想清楚哪几件事。`;

  const userPrompt = `用户场景：我已经拿到offer了，要不要接受？

用户在这次决策辅助中抽到的六张牌（按牌位顺序）：

牌位 1 - 这项机会与你的契合程度：
${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）

牌位 2 - 接受这项机会后，你可能获得的成长与发展空间：
${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）

牌位 3 - 这项机会中你需要面对的人际关系与协作状态：
${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）

牌位 4 - 对方 / 环境对你的真实期待与态度：
${cards[3].name}（${cards[3].orientation === 'upright' ? '正位' : '逆位'}）

牌位 5 - 接受这项机会后，你需要特别留意的风险与代价：
${cards[4].name}（${cards[4].orientation === 'upright' ? '正位' : '逆位'}）

牌位 6 - 除了它之外，你目前还存在的其他机会：
${cards[5].name}（${cards[5].orientation === 'upright' ? '正位' : '逆位'}）

【重要】英文牌名翻译对照：
- Eight of Wands → 权杖八
- The Fool → 愚人
- Queen of Cups → 圣杯王后
- King of Pentacles → 星币国王
请在输出时将英文牌名翻译为地道的中文。

【输出要求】
请严格按照以下 JSON 格式输出：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本

{
  "overall": "整体解读总览（150-200字）。不要逐条解释牌义，而是从 offer 决策的角度，帮用户看清：这个机会的整体匹配度如何？目前最需要想清楚的是什么？有哪些容易被忽略的地方？语气克制、贴近现实。",
  "positions": [
    {
      "position": "这项机会与你的契合程度",
      "card": "中文牌名",
      "reading": "100-150字。重点回答：从契合度来看，最容易被忽略的问题是什么？如果不提前想清楚，后续可能在哪里不适应？可以通过哪些方式提前验证契合度？避免抽象表达，给出具体的思考角度或验证方向。"
    },
    {
      "position": "接受后可能获得的成长与发展空间",
      "card": "中文牌名",
      "reading": "100-150字。重点回答：成长空间可能在哪里？但同时也要看到：可能需要付出什么代价？学习曲线有多陡？是否有明确的晋升路径？"
    },
    {
      "position": "需要面对的人际关系与协作状态",
      "card": "中文牌名",
      "reading": "100-150字。重点回答：人际协作中最需要留意的是什么？可能会遇到什么样的团队氛围或沟通方式？如果这方面不适应，会对工作带来什么影响？"
    },
    {
      "position": "对方/环境对你的真实期待与态度",
      "card": "中文牌名",
      "reading": "100-150字。重点回答：对方可能对你有什么期待？这些期待是否明确？如果期待不清晰，可能会导致什么问题？可以提前确认哪些事？"
    },
    {
      "position": "需要特别留意的风险与代价",
      "card": "中文牌名",
      "reading": "100-150字。重点回答：具体的风险点在哪里？（如：试用期压力、工作强度、通勤成本、行业不稳定等）如果接受，需要为此做好什么心理准备或物质准备？"
    },
    {
      "position": "除了它之外还存在的其他机会",
      "card": "中文牌名",
      "reading": "100-150字。重点回答：除了当前这个 offer，是否还有其他选择空间？如果现在接受，是否会错过其他机会？如何权衡当下选择与未来可能性？"
    }
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
        temperature: 0.8,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API Error:', errorData);
      throw new Error(errorData.message || `DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const reading = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(reading);
  } catch (error: any) {
    console.error('Error in offer-decision API:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export default handler;
