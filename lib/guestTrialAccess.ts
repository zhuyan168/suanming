/**
 * Guest trial access helpers.
 *
 * usage_count is incremented ONLY via recordGuestTrialUsage, which must be
 * called after a successful AI reading generation — never during precheck,
 * card draw, or on any failure path.
 */

import { randomUUID } from 'crypto';
import { supabaseService } from './supabaseServer';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const TRIAL_TOTAL_LIMIT = 8;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Per-feature trial limits.
 * Keys match spread keys from lib/spreads.ts.
 * Member spreads not listed here use DEFAULT_FEATURE_LIMIT.
 */
export const GUEST_TRIAL_FEATURE_LIMITS: Record<string, number> = {
  // 普通会员牌阵 — 每个最多 3 次
  'love-relationship-development': 3,
  'love-reconciliation': 3,
  'career-offer-decision': 3,
  'career-stay-or-leave': 3,
  'wealth-obstacles': 3,
  // 大型深度牌阵 — 每个最多 1 次
  'celtic-cross': 1,
  'hexagram': 1,
  'horseshoe': 1,
  // 周期运势类 — 每个最多 1 次
  'fortune-monthly-member': 1,
  'fortune-seasonal': 1,
  'fortune-yearly': 1,
};

const DEFAULT_FEATURE_LIMIT = 2;

export function getFeatureLimit(spreadKey: string): number {
  return GUEST_TRIAL_FEATURE_LIMITS[spreadKey] ?? DEFAULT_FEATURE_LIMIT;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GuestTrialDenyReason =
  | 'missing_session'
  | 'invalid_session'
  | 'expired'
  | 'total_limit_exceeded'
  | 'feature_limit_exceeded';

export type GuestTrialCheckResult =
  | {
      allowed: true;
      sessionId: string;
      expiresAt: string;
      totalUsed: number;
      totalRemaining: number;
      featureUsed: number;
      featureRemaining: number;
    }
  | { allowed: false; reason: GuestTrialDenyReason };

export type GuestTrialSessionResult =
  | {
      valid: true;
      sessionId: string;
      expiresAt: string;
      totalUsed: number;
      totalRemaining: number;
    }
  | {
      valid: false;
      reason: Exclude<GuestTrialDenyReason, 'feature_limit_exceeded'>;
    };

// ---------------------------------------------------------------------------
// Full check (session + total + per-feature) — used by /api/access/check
// ---------------------------------------------------------------------------

export async function checkGuestTrialAccess(params: {
  sessionId: string | null | undefined;
  spreadKey: string;
}): Promise<GuestTrialCheckResult> {
  const { sessionId, spreadKey } = params;

  if (!sessionId) return { allowed: false, reason: 'missing_session' };
  if (!UUID_REGEX.test(sessionId)) return { allowed: false, reason: 'invalid_session' };

  const { data: session, error: sessionError } = await supabaseService
    .from('guest_trial_sessions')
    .select('session_id, expires_at')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error('[guestTrialAccess] session query error', sessionError);
    return { allowed: false, reason: 'invalid_session' };
  }
  if (!session) return { allowed: false, reason: 'invalid_session' };
  if (new Date(session.expires_at) <= new Date()) return { allowed: false, reason: 'expired' };

  const { data: usageRows, error: usageError } = await supabaseService
    .from('guest_trial_usage')
    .select('feature_key, usage_count')
    .eq('session_id', sessionId);

  if (usageError) {
    console.error('[guestTrialAccess] usage query error', usageError);
    return { allowed: false, reason: 'invalid_session' };
  }

  const rows = usageRows ?? [];
  const totalUsed = rows.reduce((sum, r) => sum + (r.usage_count ?? 0), 0);

  if (totalUsed >= TRIAL_TOTAL_LIMIT) {
    return { allowed: false, reason: 'total_limit_exceeded' };
  }

  const featureLimit = getFeatureLimit(spreadKey);
  const featureRow = rows.find((r) => r.feature_key === spreadKey);
  const featureUsed = featureRow?.usage_count ?? 0;

  if (featureUsed >= featureLimit) {
    return { allowed: false, reason: 'feature_limit_exceeded' };
  }

  return {
    allowed: true,
    sessionId: session.session_id,
    expiresAt: session.expires_at,
    totalUsed,
    totalRemaining: Math.max(0, TRIAL_TOTAL_LIMIT - totalUsed),
    featureUsed,
    featureRemaining: Math.max(0, featureLimit - featureUsed),
  };
}

