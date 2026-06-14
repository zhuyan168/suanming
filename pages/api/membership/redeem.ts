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

async function writeMembershipProfile(params: {
  userId: string;
  email?: string | null;
  membershipExpiresAt: string;
}): Promise<{ error: unknown | null }> {
  const payload = {
    membership_expires_at: params.membershipExpiresAt,
    is_member: true,
  };

  const { data: updated, error: updateError } = await supabaseService
    .from('profiles')
    .update(payload)
    .eq('id', params.userId)
    .select('id');

  if (updateError) return { error: updateError };
  if (updated?.length) return { error: null };

  const { error: insertError } = await supabaseService
    .from('profiles')
    .insert({
      id: params.userId,
      email: params.email ?? null,
      ...payload,
    });

  return { error: insertError ?? null };
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
    .select('id, duration_days, is_used, used_by, used_at, expires_at')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (selErr) {
    console.error('[api/membership/redeem] select code', selErr);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
  if (!row) {
    return res.status(404).json({ error: '会员码不存在' });
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
    .maybeSingle();

  if (profileReadErr) {
    console.error('[api/membership/redeem] read profile', profileReadErr);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }

  const now = new Date();
  const currentExpRaw = profile?.membership_expires_at;
  const currentExp = currentExpRaw ? new Date(currentExpRaw as string) : null;

  if (row.is_used) {
    if (row.used_by !== user.id) {
      return res.status(400).json({ error: 'Membership code has already been used' });
    }

    const usedAtRaw = row.used_at as string | null | undefined;
    const originalUsedAt = usedAtRaw ? new Date(usedAtRaw) : now;
    const repairBase = !Number.isNaN(originalUsedAt.getTime()) ? originalUsedAt : now;
    const repairExpires = addUtcCalendarDays(repairBase, durationDays);
    const repairIso = repairExpires.toISOString();

    if (currentExp && !Number.isNaN(currentExp.getTime()) && currentExp >= repairExpires) {
      return res.status(200).json({ success: true, newMembershipExpiresAt: currentExp.toISOString() });
    }

    const { error: repairErr } = await writeMembershipProfile({
      userId: user.id,
      email: user.email,
      membershipExpiresAt: repairIso,
    });

    if (repairErr) {
      console.error('[api/membership/redeem] repair profile for consumed code', repairErr);
      return res.status(500).json({ error: 'Redemption repair failed. Please contact support.' });
    }

    const { error: repairLedgerErr } = await supabaseService
      .from('membership_ledger')
      .insert({
        user_id: user.id,
        source: 'code',
        action: 'extend',
        days_delta: durationDays,
        expires_before: currentExpRaw || null,
        expires_after: repairIso,
        membership_code_id: row.id,
        metadata: {
          code_expires_at: row.expires_at || null,
          repaired_consumed_code: true,
        },
      });

    if (repairLedgerErr) {
      console.error('[api/membership/redeem] repair ledger insert failed', repairLedgerErr);
    }

    return res.status(200).json({ success: true, newMembershipExpiresAt: repairIso });
  }

  let base: Date;
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

  const { error: profUpdErr } = await writeMembershipProfile({
    userId: user.id,
    email: user.email,
    membershipExpiresAt: newIso,
  });

  if (profUpdErr) {
    console.error('[api/membership/redeem] profile update after consume', profUpdErr);
    const { error: rollbackErr } = await supabaseService
      .from('membership_codes')
      .update({
        is_used: false,
        used_by: null,
        used_at: null,
      })
      .eq('id', row.id)
      .eq('used_by', user.id);

    if (rollbackErr) {
      console.error('[api/membership/redeem] rollback consumed code failed', rollbackErr);
    }

    return res.status(500).json({ error: '兑换处理异常，请稍后再试或联系客服' });
  }

  const { error: ledgerErr } = await supabaseService
    .from('membership_ledger')
    .insert({
      user_id: user.id,
      source: 'code',
      action: 'extend',
      days_delta: durationDays,
      expires_before: currentExpRaw || null,
      expires_after: newIso,
      membership_code_id: row.id,
      metadata: {
        code_expires_at: row.expires_at || null,
      },
    });

  if (ledgerErr) {
    console.error('[api/membership/redeem] membership ledger insert failed', ledgerErr);
  }

  return res.status(200).json({ success: true, newMembershipExpiresAt: newIso });
}
