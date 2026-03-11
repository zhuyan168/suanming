import type { NextApiRequest, NextApiResponse } from 'next';
import { LUNA_SPREADS } from '../../utils/luna/spreadMatcher';

const SPREAD_LIST = LUNA_SPREADS.map(
  (s) => `- id: "${s.id}" | 名称: ${s.name} | 分类: ${s.category} | 简介: ${s.description}`,
).join('\n');

const SYSTEM_PROMPT = `你是一个塔罗占卜网站的牌阵推荐助手。你的唯一任务是：根据用户的描述，从下面的牌阵列表中选出最合适的一个。

## 可选牌阵列表（你只能从这里面选，不能推荐列表以外的牌阵）：
${SPREAD_LIST}

## 你的输出规则：
1. 只返回一个 JSON 对象，格式为：{"spreadId": "xxx", "reason": "一句话推荐理由"}
2. spreadId 必须是上面列表中的某个 id，不能自己编造
3. reason 用中文，简洁友好，1-2 句话，说明为什么推荐这个牌阵
4. 不要输出任何 JSON 以外的内容，不要加 markdown 代码块标记
5. 如果用户的问题实在无法归类，选 "three-card-universal"`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body as { message: string };

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
        max_tokens: 150,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(500).json({ error: 'AI matching failed' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return res.status(500).json({ error: 'Empty AI response' });
    }

    const parsed = JSON.parse(raw);
    const validIds = new Set(LUNA_SPREADS.map((s) => s.id));

    if (!parsed.spreadId || !validIds.has(parsed.spreadId)) {
      return res.status(200).json({
        spreadId: 'three-card-universal',
        reason: parsed.reason || '你可以先试试通用牌阵，适合任何主题的问题。',
      });
    }

    return res.status(200).json({
      spreadId: parsed.spreadId,
      reason: parsed.reason || '',
    });
  } catch (error: any) {
    console.error('Luna spread match error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
