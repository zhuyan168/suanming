import { isEnglishRequest, withAiOutputLanguage } from '../../lib/aiLanguage';
import { requireAccessOrRespond, recordSuccessfulReading } from '../../lib/accessServer';
import { parseAIJson } from '../../lib/parseAIJson';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessStatus = await requireAccessOrRespond({ req, res, spreadAccess: 'member', spreadKey: 'love-reconciliation' });
  if (!accessStatus) return;

  try {
    const { cards } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 10) {
      return res.status(400).json({ error: '需要提供10张卡牌信息' });
    }

    const isEn = isEnglishRequest(req);

  const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    // 构建卡牌信息字符串
    const cardsInfo = cards.map((card, index) => {
      const orientationText = card.isReversed ? '逆位' : '正位';
      const keywords = card.keywords ? card.keywords.join('、') : '';
      return `牌位 ${index + 1} [${card.slotName}]：
- 牌名：${card.cardName}
- 正逆位：${orientationText}
- 关键词：${keywords}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `你是一位温柔、知性且富有共情力的塔罗占卜师。
你的任务是：根据「复合可能性牌阵」的抽牌结果，为纠结于过去关系的用户提供温暖、清晰、口语化且具有现实帮助的复合指引。

【重要风格要求】
- 语气：温和、自然、尊重，像一位可靠的朋友陪用户把事情想清楚，但不过度亲昵。
- 口语化：禁止使用“能量场”、“维度”、“潜意识投射”、“因果法则”等生硬词汇。
- 比喻化：用生活中的琐事来比喻感情。比如“就像鞋里进了沙子，虽然还能走，但总归是不舒服”，而不是说“存在不可调和的内在矛盾”。
- 重点：理解用户的难过，但不默认用户性别、对方性别、性取向或关系角色。统一使用“用户、你、对方、前任、TA”等中性表达。
- 目标：让用户感觉到被理解，同时也清楚接下来可以观察什么、核对什么、怎样照顾自己。
- 禁止使用“宝贝、亲爱的、甜心、姑娘、姐姐、sweetie”等过度亲昵称呼；禁止把用户称为“女人/男人”，禁止擅自使用“他/她、him/her”。
- 禁止使用“宇宙在告诉你、命运安排、注定、一定、肯定会、不会回来”等宿命或确定性表达。
- 对前任的想法只能表述为牌面提供的一种可能视角，使用“可能、比较像、建议通过现实沟通确认”，不能声称已经知道对方真实想法。
  
【牌阵说明】
本次使用的牌阵为「复合可能性牌阵」，共 10 张牌，含义如下：
1. 这段关系是如何走散的（当初真正分开的原因）
2. 你当前的情绪状态与纠结来源（用户当下的痛点）
3. 前任目前的真实状态（TA现在对这段关系的真实立场）
4. 你内心对复合的感受（用户内心深处真实的渴望与恐惧）
5. 前任内心对复合的感受（TA对复合这件事的真实态度）
6. 你们之间最大的阻碍是什么（核心矛盾）
7. 对你有利的帮助或转机（可能的支持力量）
8. 被你忽略的重要因素（被情绪遮蔽的客观事实）
9. 你需要做出的选择（最终的功课）
10. 指引牌（整体的智慧点拨）

【输入数据】
本次抽牌结果如下：

${cardsInfo}

【输出要求】
请严格以 JSON 格式输出，结构如下（不要输出多余文本，不要使用 Markdown 代码块标记）：

{
  "sections": [
    {
      "slotKey": "p1",
      "title": "这段关系是如何走散的",
      "text": "120-180字解读，温柔地剖析分开的真实无奈"
    },
    {
      "slotKey": "p2",
      "title": "你当前的情绪状态与纠结来源",
      "text": "120-180字解读，理解用户可能存在的不甘和难过，但不假设性别"
    },
    {
      "slotKey": "p3",
      "title": "前任目前的真实状态",
      "text": "120-180字解读，用平实的语言描述对方现在的想法"
    },
    {
      "slotKey": "p4",
      "title": "你内心对复合的感受",
      "text": "120-180字解读，温和地指出用户可能还没放下的点"
    },
    {
      "slotKey": "p5",
      "title": "前任内心对复合的感受",
      "text": "120-180字解读，客观说明对方可能的态度及需要通过现实沟通确认的部分"
    },
    {
      "slotKey": "p6",
      "title": "你们之间最大的阻碍是什么",
      "text": "120-180字解读，像讲故事一样说明那个最现实的问题"
    },
    {
      "slotKey": "p7",
      "title": "对你有利的帮助或转机",
      "text": "120-180字解读，给用户一些具体、现实的观察或调整方向"
    },
    {
      "slotKey": "p8",
      "title": "被你忽略的重要因素",
      "text": "120-180字解读，温和提醒用户可能没注意到的因素，不把推测称为真相"
    },
    {
      "slotKey": "p9",
      "title": "你需要做出的选择",
      "text": "120-180字解读，给她一个明确但体贴的建议"
    },
    {
      "slotKey": "guide",
      "title": "指引牌",
      "text": "150-200字解读，温暖但克制地总结，不使用宿命论或过度亲昵称呼"
    }
  ],
  "summary": {
    "title": "治愈寄语",
    "text": "用一句话温柔地戳中核心，给她力量"
  },
  "actions": [
    { "text": "一条具体的、关于如何处理与对方沟通的建议" },
    { "text": "一条具体的、关于如何安顿自己情绪的建议" },
    { "text": "一条关于是否采取下一步行动的温婉建议" }
  ]
}

【额外规则】
- 不要出现任何“AI、模型、提示词、数据”等破坏氛围的词。
- sections 必须严格包含 p1 到 p9 和 guide 共 10 项，顺序一致，一项都不能省略；牌名和正逆位必须与输入一致。
- 强调：语言亲切、自然、通俗易懂，但保持边界感，不以“疗愈”为名替用户或对方下结论。
  
请开始解读。`;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位温和、自然、尊重边界的塔罗解读师。使用性别中立表达，不使用过度亲昵称呼、宿命论或确定性判断，帮助用户结合现实信息思考。',
          },
          {
            role: 'user',
            content: withAiOutputLanguage(userMessage, isEn),
          },
        ],
        temperature: 0.75,
        max_tokens: 6000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return res.status(500).json({ error: 'DeepSeek API 调用失败' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: '未能获取有效响应' });
    }

    let readingData;
    try {
      readingData = parseAIJson(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(500).json({ error: '解析解读数据失败' });
    }

    const expectedSlotKeys = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'guide'];
    const complete = Array.isArray(readingData?.sections)
      && readingData.sections.length === expectedSlotKeys.length
      && readingData.sections.every((item, index) => item?.slotKey === expectedSlotKeys[index]);
    if (!complete) {
      return res.status(500).json({ error: 'AI 返回的牌阵解读不完整，请重试' });
    }

    await recordSuccessfulReading({
      accessStatus,
      spreadType: 'reconciliation',
      featureKey: 'love-reconciliation',
      cards,
      readingResult: readingData,
      resultPath: '/themed-readings/love/reconciliation/result',
    });

    return res.status(200).json(readingData);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

