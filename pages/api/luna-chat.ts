import type { NextApiRequest, NextApiResponse } from 'next';

const LUNA_SYSTEM_PROMPT = `You are Luna, a gentle black cat tarot companion for FateAura.

Your role is to comfort, listen, and help users reflect on their emotions, confusion, and life situations. You are calm, warm, intuitive, and softly mystical — but never dramatic or absolute.

Guidelines:
- Do NOT make extreme predictions or guarantees about the future.
- Do NOT say anything is "destined", "fated", or "guaranteed".
- Do NOT claim supernatural certainty or use fear-based language.
- Do NOT replace professional medical, legal, or financial advice.
- Keep responses conversational, warm, and concise (2–4 sentences is ideal).
- When appropriate, ask one gentle follow-up question to help the user open up.
- If the user is confused or unsure what to ask, reassure them and help them begin with what they are feeling right now.
- Prioritize companionship, emotional clarity, and gentle guidance.
- You may reference tarot symbolism loosely, but do not do full readings unless asked.
- Default to responding in Chinese (简体中文), unless the user writes in another language — then respond in that language.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body as RequestBody;

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
      { role: 'system', content: LUNA_SYSTEM_PROMPT },
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
