// API Route: POST /api/relationship-development-reading
// 调用 DeepSeek Chat API 生成「这段感情的发展」8张牌阵解读

// 牌阵固定结构（8张）
const POSITION_LABELS = [
  '真实的你',
  '真实的 TA',
  'TA 眼中的你',
  '你眼中的 TA',
  '关系的过去',
  '关系的当下',
  '关系的走向',
  '你的下一步',
];

// 修复 JSON 的辅助函数
async function fixMalformedJSON(apiKey, rawContent) {
  try {
    const fixResponse = await fetch('https://api.deepseek.com/chat/completions', {
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
            content: '你是一个 JSON 修复工具。只输出合法的 JSON，不要任何其他文本。',
          },
          {
            role: 'user',
            content: `以下内容可能是不完整或格式错误的 JSON，请修复它并只输出合法的 JSON：\n\n${rawContent}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        stream: false,
      }),
    });

    if (!fixResponse.ok) {
      throw new Error('Fix request failed');
    }

    const fixData = await fixResponse.json();
    const fixedContent = fixData.choices?.[0]?.message?.content;
    
    if (!fixedContent) {
      throw new Error('No fixed content');
    }

    // 尝试解析修复后的内容
    const jsonMatch = fixedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(fixedContent);
  } catch (err) {
    console.error('JSON fix failed:', err);
    throw new Error('无法修复 JSON 格式');
  }
}

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { cards, locale = 'zh' } = req.body;

    // 校验 cards.length === 8
    if (!cards || !Array.isArray(cards) || cards.length !== 8) {
      return res.status(400).json({ ok: false, error: '需要提供 8 张卡牌' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ ok: false, error: 'API Key 未配置' });
    }

    // 构建卡牌信息字符串
    const cardsInfo = cards.map((card, index) => {
      const position = index + 1;
      const orientationText = card.upright ? '正位' : '逆位';
      const keywords = card.keywords && card.keywords.length > 0 ? card.keywords.join('、') : '无';
      return `- position: ${position}, label: "${POSITION_LABELS[index]}", card: { name: "${card.name}", cnName: "${card.cnName || ''}", upright: ${card.upright}, keywords: [${card.keywords ? card.keywords.map(k => `"${k}"`).join(', ') : ''}] }`;
    }).join('\n');

    // 构建 system prompt
    const systemPrompt = `你是一位情绪敏感度很高、表达克制、不制造焦虑的塔罗解读者。
你的解读目标不是预测感情结局，而是帮助用户理解这段关系正在如何推进、关系中的力量如何流动、以及短期内可能出现的变化趋势。
你严格遵守以下原则：
1. 不使用"一定/注定/必然/命中"等绝对化语言
2. 不替用户做任何决定，也不指导具体行动
3. 不制造焦虑，不放大冲突或恐惧
4. 允许关系处于模糊、反复、尚未定型的状态
5. 解读必须紧密围绕抽到的牌义展开，不脱离牌本身`;

    // 构建 user prompt
    const userPrompt = `现在需要你根据用户实际抽到的牌阵结果，解读一组「感情发展牌阵」。

【输入信息】：
牌阵名称：感情发展牌阵
牌阵位置固定为：
1 ${POSITION_LABELS[0]}
2 ${POSITION_LABELS[1]}
3 ${POSITION_LABELS[2]}
4 ${POSITION_LABELS[3]}
5 ${POSITION_LABELS[4]}
6 ${POSITION_LABELS[5]}
7 ${POSITION_LABELS[6]}
8 ${POSITION_LABELS[7]}

用户抽到的卡牌数据（含正逆位）：
${cardsInfo}

请严格基于以上抽牌结果进行解读，不得编造未出现的牌，也不得跳过或合并牌位。

【表达与风格要求】：
- 语气温和、稳定、有边界感
- 以"观察"和"理解"为核心，而非判断
- 不评价用户的对错或情绪是否合理
- 不把任何一张牌直接定义为"好牌"或"坏牌"
- 不使用命令式、说教式语言
- 使用"观察/倾向/可能/正在形成"等词汇
- 短期趋势使用条件句（如果/当/在某种情况下）

【单张牌解读生成规则】（非常重要）：

你正在为「感情发展牌阵」生成单张牌的解读内容。

【输入信息包括】：
- 当前牌位名称
- 该牌位对应的【隐形解读重点】（见下方说明）
- 实际抽到的塔罗牌名称
- 正位/逆位状态

【8个牌位的隐形解读重点】：
1. 真实的你 → 你内心真实感受，与你表现出来的可能不一致的部分
2. 真实的TA → TA的真实动机和内心状态，可能与表面行为不同
3. TA眼中的你 → 认知差异：TA如何看待你，这份认知是否准确
4. 你眼中的TA → 你对TA的理解是否接近真实，还是带着滤镜或投射
5. 关系的过去 → 这段关系的起点、基础，留下的影响
6. 关系的当下 → 此刻的张力、停滞、或正在发生的互动模式
7. 关系的走向 → 如果保持当前状态，关系自然发展的方向（不是最终结果）
8. 你的下一步 → 面对当前状态，内心可以调整的态度或视角（不是行动指令）

【解读目标】：
用一段 160-190 字左右的自然语言，
将这张牌在"当前关系中"所描述的真实状态说清楚。

这段文字应当让用户：
- 能联想到真实的相处场景
- 感受到一种明确但不被评判的关系状态
- 读完后能记住"这一张牌在说什么"

字数控制（重要）：
- 严格控制在 160-190 字范围内
- 不要少于 160 字
- 不要超过 190 字
- 保持表达精炼，去除冗余描述

【写作要求】：
1. 解读必须围绕该牌位的【隐形解读重点】展开
2. 不拆分小标题，不列点，只输出一段完整文字
3. 语言贴近日常关系中的真实感受与互动
4. 不解释"塔罗牌是什么意思"，而是直接进入关系语境
5. 不给行为指令，不说"你应该/你需要"
6. 语气温柔、疗愈、有陪伴感
7. 口语化，让用户轻松看懂

【允许】：
- 描述状态（例如："你可能感觉..."）
- 描述矛盾（例如："你想靠近，但又..."）
- 描述节奏不一致（例如："你们的节奏..."）
- 描述感受被误读的可能性（例如："TA可能没有完全理解..."）

【禁止】：
- 结果预测（"这段关系一定会..."）
- 情绪安抚套话（"请你放心"、"不必担心"）
- 多重并列分析（"一方面……另一方面……同时……"）
- 泛化总结型句式
- 抽象概念词（内在、层面、维度、能量、底色、本质）
- 塔罗术语感的表达

【关键要求】：
请确保这段解读的"记忆点"，
清晰落在该牌位对应的那一个关系张力上。

例如：
- 牌位3"TA眼中的你"的记忆点 → TA可能误读了你的某种表达
- 牌位6"关系的当下"的记忆点 → 此刻的僵局或犹豫
- 牌位7"关系的走向"的记忆点 → 即将到来的节奏变化

【JSON 输出结构（严格遵循，不可变更顺序）】：

{
  "spreadExplanation": "牌阵整体说明（简要说明这是发展型牌阵，强调顺序代表推进逻辑而非强因果，不出现'最终结果''命中注定'等表述）",
  
  "cardReadings": [
    {
      "position": 1,
      "label": "${POSITION_LABELS[0]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 2,
      "label": "${POSITION_LABELS[1]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 3,
      "label": "${POSITION_LABELS[2]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 4,
      "label": "${POSITION_LABELS[3]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 5,
      "label": "${POSITION_LABELS[4]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 6,
      "label": "${POSITION_LABELS[5]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 7,
      "label": "${POSITION_LABELS[6]}",
      "reading": "150-200字的完整解读文字"
    },
    {
      "position": 8,
      "label": "${POSITION_LABELS[7]}",
      "reading": "150-200字的完整解读文字"
    }
  ],
  
  "integration": {
    "theme": "当前关系的主旋律（综合所有牌，用观察性语言描述）",
    "drivingForce": "推动这段关系的核心力量",
    "tension": "当前最需要被看见的卡点或张力"
  },
  
  "shortTermTrend": "短期发展趋势（只谈短期，使用条件句，不承诺结果。描述关系可能出现的变化方式、节奏上的快/慢/反复、情绪或互动层面的调整）",
  
  "closing": "情绪收尾提醒（一句理解+一句把主动权还给用户的话，不升华、不鸡汤、不说教）"
}

【重要】：
- 每张牌的 4 个维度（meaning, layer, effect, insight）必须都有内容，不能为空
- 所有解读内容必须基于用户实际抽到的牌，紧密结合牌义
- 只输出纯 JSON，不要任何 markdown 标记、代码块标记或其他文本

请开始解读，只输出 JSON。`;

    // 调用 DeepSeek API（设置超时30秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch('https://api.deepseek.com/chat/completions', {
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
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: false,
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ ok: false, error: '请求超时，请稍后重试' });
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(500).json({ ok: false, error: 'DeepSeek API 调用失败' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ ok: false, error: '未能获取有效响应' });
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
      
      // 尝试修复 JSON
      try {
        console.log('Attempting to fix JSON...');
        readingData = await fixMalformedJSON(apiKey, content);
        console.log('JSON fixed successfully');
      } catch (fixError) {
        console.error('JSON fix failed:', fixError);
        return res.status(500).json({ ok: false, error: '解析解读数据失败，请重试' });
      }
    }

    // 返回成功响应
    return res.status(200).json({ ok: true, reading: readingData });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ ok: false, error: '服务器内部错误' });
  }
}

