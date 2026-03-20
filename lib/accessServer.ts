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

const TIMEZONE = 'America/Los_Angeles';
const DEFAULT_FREE_LIMIT = 3;

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

function getTodayStartIso(timeZone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  const parts = formatter.formatToParts(now);
  const values: Record<string, string> = {};
  let offsetMinutes = 0;

  for (const part of parts) {
    if (part.type === 'timeZoneName') {
      const match = part.value.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
      if (match) {
        const hours = Number(match[1]);
        const minutes = match[2] ? Number(match[2]) : 0;
        offsetMinutes = hours * 60 + (hours >= 0 ? minutes : -minutes);
      }
    } else if (part.value && part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  const year = Number(values.year ?? now.getUTCFullYear());
  const month = Number(values.month ?? now.getUTCMonth() + 1);
  const day = Number(values.day ?? now.getUTCDate());
  const utcMidnight = Date.UTC(year, month - 1, day) - offsetMinutes * 60 * 1000;
  return new Date(utcMidnight).toISOString();
}

async function countTodayFreeReadings(userId: string): Promise<number> {
  const todayStart = getTodayStartIso(TIMEZONE);
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

  const todayCount = await countTodayFreeReadings(user.id);
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
