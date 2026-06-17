import type { NextApiRequest, NextApiResponse } from 'next';
import {
  findPeriodicReadingForUser,
  getAuthenticatedUserIdFromRequest,
  PeriodicReadingPeriod,
  requireAccessOrRespond,
} from '../../../lib/accessServer';
import type { SpreadAccess } from '../../../lib/spreads';

const PERIODIC_SPREADS: Record<
  string,
  { access: SpreadAccess; period: PeriodicReadingPeriod; spreadTypes: string[] }
> = {
  'fortune-daily': {
    access: 'free',
    period: 'day',
    spreadTypes: ['fortune-daily', 'daily-fortune'],
  },
  'fortune-monthly': {
    access: 'free',
    period: 'month',
    spreadTypes: ['monthly-basic-fortune', 'fortune-monthly', 'monthly-fortune'],
  },
  'fortune-seasonal': {
    access: 'member',
    period: 'season',
    spreadTypes: ['fortune-seasonal', 'seasonal-fortune'],
  },
  'fortune-yearly': {
    access: 'member',
    period: 'year',
    spreadTypes: ['year-ahead', 'year-ahead-fortune', 'annual-fortune', 'fortune-yearly'],
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const spreadKey = Array.isArray(req.query.spreadKey) ? req.query.spreadKey[0] : req.query.spreadKey;
  const config = spreadKey ? PERIODIC_SPREADS[spreadKey] : null;

  if (!config) {
    return res.status(400).json({ error: 'Invalid periodic spread key' });
  }

  const authenticatedUserId = await getAuthenticatedUserIdFromRequest(req);
  if (authenticatedUserId) {
    const existingRecord = await findPeriodicReadingForUser({
      req,
      userId: authenticatedUserId,
      spreadTypes: config.spreadTypes,
      period: config.period,
    });

    if (existingRecord) {
      return res.status(200).json({
        exists: true,
        existingRecord,
      });
    }
  }

  const accessStatus = await requireAccessOrRespond({
    req,
    res,
    spreadAccess: config.access,
    spreadKey,
  });
  if (!accessStatus) return;

  return res.status(200).json({
    exists: false,
    existingRecord: null,
  });
}
