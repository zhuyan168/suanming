import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../lib/supabaseServer';

type SuccessResponse = {
  success: true;
  session_id: string;
  expires_at: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabaseService
      .from('guest_trial_sessions')
      .insert({})
      .select('session_id, expires_at')
      .single();

    if (error || !data) {
      console.error('[api/guest-trial/start] insert failed', error);
      return res.status(500).json({ success: false, error: 'Failed to create session' });
    }

    return res.status(200).json({
      success: true,
      session_id: data.session_id,
      expires_at: data.expires_at,
    });
  } catch (err) {
    console.error('[api/guest-trial/start] unexpected error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
