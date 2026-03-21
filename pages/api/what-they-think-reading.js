// API Route: POST /api/what-they-think-reading
// 调用 DeepSeek Chat API 生成「对方在想什么」牌阵解读

// 牌阵固定结构（6张）
const POSITION_LABELS = [
  'TA 对你说出口的态度',
  'TA 内心真正的想法',
  'TA 内心深处的真实感受',
  'TA 对你的实际行动',
  '正在影响 TA 的外在因素',
  '这段关系的短期走向',
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

import { requireAccessOrRespond, recordReadingHistory } from '../../lib/accessServer';
import { parseAIJson } from '../../lib/parseAIJson';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const accessStatus = await requireAccessOrRespond({ req, res, spreadAccess: 'free' });
  if (!accessStatus) return;

  try {
    const { cards, locale = 'zh' } = req.body;

    // 校验 cards.length === 6
    if (!cards || !Array.isArray(cards) || cards.length !== 6) {
      return res.status(400).json({ ok: false, error: '需要提供 6 张卡牌' });
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
    const systemPrompt = `你是一个擅长塔罗情绪解读的占卜师，但你不会做绝对预言。你会温柔、具体、可执行地回应用户的焦虑；不使用夸张承诺；会提醒现实边界。`;

    // 构建 user prompt
    const userPrompt = `我在做一个 6 张牌阵「对方在想什么」。请基于以下 6 张牌（含正逆位）输出严格 JSON，遵循 SpreadReading 结构。

牌阵位置固定为：
1 ${POSITION_LABELS[0]}
2 ${POSITION_LABELS[1]}
3 ${POSITION_LABELS[2]}
4 ${POSITION_LABELS[3]}
5 ${POSITION_LABELS[4]}
6 ${POSITION_LABELS[5]}

卡牌数据（数组）：
${cardsInfo}

写作要求：
- 用中文
- 用"你"的口吻对用户说话（温柔但直接）
- 每个位置 reading 1-2 段，具体一点：描述"可能的心理/动机/矛盾点"，并给用户一个"怎么理解/怎么应对"
- overall 只写 1 段，给一个清晰主线，概括整体情况
- shortTerm.trend 写 1 段，总结短期（2-3个月内）最可能的发展趋势
- shortTerm.advice 给 3 条短句建议（可执行、具体、贴近现实）
- shortTerm.watchFor 给 3 个观察点（例如：TA是否主动联系、回应速度变化、是否兑现承诺等）
- disclaimer 1 句温柔提醒（非医疗/法律/绝对预言）
- 避免：肯定式承诺（如"一定会复合/一定会联系"），避免PUA式话术
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
    }
  ],
  "shortTerm": {
    "trend": "短期走向总结（1段）",
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

    let readingData;
    try {
      readingData = parseAIJson(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Content:', content);
      
      try {
        console.log('Attempting to fix JSON...');
        readingData = await fixMalformedJSON(apiKey, content);
        console.log('JSON fixed successfully');
      } catch (fixError) {
        console.error('JSON fix failed:', fixError);
        return res.status(500).json({ ok: false, error: '解析解读数据失败，请重试' });
      }
    }

    if (accessStatus.userId) {
      await recordReadingHistory({
        userId: accessStatus.userId,
        spreadType: 'what-they-think',
        cards,
        readingResult: readingData,
        resultPath: '/themed-readings/love/what-they-think/result'
      });
    }

    // 返回成功响应
    return res.status(200).json({ ok: true, reading: readingData });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ ok: false, error: '服务器内部错误' });
  }
}

