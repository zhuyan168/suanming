import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from './supabaseServer';
import { SpreadAccess } from './spreads';
import { isUserMember } from './access';
import { checkGuestTrialAccess, checkGuestTrialSession, recordGuestTrialUsage } from './guestTrialAccess';

export type ApiAccessReason =
  | 'not_logged_in'
  | 'daily_limit'
  | 'member_only'
  | 'allowed_by_guest_trial'
  | 'guest_trial_invalid'
  | 'guest_trial_expired'
  | 'guest_trial_limit_exceeded'
  | 'feature_trial_limit_exceeded';

export interface ApiAccessStatus {
  allowed: boolean;
  isMember: boolean;
  reason?: ApiAccessReason;
  remaining: number;
  userId?: string;
  /** Set to 'guest_trial' when access is granted via guest trial session */
  accessType?: 'guest_trial';
  /** The validated guest session ID, forwarded to reading APIs for future usage tracking */
  guestSessionId?: string;
  expiresAt?: string;
  totalUsed?: number;
  featureUsed?: number;
  featureRemaining?: number;
  trackingLocale?: string;
  trackingPagePath?: string;
}

/** Fallback timezone when the client sends nothing or an invalid value. */
const FALLBACK_TIMEZONE = 'UTC';
const DEFAULT_FREE_LIMIT = 3;
const GUEST_TRIAL_COOKIE_NAME = 'guest_trial_session_id';

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

export async function getAuthenticatedUserIdFromRequest(req: NextApiRequest): Promise<string | null> {
  const token = getAccessTokenFromRequest(req);
  if (!token) return null;

  const {
    data: { user },
    error,
  } = await supabaseService.auth.getUser(token);

  if (error || !user) {
    console.error('[accessServer] getAuthenticatedUserIdFromRequest failed:', error);
    return null;
  }

  return user.id;
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

export async function findReadingHistoryByClientRequestId(params: {
  userId: string;
  spreadType: string;
  clientRequestId?: string | null;
}): Promise<any | null> {
  const { userId, spreadType, clientRequestId } = params;
  if (!clientRequestId || typeof clientRequestId !== 'string' || !clientRequestId.trim()) {
    return null;
  }

  try {
    const { data, error } = await supabaseService
      .from('reading_history')
      .select('reading_result')
      .eq('user_id', userId)
      .eq('spread_type', spreadType)
      .filter('reading_result->>clientRequestId', 'eq', clientRequestId.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[accessServer] findReadingHistoryByClientRequestId failed:', error);
      return null;
    }

    return data?.reading_result ?? null;
  } catch (err) {
    console.error('[accessServer] findReadingHistoryByClientRequestId exception:', err);
    return null;
  }
}

export type PeriodicReadingPeriod = 'day' | 'month' | 'season' | 'year';

function getLocalDateParts(timeZone: string): { year: number; month: number; day: number } {
  const now = new Date();
  const localDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [year, month, day] = localDateStr.split('-').map(Number);
  return { year, month, day };
}

function getOffsetMinutesForTimezone(timeZone: string): number {
  const now = new Date();
  const tzPart =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(now)
      .find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';

  const match = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  return sign * (hours * 60 + minutes);
}

function getLocalMidnightUtcIso(timeZone: string, year: number, month: number, day: number): string {
  const offsetMinutes = getOffsetMinutesForTimezone(timeZone);
  const utcMidnight = Date.UTC(year, month - 1, day) - offsetMinutes * 60 * 1_000;
  return new Date(utcMidnight).toISOString();
}

function getPeriodStartIso(period: PeriodicReadingPeriod, timeZone: string): string {
  const { year, month, day } = getLocalDateParts(timeZone);

  if (period === 'day') {
    return getLocalMidnightUtcIso(timeZone, year, month, day);
  }

  if (period === 'month') {
    return getLocalMidnightUtcIso(timeZone, year, month, 1);
  }

  if (period === 'year') {
    return getLocalMidnightUtcIso(timeZone, year, 1, 1);
  }

  if (month >= 3 && month <= 5) {
    return getLocalMidnightUtcIso(timeZone, year, 3, 1);
  }
  if (month >= 6 && month <= 8) {
    return getLocalMidnightUtcIso(timeZone, year, 6, 1);
  }
  if (month >= 9 && month <= 11) {
    return getLocalMidnightUtcIso(timeZone, year, 9, 1);
  }
  if (month === 12) {
    return getLocalMidnightUtcIso(timeZone, year, 12, 1);
  }
  return getLocalMidnightUtcIso(timeZone, year - 1, 12, 1);
}

export async function findPeriodicReadingForUser(params: {
  req: NextApiRequest;
  userId?: string | null;
  spreadTypes: string[];
  period: PeriodicReadingPeriod;
}): Promise<any | null> {
  const { req, userId, spreadTypes, period } = params;
  if (!userId || !spreadTypes.length) return null;

  const rawBodyTz = typeof req.body === 'object' && req.body ? (req.body as any).tz : undefined;
  const rawTz = Array.isArray(req.query.tz) ? req.query.tz[0] : (req.query.tz ?? rawBodyTz);
  const timeZone = sanitizeTimezone(rawTz);
  const periodStart = getPeriodStartIso(period, timeZone);

  try {
    const { data, error } = await supabaseService
      .from('reading_history')
      .select('id, spread_type, question, cards, reading_result, result_path, created_at')
      .eq('user_id', userId)
      .in('spread_type', spreadTypes)
      .gte('created_at', periodStart)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[accessServer] findPeriodicReadingForUser failed:', error);
      return null;
    }

    return data ?? null;
  } catch (err) {
    console.error('[accessServer] findPeriodicReadingForUser exception:', err);
    return null;
  }
}

