import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../lib/supabaseServer';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRIAL_COOKIE_NAME = 'guest_trial_session_id';
const TRIAL_USAGE_LIMIT = 8;

type SuccessResponse = {
  success: true;
  session_id: string;
  expires_at: string;
};

type ErrorResponse = {
  success: false;
  error: string;
  reason?:
    | 'trial_expired'
    | 'trial_limit_exceeded'
    | 'session_check_failed'
    | 'session_create_failed'
    | 'internal_error'
    | 'method_not_allowed';
};

function parseCookies(cookieHeader?: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
    const [rawName, rawValue] = part.split('=');
    if (!rawName) return;
    cookies[rawName.trim()] = decodeURIComponent(rawValue?.trim() || '');
  });
  return cookies;
}

function setTrialCookie(res: NextApiResponse, sessionId: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${TRIAL_COOKIE_NAME}=${encodeURIComponent(sessionId)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed', reason: 'method_not_allowed' });
  }

  try {
    const cookies = parseCookies(req.headers.cookie);
    const existingSessionId = cookies[TRIAL_COOKIE_NAME];

    if (existingSessionId && UUID_REGEX.test(existingSessionId)) {
      const { data: existingSession, error: existingError } = await supabaseService
        .from('guest_trial_sessions')
        .select('session_id, expires_at')
        .eq('session_id', existingSessionId)
        .maybeSingle();

      if (existingError) {
        console.error('[api/guest-trial/start] existing session lookup failed', existingError);
        return res.status(500).json({
          success: false,
          error: 'Failed to check existing session',
          reason: 'session_check_failed',
        });
      }

      if (existingSession) {
        setTrialCookie(res, existingSession.session_id);
        if (new Date(existingSession.expires_at) <= new Date()) {
          return res.status(403).json({
            success: false,
            error: 'Free trial has already ended',
            reason: 'trial_expired',
          });
        }

        const { data: usageRows, error: usageError } = await supabaseService
          .from('guest_trial_usage')
          .select('usage_count')
          .eq('session_id', existingSession.session_id);

        if (usageError) {
          console.error('[api/guest-trial/start] usage lookup failed', usageError);
          return res.status(500).json({
            success: false,
            error: 'Failed to check trial usage',
            reason: 'session_check_failed',
          });
        }

        const totalUsed = (usageRows ?? []).reduce(
          (sum: number, row: { usage_count: number }) => sum + (row.usage_count ?? 0),
          0
        );

        if (totalUsed >= TRIAL_USAGE_LIMIT) {
          return res.status(403).json({
            success: false,
            error: 'Free trial readings have already been used',
            reason: 'trial_limit_exceeded',
          });
        }

        return res.status(200).json({
          success: true,
          session_id: existingSession.session_id,
          expires_at: existingSession.expires_at,
        });
      }
    }

    const { data, error } = await supabaseService
      .from('guest_trial_sessions')
      .insert({})
      .select('session_id, expires_at')
      .single();

    if (error || !data) {
      console.error('[api/guest-trial/start] insert failed', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create session',
        reason: 'session_create_failed',
      });
    }

    setTrialCookie(res, data.session_id);

    return res.status(200).json({
      success: true,
      session_id: data.session_id,
      expires_at: data.expires_at,
    });
  } catch (err) {
    console.error('[api/guest-trial/start] unexpected error', err);
    return res.status(500).json({ success: false, error: 'Internal server error', reason: 'internal_error' });
  }
}
