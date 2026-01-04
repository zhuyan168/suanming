export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body;

    // 验证必需参数
    if (!cards || !Array.isArray(cards) || cards.length !== 6) {
      return res.status(400).json({ error: '需要提供6张卡牌信息' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    // 构建卡牌信息字符串
    const cardsInfo = cards.map((card) => {
      const orientationText = card.isReversed ? '逆位' : '正位';
      const keywords = card.keywords ? card.keywords.join('、') : '';
      return `牌位 ${card.position} [${card.title}]：
- 牌位含义：${card.meaning}
- 牌名：${card.cardName}
- 正逆位：${orientationText}
- 关键词：${keywords}`;
    }).join('\n\n');

    // 构建 prompt
    const userMessage = `你是一位经验丰富、表达克制但温柔的塔罗占卜师。
你的任务是：根据「对方在想什么」牌阵的抽牌结果，为用户提供清晰、具体、克制的关系洞察解读。

【重要风格要求】
- 语气：温柔、清醒、有边界感，不夸张、不制造焦虑
- 避免：绝对化判断（如"一定会""已经不爱了""完全没希望"）
- 多用：可能性、状态描述、识别信号、现实行动建议
- 目标：让用户看完后"更清醒 + 知道接下来可以做什么"，而不是陷入焦虑或幻想
  
【牌阵说明】
本次使用的牌阵为「对方在想什么」牌阵，共 6 张牌，含义如下：
1. TA 对你说出口的态度（表面层）
2. TA 内心真正的想法（理性层）
3. TA 内心深处的真实感受（情感/潜意识层）
4. TA 对你的实际行动（现实层，用来对照前三张）
5. 正在影响 TA 的外在因素（外部干扰）
6. 这段关系的短期走向（2-3个月内的趋势，不做长期承诺）

【输入数据】
本次抽牌结果如下：

${cardsInfo}

【输出要求】
请严格以 JSON 格式输出，结构如下（不要输出多余文本，不要使用 Markdown 代码块标记）：

{
  "sections": [
    {
      "position": 1,
      "title": "TA 对你说出口的态度",
      "text": "120-180字中文解读，描述TA表面表达的态度与立场"
    },
    {
      "position": 2,
      "title": "TA 内心真正的想法",
      "text": "120-180字中文解读，描述TA理性层面的真实思考与判断"
    },
    {
      "position": 3,
      "title": "TA 内心深处的真实感受",
      "text": "120-180字中文解读，描述TA情感/潜意识层面的真实感受"
    },
    {
      "position": 4,
      "title": "TA 对你的实际行动",
      "text": "120-180字中文解读，描述TA在现实中对你采取的行为与反应，并与前三张牌对照分析是否一致"
    },
    {
      "position": 5,
      "title": "正在影响 TA 的外在因素",
      "text": "120-180字中文解读，指出来自现实或他人的外部影响因素"
    },
    {
      "position": 6,
      "title": "这段关系的短期走向",
      "text": "120-180字中文解读，基于当前状态，描述关系在接下来约2-3个月内最可能的发展趋势，避免长期承诺式判断"
    }
  ],
  "summary": {
    "title": "一句话总结",
    "text": "用一句话总结这段关系当下的核心状态（40字以内）"
  }
}

【额外规则】
- 第1张牌（说）、第2张牌（想）、第3张牌（感受）、第4张牌（行动）：
  - 请特别注意比较这四张牌是否一致
  - 如果不一致，温和指出差异，不要下绝对判断
  - 例如："TA说的和想的可能有些差距，这不一定是欺骗，可能是还在理清自己的感受"
  
- 第6张牌（短期走向）：
  - 只做2-3个月内的短期趋势判断
  - 不要使用"命中注定""永远""一定"等强宿命措辞
  - 强调"基于当前状态"，给用户留出行动空间
  
- 不要使用"命运安排""宇宙计划"等强宿命措辞
- 不要提及"AI / 模型 / 提示词"
  
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
            content: '你是一位经验丰富、表达克制但温柔的塔罗占卜师。你的解读温柔、清醒、有边界感，不夸张、不制造焦虑，让用户看完后更清醒并知道接下来可以做什么。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
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

    // 解析 JSON
    let readingData;
    try {
      // 尝试提取 JSON（移除可能的 Markdown 代码块标记）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        readingData = JSON.parse(jsonMatch[0]);
      } else {
        readingData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Content:', content);
      return res.status(500).json({ error: '解析解读数据失败' });
    }

    return res.status(200).json(readingData);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

