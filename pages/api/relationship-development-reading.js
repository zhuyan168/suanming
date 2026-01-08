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
    const systemPrompt = `你是一个擅长塔罗关系解读的占卜师，但你不会做绝对预言。你会温柔、具体、可执行地回应用户对感情关系的疑问；不使用夸张承诺；会提醒现实边界。`;

    // 构建 user prompt
    const userPrompt = `我在做一个 8 张牌阵「这段感情的发展」。请基于以下 8 张牌（含正逆位）输出严格 JSON，遵循 SpreadReading 结构。

牌阵位置固定为：
1 ${POSITION_LABELS[0]}
2 ${POSITION_LABELS[1]}
3 ${POSITION_LABELS[2]}
4 ${POSITION_LABELS[3]}
5 ${POSITION_LABELS[4]}
6 ${POSITION_LABELS[5]}
7 ${POSITION_LABELS[6]}
8 ${POSITION_LABELS[7]}

卡牌数据（数组）：
${cardsInfo}

写作要求：
- 用中文
- 用"你"的口吻对用户说话（温柔但直接）
- 每个位置 reading 1-2 段，具体一点：描述"可能的状态/动机/模式"，并给用户一个"怎么理解/怎么面对"
- overall 只写 1 段，给一个清晰主线，概括整体关系状态
- guidance.trend 写 1 段，总结如果保持当前状态，关系会往哪里走
- guidance.advice 给 3 条短句建议（可执行、具体、贴近现实、不要过度承诺）
- guidance.watchFor 给 3 个观察点（例如：TA的言行是否一致、你自己的真实感受变化、相处中的舒适度等）
- disclaimer 1 句温柔提醒（非医疗/法律/绝对预言）
- 避免：肯定式承诺（如"一定会在一起/一定会分手"），避免PUA式话术
- 认真对待情绪，不油腻不套话，不做绝对断言
- 只能输出 JSON，不能输出任何多余文本、不能 markdown、不能代码块

JSON 结构（严格遵循）：
{
  "title": "一句话主题",
  "overall": "总览（1段）",
  "positions": [
    {
      "position": 1,
      "label": "${POSITION_LABELS[0]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 2,
      "label": "${POSITION_LABELS[1]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 3,
      "label": "${POSITION_LABELS[2]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 4,
      "label": "${POSITION_LABELS[3]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 5,
      "label": "${POSITION_LABELS[4]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 6,
      "label": "${POSITION_LABELS[5]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 7,
      "label": "${POSITION_LABELS[6]}",
      "reading": "对应位置解读（1-2段）"
    },
    {
      "position": 8,
      "label": "${POSITION_LABELS[7]}",
      "reading": "对应位置解读（1-2段）"
    }
  ],
  "guidance": {
    "trend": "关系走向总结（1段）",
    "advice": ["建议1", "建议2", "建议3"],
    "watchFor": ["观察点1", "观察点2", "观察点3"]
  },
  "disclaimer": "温柔免责声明（1句）"
}

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

