import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureAccessForRequest, ApiAccessStatus } from '../../../lib/accessServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiAccessStatus | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { spreadAccess, freeDailyLimit } = req.query;
  const normalizedSpreadAccess = spreadAccess === 'member' ? 'member' : 'free';
  const limit = typeof freeDailyLimit === 'string' ? Number(freeDailyLimit) : undefined;

  try {
    const result = await ensureAccessForRequest({
      req,
      spreadAccess: normalizedSpreadAccess,
      freeDailyLimit: isNaN(limit ?? 0) ? undefined : limit
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('[api/access/check] failed', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
