import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../lib/supabaseServer';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRIAL_USAGE_LIMIT = 8;

type InvalidResponse =
  | { valid: false; reason: 'missing_session' }
  | { valid: false; reason: 'invalid_session' }
  | { valid: false; reason: 'expired'; expires_at: string };

type ActiveResponse = {
  valid: true;
  reason: 'active';
  session_id: string;
  expires_at: string;
  total_used: number;
  total_remaining: number;
};

type StatusResponse = InvalidResponse | ActiveResponse | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawHeader = req.headers['x-guest-session-id'];
  const sessionId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!sessionId) {
    return res.status(200).json({ valid: false, reason: 'missing_session' });
  }

  if (!UUID_REGEX.test(sessionId)) {
    return res.status(200).json({ valid: false, reason: 'invalid_session' });
  }

  try {
    const { data: session, error: sessionError } = await supabaseService
      .from('guest_trial_sessions')
      .select('session_id, expires_at')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (sessionError) {
      console.error('[api/guest-trial/status] session query error', sessionError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!session) {
      return res.status(200).json({ valid: false, reason: 'invalid_session' });
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    if (expiresAt <= now) {
      return res.status(200).json({
        valid: false,
        reason: 'expired',
        expires_at: session.expires_at,
      });
    }

    // Fire-and-forget: update last_seen_at
    supabaseService
      .from('guest_trial_sessions')
      .update({ last_seen_at: now.toISOString() })
      .eq('session_id', sessionId)
      .then(({ error }) => {
        if (error) console.error('[api/guest-trial/status] last_seen_at update failed', error);
      });

    const { data: usageRows, error: usageError } = await supabaseService
      .from('guest_trial_usage')
      .select('usage_count')
      .eq('session_id', sessionId);

    if (usageError) {
      console.error('[api/guest-trial/status] usage query error', usageError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const totalUsed = (usageRows ?? []).reduce(
      (sum: number, row: { usage_count: number }) => sum + (row.usage_count ?? 0),
      0
    );
    const totalRemaining = Math.max(0, TRIAL_USAGE_LIMIT - totalUsed);

    return res.status(200).json({
      valid: true,
      reason: 'active',
      session_id: session.session_id,
      expires_at: session.expires_at,
      total_used: totalUsed,
      total_remaining: totalRemaining,
    });
  } catch (err) {
    console.error('[api/guest-trial/status] unexpected error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
