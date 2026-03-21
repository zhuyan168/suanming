/**
 * Robustly extract and parse JSON from AI (DeepSeek) responses.
 *
 * Handles common failure modes:
 *  - ```json ... ``` markdown code blocks
 *  - Leading/trailing prose around the JSON object
 *  - BOM characters or invisible whitespace
 *  - null / undefined / empty content
 */
export function parseAIJson<T = Record<string, unknown>>(raw: unknown): T {
  if (raw === null || raw === undefined) {
    throw new AIJsonParseError('AI 返回内容为空', String(raw));
  }

  let text = typeof raw === 'string' ? raw : JSON.stringify(raw);

  // Strip BOM & zero-width chars
  text = text.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 1) Try direct parse first (fast path)
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through to sanitisation
  }

  // 2) Strip ```json ... ``` wrapper (single or triple backticks)
  const codeBlockRe = /```(?:json)?\s*([\s\S]*?)```/i;
  const cbMatch = text.match(codeBlockRe);
  if (cbMatch) {
    try {
      return JSON.parse(cbMatch[1].trim()) as T;
    } catch {
      // fall through
    }
  }

  // 3) Extract the outermost { ... } or [ ... ]
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startChar: '{' | '[' | null = null;
  let endChar: '}' | ']' | null = null;
  let startIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startChar = '{';
    endChar = '}';
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startChar = '[';
    endChar = ']';
    startIdx = firstBracket;
  }

  if (startChar && endChar && startIdx !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let endIdx = -1;

    for (let i = startIdx; i < text.length; i++) {
      const ch = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === startChar) depth++;
      if (ch === endChar) depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }

    if (endIdx !== -1) {
      const candidate = text.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // 4) Try fixing trailing commas before closing braces/brackets
        const fixed = candidate
          .replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(fixed) as T;
        } catch {
          // fall through
        }
      }
    }
  }

  throw new AIJsonParseError('AI 返回的内容格式有误，请重试', text);
}

export class AIJsonParseError extends Error {
  public readonly rawContent: string;
  constructor(message: string, rawContent: string) {
    super(message);
    this.name = 'AIJsonParseError';
    this.rawContent = rawContent;
  }
}
