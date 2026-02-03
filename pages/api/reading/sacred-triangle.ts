import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cards, question } = req.body;

  if (!cards || !Array.isArray(cards) || cards.length !== 3) {
    return res.status(400).json({ error: 'Invalid cards data' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 判断是否有用户问题
  const hasQuestion = question && question.trim().length > 0;

  // 圣三角牌位含义
  const positionMeanings = [
    '过去/问题/现状',
    '现在/原因/阻碍',
    '未来/建议/方向'
  ];

  // 构建系统提示词
  const systemPrompt = `你是一位专业的塔罗解读师，温柔、清晰、务实。

【核心原则】
- 不制造焦虑，不做命运宣判
- 禁止使用绝对化措辞：一定/注定/必然/肯定会/百分百/无法改变
- 语气温和、口语化，但必须落地可执行
- 不空谈玄学，提供实用思考角度

【圣三角牌阵的分工逻辑】
三张牌必须严格分工，不得重复同一主题：
- 牌1（过去/问题/现状｜源头）：追溯问题的源头与形成原因，描述最早的失衡点
- 牌2（现在/原因/阻碍｜卡点与动作）：指出当下最具体的卡点，给出1-3条可执行建议
- 牌3（未来/建议/方向｜风险与节奏）：描述不调整可能的压力/风险，给出心态与节奏管理建议

【重要约束】
1. 三张牌内容不得重复同一主题超过一次（例如都在说焦虑/动力不足）
2. 每张牌必须回答不同的问题：
   - 牌1回答：问题最早从哪里开始？
   - 牌2回答：现在具体卡在哪里？下一步做什么？
   - 牌3回答：不调整会有什么后果？怎么稳住节奏与心态？
3. 牌名必须使用中文，不要出现英文
4. 不使用"这张牌"等生硬指代，直接使用牌名`;

  // 构建用户提示词
  const questionText = hasQuestion ? question : '未输入具体问题';
  const modeInstruction = hasQuestion 
    ? '请围绕该问题进行解读，三张牌的建议需贴近问题场景（例如：产品推进→MVP/节奏/验证；人际关系→沟通方式/边界/期待管理）。' 
    : '请做通用能量趋势解读，不要假设具体事件背景。牌2的建议保持通用可执行（例如：任务拆分、优先级、节奏、边界）。';

  const userPrompt = `你是一个温柔、清晰、务实的塔罗解读者。请根据圣三角三张牌阵解读，并严格输出 JSON（不要 markdown，不要多余文字，不要出现英文，牌名必须中文）。

【重要】三张牌必须"分工明确、递进清晰"，不得重复同一主题。

【用户问题】
${questionText}

${modeInstruction}

【牌信息】
牌1（过去/问题/现状｜源头）：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
牌2（现在/原因/阻碍｜卡点与当下动作）：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
牌3（未来/建议/方向｜风险与节奏）：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）

【每张牌的任务分工】
牌1（源头）：问题最早从哪里开始？当时的能量是什么？形成原因是什么？（不写太多现在动作，140-200字）
牌2（卡点与动作）：现在具体卡在哪里？给出1-3条可执行建议（可以用短句列出，140-200字）
牌3（风险与节奏）：如果不调整可能出现什么压力/风险？如何管理节奏、边界与心态？不要复述第2张的执行细节（140-200字）

【整体解读要求】
- overall.summary：用3-5句话串联三张牌的递进关系（220-320字）
- overall.priority：一句话优先级建议——先做什么，再做什么（30-60字）

【严格输出以下 JSON 格式】
{
  "overall": {
    "summary": "整体解读，必须串联三张牌的递进关系",
    "priority": "一句话优先级建议：先做什么"
  },
  "cards": [
    {
      "index": 1,
      "positionMeaning": "${positionMeanings[0]}",
      "role": "源头",
      "interpretation": "只讲源头与形成原因，开头用'[正位/逆位]的[中文牌名]'格式"
    },
    {
      "index": 2,
      "positionMeaning": "${positionMeanings[1]}",
      "role": "卡点与当下动作",
      "interpretation": "指出当下卡点并给1-3条可执行建议"
    },
    {
      "index": 3,
      "positionMeaning": "${positionMeanings[2]}",
      "role": "风险与节奏",
      "interpretation": "强调不调整的后果 + 如何管理压力/边界/节奏"
    }
  ],
  "reminder": "一句温柔、口语化的收尾提醒。不要用'记住'开头，直接用温和的语气鼓励用户，强调他们自己的选择和行动才是关键。"
}

【最后检查】
- 三张牌没有重复同一主题（例如都在讲焦虑）
- 英文牌名已翻译成中文
- 没有绝对化措辞
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
