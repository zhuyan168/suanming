import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from './supabaseServer';
import { SpreadAccess } from './spreads';
import { isUserMember } from './access';

export type ApiAccessReason = 'not_logged_in' | 'daily_limit' | 'member_only';

export interface ApiAccessStatus {
  allowed: boolean;
  isMember: boolean;
  reason?: ApiAccessReason;
  remaining: number;
  userId?: string;
}

/** Fallback timezone when the client sends nothing or an invalid value. */
const FALLBACK_TIMEZONE = 'UTC';
const DEFAULT_FREE_LIMIT = 3;

/**
 * Validate an IANA timezone string received from the client.
 * Returns the original string if valid, FALLBACK_TIMEZONE otherwise.
 */
function sanitizeTimezone(tz: unknown): string {
  if (typeof tz !== 'string' || !tz.trim()) return FALLBACK_TIMEZONE;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz.trim();
  } catch {
    console.warn(`[accessServer] Invalid timezone "${tz}", falling back to ${FALLBACK_TIMEZONE}`);
    return FALLBACK_TIMEZONE;
  }
}

function parseCookies(cookieHeader?: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(part => {
    const [rawName, rawValue] = part.split('=');
    if (!rawName) return;
    const name = rawName.trim();
    const value = rawValue?.trim() || '';
    cookies[name] = value;
  });
  return cookies;
}

function getAccessTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  if (cookies['sb-access-token']) {
    return cookies['sb-access-token'];
  }

  return null;
}

/**
 * Compute the UTC ISO string for 00:00:00 of "today" in the given IANA timezone.
 *
 * Uses `timeZoneName: 'shortOffset'` which always outputs "GMT+H", "GMT-H", or
 * "GMT+H:MM" (never abbreviated names like "PDT"), making offset parsing reliable
 * across all Node.js versions regardless of ICU data.
 *
 * Math:
 *   local midnight in UTC = Date.UTC(local year, month, day) − offsetMinutes × 60 s
 *   e.g. UTC+8:  Date.UTC(2025-03-21) − 480 min = 2025-03-20T16:00:00Z  ✓
 *        UTC-7:  Date.UTC(2025-03-20) − (−420 min) = 2025-03-20T07:00:00Z ✓
 */
function getTodayStartIso(timeZone: string): string {
  const now = new Date();

  // Step 1 — local calendar date in target timezone (en-CA = YYYY-MM-DD)
  const localDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  // Step 2 — current UTC offset via shortOffset ("GMT+8", "GMT-7", "GMT+5:30", "UTC")
  const tzPart =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(now)
      .find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';

  // Step 3 — parse offset string into signed minutes
  const match = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  let offsetMinutes = 0;
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = Number(match[2]);
    const minutes = match[3] ? Number(match[3]) : 0;
    offsetMinutes = sign * (hours * 60 + minutes);
  }

  // Step 4 — UTC timestamp for local midnight
  const [year, month, day] = localDateStr.split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day) - offsetMinutes * 60 * 1_000;
  return new Date(utcMidnight).toISOString();
}

async function countTodayFreeReadings(userId: string, timeZone: string): Promise<number> {
  const todayStart = getTodayStartIso(timeZone);
  const { count, error } = await supabaseService
    .from('reading_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart);
  if (error) {
    console.error('[accessServer] countTodayFreeReadings failed:', error);
    return 0;
  }
  return count ?? 0;
}

export async function recordReadingHistory(params: {
  userId: string;
  spreadType: string;
  question?: string | null;
  cards?: any;
  readingResult?: any;
  resultPath: string;
}): Promise<void> {
  const { userId, spreadType, question, cards, readingResult, resultPath } = params;
  try {
    const { error } = await supabaseService.from('reading_history').insert({
      user_id: userId,
      spread_type: spreadType,
      question: question ?? null,
      cards: cards ?? null,
      reading_result: readingResult ?? null,
      result_path: resultPath
    });
    if (error) {
      console.error('[accessServer] recordReadingHistory failed:', error);
    }
  } catch (err) {
    console.error('[accessServer] recordReadingHistory exception:', err);
  }
}

export async function ensureAccessForRequest(params: {
  req: NextApiRequest;
  spreadAccess?: SpreadAccess;
  freeDailyLimit?: number;
}): Promise<ApiAccessStatus> {
  const { req, spreadAccess = 'free', freeDailyLimit = DEFAULT_FREE_LIMIT } = params;

  // Extract and validate the IANA timezone sent by the client (?tz=Asia/Shanghai).
  // Falls back to FALLBACK_TIMEZONE ('UTC') when absent or invalid.
  const rawTz = Array.isArray(req.query.tz) ? req.query.tz[0] : req.query.tz;
  const timeZone = sanitizeTimezone(rawTz);

  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return {
      allowed: false,
      isMember: false,
      reason: 'not_logged_in',
      remaining: freeDailyLimit
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    console.error('[accessServer] supabase user fetch failed:', userError);
    return {
      allowed: false,
      isMember: false,
      reason: 'not_logged_in',
      remaining: freeDailyLimit
    };
  }

  const { data: profile } = await supabaseService
    .from('profiles')
    .select('membership_expires_at, is_member')
    .eq('id', user.id)
    .single();

  const memberFlag = isUserMember(profile);

  if (spreadAccess === 'member' && !memberFlag) {
    return {
      allowed: false,
      isMember: false,
      reason: 'member_only',
      remaining: 0,
      userId: user.id
    };
  }

  if (memberFlag) {
    return {
      allowed: true,
      isMember: true,
      remaining: Number.POSITIVE_INFINITY,
      userId: user.id
    };
  }

  const todayCount = await countTodayFreeReadings(user.id, timeZone);
  const remaining = freeDailyLimit - todayCount;

  if (todayCount >= freeDailyLimit) {
    return {
      allowed: false,
      isMember: false,
      reason: 'daily_limit',
      remaining: 0,
      userId: user.id
    };
  }

  return {
    allowed: true,
    isMember: false,
    remaining,
    userId: user.id
  };
}

const ACCESS_DENIED_MESSAGES: Record<ApiAccessReason | 'unknown', { status: number; message: string }> = {
  not_logged_in: { status: 401, message: '请先登录以继续占卜' },
  daily_limit: { status: 403, message: '今日免费次数已用完，请明天或开通会员' },
  member_only: { status: 403, message: '该牌阵为会员专属，请开通会员后使用' },
  unknown: { status: 403, message: '权限校验未通过' },
};

export async function requireAccessOrRespond(params: {
  req: NextApiRequest;
  res: NextApiResponse;
  spreadAccess?: SpreadAccess;
  freeDailyLimit?: number;
}): Promise<ApiAccessStatus | null> {
  const { req, res, spreadAccess, freeDailyLimit } = params;
  const status = await ensureAccessForRequest({
    req,
    spreadAccess,
    freeDailyLimit,
  });

  if (status.allowed) {
    return status;
  }

  const reason = status.reason ?? 'unknown';
  const meta = ACCESS_DENIED_MESSAGES[reason] || ACCESS_DENIED_MESSAGES.unknown;
  res.status(meta.status).json({ error: meta.message });
  return null;
}
