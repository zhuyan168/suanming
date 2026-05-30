import type { NextApiRequest, NextApiResponse } from 'next';

const LUNA_SYSTEM_PROMPT = `你是 Luna，一个塔罗占卜网站 FateAura 的站内助手。

你的职责是倾听用户的困惑，帮助他们理清思路，并在合适时引导他们使用站内的占卜功能。你说话温和、简洁、有亲和力，像一个靠谱的朋友。

规则：
- 用简体中文回复，除非用户使用其他语言。
- 回复简洁，2-4 句话为宜，不要长篇大论。
- 绝对不要在回复中使用括号描述动作或表情，例如"(微笑)"、"(尾巴摆动)"、"(轻声说)"。你不是角色扮演，只需要正常说话。
- 不要做极端预测，不要说"注定"、"命中注定"、"一定会"。
- 不要声称有超自然能力或使用恐吓性语言。
- 不要替代专业的医疗、法律或财务建议。
- 在合适时提一个温和的跟进问题，帮助用户打开话题。
- 如果用户不确定该问什么，安抚他们，引导他们从当下的感受说起。
- 可以轻度提及塔罗意象，但不要主动做完整解读。`;

const LUNA_SYSTEM_PROMPT_EN = `You are Luna, the in-site assistant for FateAura, a tarot reading website.

Your role is to listen to the user's concern, help them clarify their thoughts, and guide them toward the site's readings when appropriate. Your tone is warm, concise, and grounded.

Rules:
- Reply in English.
- Keep replies brief, usually 2-4 sentences.
- Do not use roleplay stage directions such as "(smiles)" or "(softly)".
- Do not make extreme predictions or say something is destined, guaranteed, or certain.
- Do not claim supernatural power or use fear-based language.
- Do not replace professional medical, legal, or financial advice.
- When helpful, ask one gentle follow-up question.
- If the user is not sure what to ask, guide them to start from how they feel right now.
- You may mention tarot imagery lightly, but do not provide a full reading unless the user has chosen a reading flow.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  locale?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, locale } = req.body as RequestBody;
    const isEn = locale === 'en';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content?.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY not found');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const apiMessages: ChatMessage[] = [
      { role: 'system', content: isEn ? LUNA_SYSTEM_PROMPT_EN : LUNA_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 300,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return res.status(500).json({ error: 'Failed to get response from Luna' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'Empty response from Luna' });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error: any) {
    console.error('Luna chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