export async function ensureAccessForRequest(params: {
  req: NextApiRequest;
  spreadAccess?: SpreadAccess;
  freeDailyLimit?: number;
  /** Spread key for per-feature guest trial limit checking */
  spreadKey?: string;
}): Promise<ApiAccessStatus> {
  const { req, spreadAccess = 'free', freeDailyLimit = DEFAULT_FREE_LIMIT, spreadKey: paramSpreadKey } = params;

  // Extract and validate the IANA timezone sent by the client (?tz=Asia/Shanghai).
  // Falls back to FALLBACK_TIMEZONE ('UTC') when absent or invalid.
  const rawTz = Array.isArray(req.query.tz) ? req.query.tz[0] : req.query.tz;
  const timeZone = sanitizeTimezone(rawTz);

  const token = getAccessTokenFromRequest(req);
  if (!token) {
    // No Supabase token — check for guest trial session
    const rawGuestHeader = req.headers['x-guest-session-id'];
    const headerGuestSessionId = Array.isArray(rawGuestHeader) ? rawGuestHeader[0] : (rawGuestHeader ?? null);
    const guestSessionId = headerGuestSessionId || parseCookies(req.headers.cookie)[GUEST_TRIAL_COOKIE_NAME] || null;

    if (!guestSessionId) {
      return { allowed: false, isMember: false, reason: 'not_logged_in', remaining: freeDailyLimit };
    }

    // Resolve spreadKey: param > query param
    const resolvedSpreadKey =
      paramSpreadKey ||
      (Array.isArray(req.query.spreadKey) ? req.query.spreadKey[0] : req.query.spreadKey) ||
      null;

    if (spreadAccess === 'member' && resolvedSpreadKey) {
      // Full check: session + total limit + per-feature limit
      const result = await checkGuestTrialAccess({ sessionId: guestSessionId, spreadKey: resolvedSpreadKey });
      // Use 'in' check for TypeScript to narrow the discriminated union
      const fullDenyReason = ('reason' in result ? result.reason : '') as string;
      if (result.allowed) {
        return {
          allowed: true,
          isMember: false,
          reason: 'allowed_by_guest_trial',
          accessType: 'guest_trial',
          guestSessionId: result.sessionId,
          expiresAt: result.expiresAt,
          totalUsed: result.totalUsed,
          featureUsed: result.featureUsed,
          featureRemaining: result.featureRemaining,
          remaining: result.totalRemaining,
        };
      }
      return {
        allowed: false,
        isMember: false,
        reason: GUEST_TRIAL_DENY_REASON_MAP[fullDenyReason] ?? 'not_logged_in',
        remaining: 0,
        guestSessionId,
      };
    }

    // Member spread without spreadKey, or free spread: lightweight session check
    const sessionResult = await checkGuestTrialSession(guestSessionId);
    const sessionDenyReason = ('reason' in sessionResult ? sessionResult.reason : '') as string;
    if (sessionResult.valid) {
      return {
        allowed: true,
        isMember: false,
        reason: 'allowed_by_guest_trial',
        accessType: 'guest_trial',
        guestSessionId: sessionResult.sessionId,
        expiresAt: sessionResult.expiresAt,
        totalUsed: sessionResult.totalUsed,
        remaining: sessionResult.totalRemaining,
      };
    }
    return {
      allowed: false,
      isMember: false,
      reason: GUEST_TRIAL_DENY_REASON_MAP[sessionDenyReason] ?? 'not_logged_in',
      remaining: 0,
      guestSessionId,
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

/** Maps GuestTrialDenyReason → ApiAccessReason */
const GUEST_TRIAL_DENY_REASON_MAP: Record<string, ApiAccessReason> = {
  missing_session: 'not_logged_in',
  invalid_session: 'guest_trial_invalid',
  expired: 'guest_trial_expired',
  total_limit_exceeded: 'guest_trial_limit_exceeded',
  feature_limit_exceeded: 'feature_trial_limit_exceeded',
};

/** Returns true when the request's Accept-Language header prefers English. */
function isEnglishRequest(req: NextApiRequest): boolean {
  const al = req.headers['accept-language'];
  if (!al || typeof al !== 'string') return false;
  // Accept-Language examples: "en-US,en;q=0.9,zh;q=0.8" / "zh-CN,zh;q=0.9"
  const first = al.split(',')[0].trim().toLowerCase();
  return first.startsWith('en');
}

type DenialMessages = Record<ApiAccessReason | 'unknown', { status: number; zh: string; en: string }>;

const ACCESS_DENIED_MESSAGES: DenialMessages = {
  not_logged_in:              { status: 401, zh: '请先登录以继续占卜',                            en: 'Please log in first.' },
  daily_limit:                { status: 403, zh: '今日免费次数已用完，请明天或开通会员',              en: "You've used all free readings for today. Please come back tomorrow or upgrade to continue." },
  member_only:                { status: 403, zh: '该牌阵为会员专属，请开通会员后使用',               en: 'This reading is available to members only.' },
  allowed_by_guest_trial:     { status: 200, zh: '',                                              en: '' },
  guest_trial_invalid:        { status: 401, zh: '游客试用会话无效，请重新开始试用',                 en: 'Guest trial session is invalid. Please start a new trial.' },
  guest_trial_expired:        { status: 403, zh: '游客试用已过期，注册账号后可继续使用',              en: 'Your free trial has ended. Sign up to continue.' },
  guest_trial_limit_exceeded: { status: 403, zh: '72 小时免费试用次数已用完，注册账号后可继续使用',   en: "You've used all free trial readings. Sign up to continue." },
  feature_trial_limit_exceeded: { status: 403, zh: '该功能的试用次数已用完，注册账号后可继续使用',   en: "You've used your free trial for this spread. Sign up or upgrade to continue." },
  unknown:                    { status: 403, zh: '权限校验未通过',                                 en: 'Unable to verify access. Please try again later.' },
};

export async function requireAccessOrRespond(params: {
  req: NextApiRequest;
  res: NextApiResponse;
  spreadAccess?: SpreadAccess;
  freeDailyLimit?: number;
  /** Pass the spread key to enable per-feature guest trial limit checking */
  spreadKey?: string;
}): Promise<ApiAccessStatus | null> {
  const { req, res, spreadAccess, freeDailyLimit, spreadKey } = params;
  const status = await ensureAccessForRequest({
    req,
    spreadAccess,
    freeDailyLimit,
    spreadKey,
  });

  if (status.allowed) {
    status.trackingLocale = isEnglishRequest(req) ? 'en' : 'zh';
    const referer = req.headers.referer;
    try {
      status.trackingPagePath = referer ? new URL(referer).pathname : undefined;
    } catch {
      status.trackingPagePath = undefined;
    }
    return status;
  }

  const reason = status.reason ?? 'unknown';
  const meta = ACCESS_DENIED_MESSAGES[reason] || ACCESS_DENIED_MESSAGES.unknown;
  const isEn = isEnglishRequest(req);
  const message = isEn ? meta.en : meta.zh;
  // Include machine-readable `code` alongside human `error` so the frontend
  // can distinguish guest trial denial reasons from generic auth failures.
  res.status(meta.status).json({ error: message, code: reason });
  return null;
}

/**
 * Called ONCE after a successful AI reading generation.
 *
 * - Logged-in user  → records to reading_history (existing behaviour).
 * - Guest trial user → increments guest_trial_usage for the feature key.
 *
 * Free spread callers may omit `featureKey`; guest trial usage is only
 * recorded when both `featureKey` and `accessType === 'guest_trial'` are present.
 */
export async function recordSuccessfulReading(params: {
  accessStatus: ApiAccessStatus;
  spreadType: string;
  /** Spread key from lib/spreads.ts — required for guest trial usage counting */
  featureKey?: string;
  question?: string | null;
  cards?: unknown;
  readingResult?: unknown;
  resultPath: string;
}): Promise<void> {
  const { accessStatus, spreadType, featureKey, question, cards, readingResult, resultPath } = params;

  const trimmedQuestion = typeof question === 'string' ? question.trim().slice(0, 2000) : '';
  if (trimmedQuestion && (accessStatus.userId || accessStatus.guestSessionId)) {
    const category = spreadType.startsWith('love-') ? 'love'
      : spreadType.startsWith('career-') ? 'career'
      : spreadType.startsWith('wealth-') ? 'wealth'
      : spreadType.startsWith('fortune-') ? 'fortune'
      : null;
    const { error } = await supabaseService.from('reading_question_events').insert({
      user_id: accessStatus.userId ?? null,
      guest_id: accessStatus.guestSessionId ?? null,
      question_text: trimmedQuestion,
      question_category: category,
      spread_type: spreadType,
      locale: accessStatus.trackingLocale ?? 'zh',
      page_path: accessStatus.trackingPagePath ?? resultPath,
    });
    if (error) console.error('[readingQuestionEvents] insert failed', error);
  }

  if (accessStatus.userId) {
    await recordReadingHistory({
      userId: accessStatus.userId,
      spreadType,
      question: question ?? null,
      cards: cards ?? null,
      readingResult: readingResult ?? null,
      resultPath,
    });
  } else if (
    accessStatus.accessType === 'guest_trial' &&
    accessStatus.guestSessionId &&
    featureKey
  ) {
    await recordGuestTrialUsage({
      sessionId: accessStatus.guestSessionId,
      featureKey,
    });
  }
}