// ---------------------------------------------------------------------------
// Lightweight check (session + total only) — used by requireAccessOrRespond
// ---------------------------------------------------------------------------

export async function checkGuestTrialSession(
  sessionId: string | null | undefined
): Promise<GuestTrialSessionResult> {
  if (!sessionId) return { valid: false, reason: 'missing_session' };
  if (!UUID_REGEX.test(sessionId)) return { valid: false, reason: 'invalid_session' };

  const { data: session, error: sessionError } = await supabaseService
    .from('guest_trial_sessions')
    .select('session_id, expires_at')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (sessionError || !session) return { valid: false, reason: 'invalid_session' };
  if (new Date(session.expires_at) <= new Date()) return { valid: false, reason: 'expired' };

  const { data: usageRows } = await supabaseService
    .from('guest_trial_usage')
    .select('usage_count')
    .eq('session_id', sessionId);

  const totalUsed = (usageRows ?? []).reduce((sum, r) => sum + (r.usage_count ?? 0), 0);

  if (totalUsed >= TRIAL_TOTAL_LIMIT) {
    return { valid: false, reason: 'total_limit_exceeded' };
  }

  return {
    valid: true,
    sessionId: session.session_id,
    expiresAt: session.expires_at,
    totalUsed,
    totalRemaining: Math.max(0, TRIAL_TOTAL_LIMIT - totalUsed),
  };
}

// ---------------------------------------------------------------------------
// Usage recording — called ONLY after successful AI generation
// ---------------------------------------------------------------------------

export interface GuestTrialUsageResult {
  featureUsed: number;
  totalUsed: number;
  totalRemaining: number;
}

/**
 * Increments usage_count for the given session + feature key by 1.
 * Uses fetch-then-update (non-atomic) which is safe for single-user API calls.
 * Never throws — on DB error, logs and returns zeroed counters.
 */
export async function recordGuestTrialUsage(params: {
  sessionId: string;
  featureKey: string;
}): Promise<GuestTrialUsageResult> {
  const { sessionId, featureKey } = params;

  try {
    // Fetch all existing usage rows to compute accurate totals
    const { data: rows, error: fetchError } = await supabaseService
      .from('guest_trial_usage')
      .select('feature_key, usage_count')
      .eq('session_id', sessionId);

    if (fetchError) {
      console.error('[recordGuestTrialUsage] fetch error', fetchError);
      return { featureUsed: 0, totalUsed: 0, totalRemaining: TRIAL_TOTAL_LIMIT };
    }

    const allRows = rows ?? [];
    const prevTotal = allRows.reduce((sum, r) => sum + (r.usage_count ?? 0), 0);
    const existingRow = allRows.find((r) => r.feature_key === featureKey);
    const prevFeatureCount = existingRow?.usage_count ?? 0;
    const newFeatureCount = prevFeatureCount + 1;
    const newTotal = prevTotal + 1;

    if (existingRow) {
      const { error: updateError } = await supabaseService
        .from('guest_trial_usage')
        .update({ usage_count: newFeatureCount, updated_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('feature_key', featureKey);

      if (updateError) {
        console.error('[recordGuestTrialUsage] update error', updateError);
      }
    } else {
      const { error: insertError } = await supabaseService
        .from('guest_trial_usage')
        .insert({
          id: randomUUID(),
          session_id: sessionId,
          feature_key: featureKey,
          usage_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('[recordGuestTrialUsage] insert error', insertError);
      }
    }

    return {
      featureUsed: newFeatureCount,
      totalUsed: newTotal,
      totalRemaining: Math.max(0, TRIAL_TOTAL_LIMIT - newTotal),
    };
  } catch (err) {
    console.error('[recordGuestTrialUsage] unexpected error', err);
    return { featureUsed: 0, totalUsed: 0, totalRemaining: TRIAL_TOTAL_LIMIT };
  }
}
