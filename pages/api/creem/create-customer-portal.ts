import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../lib/supabaseServer';

type CreateCustomerPortalSuccess = {
  portalUrl: string;
};

type CreateCustomerPortalError = {
  error: string;
};

function parseCookies(cookieHeader?: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
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

function getCreemApiBaseUrl(): string {
  return (process.env.CREEM_API_BASE_URL || 'https://test-api.creem.io').replace(/\/$/, '');
}

function getPortalUrl(payload: any): string | null {
  const candidates = [
    payload?.customer_portal_link,
    payload?.customerPortalLink,
    payload?.portal_url,
    payload?.portalUrl,
    payload?.billing_portal_url,
    payload?.billingPortalUrl,
    payload?.url,
    payload?.link,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.startsWith('http')) {
      return candidate;
    }
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCustomerPortalSuccess | CreateCustomerPortalError>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Creem API key is not configured' });
  }

  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Please sign in before managing your subscription.' });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Please sign in before managing your subscription.' });
  }

  const { data: subscriptions, error: subscriptionError } = await supabaseService
    .from('creem_subscriptions')
    .select('creem_customer_id, updated_at, created_at')
    .eq('user_id', user.id)
    .not('creem_customer_id', 'is', null)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })
    .limit(1);

  if (subscriptionError) {
    console.error('[api/creem/create-customer-portal] Subscription lookup failed', subscriptionError);
    return res.status(500).json({ error: 'Unable to find your subscription. Please contact support.' });
  }

  const customerId = subscriptions?.[0]?.creem_customer_id;
  if (!customerId) {
    return res.status(404).json({ error: 'No Creem subscription was found for this account.' });
  }

  const creemRes = await fetch(`${getCreemApiBaseUrl()}/v1/customers/billing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      customer_id: customerId,
    }),
  });

  let creemPayload: any = null;
  try {
    creemPayload = await creemRes.json();
  } catch {
    creemPayload = null;
  }

  const portalUrl = getPortalUrl(creemPayload);
  if (!creemRes.ok || !portalUrl) {
    console.error('[api/creem/create-customer-portal] Creem portal failed', {
      status: creemRes.status,
      payload: creemPayload,
    });
    return res.status(502).json({ error: 'Unable to open subscription management. Please contact support.' });
  }

  return res.status(200).json({ portalUrl });
}
