import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService } from '../../../lib/supabaseServer';

type CreateCustomerPortalSuccess = {
  portalUrl: string;
};

type CreateCustomerPortalError = {
  error: string;
};

type PortalResult = {
  portalUrl: string | null;
  status: number;
  payload: any;
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

function getCreemApiBaseUrl(): string | null {
  const baseUrl = process.env.CREEM_API_BASE_URL;
  return baseUrl ? baseUrl.replace(/\/$/, '') : null;
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

function getCustomerId(payload: any): string | null {
  const candidates = [
    payload?.id,
    payload?.customer_id,
    payload?.customerId,
    payload?.customer?.id,
    payload?.data?.id,
    payload?.data?.customer?.id,
    payload?.object?.id,
    payload?.items?.[0]?.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.startsWith('cust_')) {
      return candidate;
    }
  }

  return null;
}

async function findCreemCustomerIdByEmail(email: string, apiKey: string, creemApiBaseUrl: string): Promise<string | null> {
  const creemRes = await fetch(`${creemApiBaseUrl}/v1/customers?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
    },
  });

  let creemPayload: any = null;
  try {
    creemPayload = await creemRes.json();
  } catch {
    creemPayload = null;
  }

  if (!creemRes.ok) {
    console.error('[api/creem/create-customer-portal] Creem customer lookup failed', {
      status: creemRes.status,
      payload: creemPayload,
    });
    return null;
  }

  return getCustomerId(creemPayload);
}

async function createPortalForCustomer(customerId: string, apiKey: string, creemApiBaseUrl: string): Promise<PortalResult> {
  const creemRes = await fetch(`${creemApiBaseUrl}/v1/customers/billing`, {
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

  return {
    portalUrl: getPortalUrl(creemPayload),
    status: creemRes.status,
    payload: creemPayload,
  };
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

  const creemApiBaseUrl = getCreemApiBaseUrl();
  if (!creemApiBaseUrl) {
    return res.status(500).json({ error: 'Creem API base URL is not configured' });
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

  const customerIds = Array.from(new Set(
    (subscriptions || [])
      .map((subscription) => subscription.creem_customer_id)
      .filter((customerId): customerId is string => typeof customerId === 'string' && customerId.startsWith('cust_'))
  ));

  if (user.email) {
    const customerIdFromEmail = await findCreemCustomerIdByEmail(user.email, apiKey, creemApiBaseUrl);
    if (customerIdFromEmail && !customerIds.includes(customerIdFromEmail)) {
      customerIds.push(customerIdFromEmail);
    }
  }

  if (customerIds.length === 0) {
    return res.status(404).json({ error: 'No Creem subscription was found for this account.' });
  }

  const failedAttempts: Array<{ customerId: string; status: number; payload: any }> = [];
  for (const customerId of customerIds) {
    const portalResult = await createPortalForCustomer(customerId, apiKey, creemApiBaseUrl);
    if (portalResult.portalUrl) {
      return res.status(200).json({ portalUrl: portalResult.portalUrl });
    }

    failedAttempts.push({
      customerId,
      status: portalResult.status,
      payload: portalResult.payload,
    });
  }

  console.error('[api/creem/create-customer-portal] Creem portal failed for all customers', {
    userId: user.id,
    email: user.email,
    attempts: failedAttempts,
  });
  return res.status(502).json({ error: 'Unable to open subscription management. Please contact support.' });
}
