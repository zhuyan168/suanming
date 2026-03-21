import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../lib/supabaseServer';

type RedeemSuccess = { success: true; newMembershipExpiresAt: string };
type RedeemError = { error: string };

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

/** Extend by calendar days in UTC (matches typical timestamptz day boundaries). */
function addUtcCalendarDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RedeemSuccess | RedeemError>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: '请先登录' });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseService.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: '请先登录' });
  }

  let body: { code?: unknown };
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: '请求格式错误' });
  }

  const rawCode = body?.code;
  if (typeof rawCode !== 'string' || !rawCode.trim()) {
    return res.status(400).json({ error: '请输入会员码' });
  }
  const normalizedCode = rawCode.trim();

  const { data: row, error: selErr } = await supabaseService
    .from('membership_codes')
    .select('id, duration_days, is_used, expires_at')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (selErr) {
    console.error('[api/membership/redeem] select code', selErr);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
  if (!row) {
    return res.status(404).json({ error: '会员码不存在' });
  }
  if (row.is_used) {
    return res.status(400).json({ error: '会员码已使用' });
  }
  if (row.expires_at) {
    const codeExp = new Date(row.expires_at as string);
    if (!Number.isNaN(codeExp.getTime()) && codeExp.getTime() <= Date.now()) {
      return res.status(400).json({ error: '会员码已过期' });
    }
  }

  const durationDays = Number(row.duration_days);
  if (!Number.isFinite(durationDays) || durationDays <= 0 || durationDays > 36500) {
    return res.status(400).json({ error: '会员码无效' });
  }

  const { data: profile, error: profileReadErr } = await supabaseService
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', user.id)
    .single();

  if (profileReadErr) {
    console.error('[api/membership/redeem] read profile', profileReadErr);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }

  const now = new Date();
  let base: Date;
  const currentExpRaw = profile?.membership_expires_at;
  const currentExp = currentExpRaw ? new Date(currentExpRaw as string) : null;
  if (currentExp && !Number.isNaN(currentExp.getTime()) && currentExp > now) {
    base = currentExp;
  } else {
    base = now;
  }

  const newExpires = addUtcCalendarDays(base, durationDays);
  const newIso = newExpires.toISOString();
  const usedAt = new Date().toISOString();

  const { data: consumed, error: codeUpdErr } = await supabaseService
    .from('membership_codes')
    .update({
      is_used: true,
      used_by: user.id,
      used_at: usedAt,
    })
    .eq('id', row.id)
    .eq('is_used', false)
    .select('id');

  if (codeUpdErr) {
    console.error('[api/membership/redeem] consume code', codeUpdErr);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
  if (!consumed?.length) {
    return res.status(400).json({ error: '会员码已使用' });
  }

  const { error: profUpdErr } = await supabaseService
    .from('profiles')
    .update({ membership_expires_at: newIso })
    .eq('id', user.id);

  if (profUpdErr) {
    console.error('[api/membership/redeem] profile update after consume', profUpdErr);
    return res.status(500).json({ error: '兑换处理异常，请稍后再试或联系客服' });
  }

  return res.status(200).json({ success: true, newMembershipExpiresAt: newIso });
}
