import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUserIdFromRequest } from '../../lib/accessServer';
import { supabaseService } from '../../lib/supabaseServer';

const ALLOWED_FLAGS = new Set([
  'result_viewed',
  'signup_after_result',
  'paywall_shown',
  'subscribe_clicked',
]);

function guestIdFromRequest(req: NextApiRequest): string | null {
  const value = req.headers['x-guest-session-id'];
  const guestId = Array.isArray(value) ? value[0] : value;
  return typeof guestId === 'string' && /^[0-9a-f-]{36}$/i.test(guestId) ? guestId : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const flag = typeof req.body?.flag === 'string' ? req.body.flag : '';
  if (!ALLOWED_FLAGS.has(flag)) return res.status(400).json({ error: 'Invalid event flag' });

  const userId = await getAuthenticatedUserIdFromRequest(req);
  const guestId = guestIdFromRequest(req);
  if (!userId && !guestId) return res.status(204).end();

  const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const findLatest = (column: 'user_id' | 'guest_id', value: string) => supabaseService
    .from('reading_question_events')
    .select('id')
    .eq(column, value)
    .gte('created_at', recentSince)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let { data, error } = userId
    ? await findLatest('user_id', userId)
    : await findLatest('guest_id', guestId as string);

  // A newly registered user still has a guest-owned reading. Link that row now.
  if (!data && !error && guestId) {
    ({ data, error } = await findLatest('guest_id', guestId));
  }
  if (error) {
    console.error('[reading-question-events] lookup failed', error);
    return res.status(500).json({ error: 'Unable to track event' });
  }
  if (!data) return res.status(204).end();

  const updates: Record<string, boolean | string> = { [flag]: true };
  if (userId) updates.user_id = userId;
  const { error: updateError } = await supabaseService
    .from('reading_question_events')
    .update(updates)
    .eq('id', data.id);

  if (updateError) {
    console.error('[reading-question-events] update failed', updateError);
    return res.status(500).json({ error: 'Unable to track event' });
  }
  return res.status(204).end();
}
