import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { getCreemPlan } from '../../../lib/creemPlans';
import { supabaseService } from '../../../lib/supabaseServer';

type CreateCheckoutSuccess = {
  checkoutUrl: string;
};

type CreateCheckoutError = {
  error: string;
};

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

function getRequestOrigin(req: NextApiRequest): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const proto = req.headers['x-forwarded-proto'];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = Array.isArray(proto) ? proto[0] : proto || 'http';
  const hostname = Array.isArray(host) ? host[0] : host;

  return `${protocol}://${hostname}`;
}

function getCreemApiBaseUrl(): string {
  return (process.env.CREEM_API_BASE_URL || 'https://test-api.creem.io').replace(/\/$/, '');
}

function getStringId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value && typeof (value as { id?: unknown }).id === 'string') {
    return (value as { id: string }).id;
  }
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCheckoutSuccess | CreateCheckoutError>
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
    return res.status(401).json({ error: 'Please sign in before purchasing membership.' });
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Please sign in before purchasing membership.' });
  }

  let body: { planKey?: unknown };
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid request body.' });
  }
  const plan = getCreemPlan(body.planKey);
  if (!plan) {
    return res.status(400).json({ error: 'Invalid membership plan.' });
  }

  const requestId = `creem_${plan.key}_${randomUUID()}`;
  const origin = getRequestOrigin(req);
  const successUrl = `${origin}/membership?checkout=success&plan=${encodeURIComponent(plan.key)}`;

  const creemRes = await fetch(`${getCreemApiBaseUrl()}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      product_id: plan.productId,
      request_id: requestId,
      units: 1,
      success_url: successUrl,
      customer: {
        email: user.email,
      },
      metadata: {
        userId: user.id,
        planKey: plan.key,
        requestId,
      },
    }),
  });

  let creemPayload: any = null;
  try {
    creemPayload = await creemRes.json();
  } catch {
    creemPayload = null;
  }

  if (!creemRes.ok || !creemPayload?.checkout_url) {
    console.error('[api/creem/create-checkout] Creem checkout failed', {
      status: creemRes.status,
      payload: creemPayload,
    });
    return res.status(502).json({ error: 'Unable to create checkout. Please try again later.' });
  }

  const { error: insertError } = await supabaseService.from('creem_subscriptions').insert({
    user_id: user.id,
    creem_customer_id: getStringId(creemPayload.customer),
    creem_subscription_id: getStringId(creemPayload.subscription),
    creem_product_id: plan.productId,
    plan_key: plan.key,
    status: 'checkout_created',
    latest_event_type: 'checkout.created',
    latest_event_id: creemPayload.id || requestId,
    latest_event_payload: creemPayload,
  });

  if (insertError) {
    console.error('[api/creem/create-checkout] Subscription insert failed', insertError);
  }

  return res.status(200).json({ checkoutUrl: creemPayload.checkout_url });
}
