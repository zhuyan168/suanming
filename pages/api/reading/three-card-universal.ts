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

  // 构建系统提示词
  const systemPrompt = hasQuestion
    ? `你是一位专业的塔罗解读师，擅长围绕用户的具体问题展开深度解读。

你的解读风格：
- 温和、清晰、偏口语化
- 不制造焦虑，不做命运宣判
- 不使用"你应该/你必须/注定"等绝对或指令式语气
- 给出可供参考的提醒或方向，而非直接替用户下结论

【解读要求】
1. 解读必须围绕用户输入的问题展开
2. 结合三张牌及其正逆位，对该问题进行分析
3. 解释三张牌如何从不同角度影响该问题
4. 不给 Yes/No 的强行判断，保持温和表述
5. 禁止在正文中使用英文牌名，必须使用中文译名
6. 禁止使用"这张牌"等生硬指代，应直接使用牌名

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供实用的思考角度`
    : `你是一位专业的塔罗解读师，擅长通用解读模式。

你的解读风格：
- 温和、清晰、偏口语化
- 不制造焦虑，不做命运宣判
- 不使用"你应该/你必须/注定"等绝对或指令式语气
- 不假设具体场景（如感情/事业/财富）

【解读要求】
1. 采用「通用解读模式」
2. 解读只基于三张牌本身的含义与正逆位
3. 不假设用户处于何种具体情境
4. 解读目标：
   - 描述当下整体状态与能量趋势
   - 点出三张牌之间的关系或共通主题
   - 给出温和、不绝对的整体提醒
5. 禁止在正文中使用英文牌名，必须使用中文译名
6. 禁止使用"这张牌"等生硬指代，应直接使用牌名

【输出风格】
- 自然、口语化的中文
- 不空谈玄学和宿命论
- 提供通用的思考角度`;

  // 构建用户提示词
  const userPrompt = hasQuestion
    ? `【问题定向解读模式】

用户问题：${question}

抽到的牌：
第1张牌：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
第2张牌：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
第3张牌：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）

请根据以上信息生成一次完整、连贯的解读。
字数要求：约300-450字。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
- cards 中的英文牌名请自动翻译为准确的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚者）

{
  "overall": "整体解读（先回应用户问题，再综合三张牌的信息给出分析）",
  "cards": [
    {
      "card_name_zh": "中文牌名",
      "position": "第1张牌",
      "reading": "针对该问题，这张牌的具体解读。开头直接使用'[正位/逆位]的[中文牌名]显示...'格式。"
    },
    {
      "card_name_zh": "中文牌名",
      "position": "第2张牌",
      "reading": "针对该问题，这张牌的具体解读。"
    },
    {
      "card_name_zh": "中文牌名",
      "position": "第3张牌",
      "reading": "针对该问题，这张牌的具体解读。"
    }
  ],
  "closing": "一句温柔、口语化的收尾提醒。不要用'记住'开头，直接用温和的语气鼓励用户，强调他们自己的选择和行动才是关键。"
}`
    : `【通用解读模式】

用户未输入具体问题。

抽到的牌：
第1张牌：${cards[0].name}（${cards[0].orientation === 'upright' ? '正位' : '逆位'}）
第2张牌：${cards[1].name}（${cards[1].orientation === 'upright' ? '正位' : '逆位'}）
第3张牌：${cards[2].name}（${cards[2].orientation === 'upright' ? '正位' : '逆位'}）

请根据以上信息生成一次完整、连贯的通用解读。
字数要求：约250-350字。

请【严格按照以下 JSON 格式输出】：
- 不要使用 Markdown
- 不要输出多余解释
- 不要在 JSON 外输出任何文本
- cards 中的英文牌名请自动翻译为准确的中文牌名（例如：Eight of Wands 翻译为 权杖八，The Fool 翻译为 愚者）

{
  "overall": "整体解读（描述当下整体状态与能量趋势，点出三张牌之间的关系或共通主题）",
  "cards": [
    {
      "card_name_zh": "中文牌名",
      "position": "第1张牌",
      "reading": "这张牌的通用解读。开头直接使用'[正位/逆位]的[中文牌名]显示...'格式。"
    },
    {
      "card_name_zh": "中文牌名",
      "position": "第2张牌",
      "reading": "这张牌的通用解读。"
    },
    {
      "card_name_zh": "中文牌名",
      "position": "第3张牌",
      "reading": "这张牌的通用解读。"
    }
  ],
  "closing": "一句温柔、口语化的收尾提醒。不要用'记住'开头，直接用温和的语气陪伴用户，强调真正能带来改变的是他们自己的选择与行动。"
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
