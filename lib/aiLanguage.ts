import type { NextApiRequest } from 'next';

export function isEnglishRequest(req: NextApiRequest): boolean {
  const bodyLocale = typeof req.body?.locale === 'string' ? req.body.locale : '';
  const queryLocale = typeof req.query?.locale === 'string' ? req.query.locale : '';
  const locale = bodyLocale || queryLocale;

  if (locale.toLowerCase().startsWith('en')) return true;
  if (locale.toLowerCase().startsWith('zh')) return false;

  const referer = req.headers.referer || '';
  return /\/en(\/|$)/.test(referer);
}

const ENGLISH_OUTPUT_RULES = `

LANGUAGE OVERRIDE FOR THIS REQUEST:
- Write the entire user-facing reading in natural, localized English.
- Do not output Chinese text anywhere in JSON values.
- Keep the required JSON keys exactly as requested, but translate all titles, card names, positions, explanations, summaries, advice, and disclaimers into English.
- Use English tarot orientation labels: "Upright" and "Reversed".
- Do not mechanically translate Chinese phrasing. Use clear, grounded English suitable for a tarot reflection product.
- Avoid fatalistic or fear-based language. Use possibilities, patterns, reflection, and practical next steps.
- If earlier instructions mention Chinese output or Chinese card names, this language override takes precedence for this request.
`;

export function withAiOutputLanguage(prompt: string, isEn: boolean): string {
  return isEn ? `${prompt}${ENGLISH_OUTPUT_RULES}` : prompt;
}
