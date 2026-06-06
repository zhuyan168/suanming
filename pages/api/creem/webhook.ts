import type { NextApiRequest, NextApiResponse } from 'next';
import { createHmac, timingSafeEqual } from 'crypto';
import { getCreemPlan, getCreemPlanByProductId } from '../../../lib/creemPlans';
import { supabaseService } from '../../../lib/supabaseServer';

export const config = {
  api: {
    bodyParser: false,
  },
};

type WebhookResponse = {
  received: boolean;
  error?: string;
};

type CreemWebhookPayload = {
  id?: string;
  eventType?: string;
  type?: string;
  event_type?: string;
  object?: any;
  data?: any;
};

const ACTIVE_EVENT_TYPES = new Set([
  'checkout.completed',
  'subscription.active',
  'subscription.paid',
  'subscription.trialing',
]);

const CANCELED_EVENT_TYPES = new Set([
  'subscription.canceled',
  'subscription.cancelled',
  'subscription.expired',
]);

const SCHEDULED_CANCEL_EVENT_TYPES = new Set([
  'subscription.scheduled_cancel',
]);

const INACTIVE_EVENT_TYPES = new Set([
  'subscription.unpaid',
  'subscription.paused',
]);

const PAST_DUE_EVENT_TYPES = new Set([
  'subscription.past_due',
]);

function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function verifyCreemSignature(rawBody: string, signature: string | string[] | undefined, secret: string): boolean {
  const sig = Array.isArray(signature) ? signature[0] : signature;
  if (!sig) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = sig.startsWith('sha256=') ? sig.slice('sha256='.length) : sig;

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function getEventType(payload: CreemWebhookPayload): string {
  return payload.eventType || payload.event_type || payload.type || '';
}

function getEventObject(payload: CreemWebhookPayload): any {
  return payload.object || payload.data?.object || payload.data || payload;
}

function getNestedString(value: any, keys: string[]): string | null {
  for (const key of keys) {
    const current = value?.[key];
    if (typeof current === 'string' && current.trim()) return current;
    if (current && typeof current === 'object' && typeof current.id === 'string') return current.id;
  }
  return null;
}

function getProductId(obj: any): string | null {
  return (
    getNestedString(obj, ['product_id', 'productId', 'product']) ||
    getNestedString(obj?.product, ['id']) ||
    getNestedString(obj?.subscription, ['product_id', 'productId', 'product'])
  );
}

function getSubscriptionId(obj: any): string | null {
  return (
    getNestedString(obj, ['subscription_id', 'subscriptionId', 'subscription']) ||
    getNestedString(obj?.subscription, ['id'])
  );
}

function getCustomerId(obj: any): string | null {
  return (
    getNestedString(obj, ['customer_id', 'customerId', 'customer']) ||
    getNestedString(obj?.customer, ['id'])
  );
}

function getMetadata(obj: any): Record<string, any> {
  const metadata = obj?.metadata || obj?.subscription?.metadata || obj?.checkout?.metadata;
  return metadata && typeof metadata === 'object' ? metadata : {};
}

function parseDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getPeriodEnd(obj: any): string | null {
  return (
    parseDate(obj?.current_period_end) ||
    parseDate(obj?.currentPeriodEnd) ||
    parseDate(obj?.current_period_end_date) ||
    parseDate(obj?.currentPeriodEndDate) ||
    parseDate(obj?.period_end) ||
    parseDate(obj?.periodEnd) ||
    parseDate(obj?.next_transaction_date) ||
    parseDate(obj?.nextTransactionDate) ||
    parseDate(obj?.subscription?.current_period_end) ||
    parseDate(obj?.subscription?.currentPeriodEnd) ||
    parseDate(obj?.subscription?.current_period_end_date) ||
    parseDate(obj?.subscription?.currentPeriodEndDate)
  );
}

function getPeriodStart(obj: any): string | null {
  return (
    parseDate(obj?.current_period_start) ||
    parseDate(obj?.currentPeriodStart) ||
    parseDate(obj?.period_start) ||
    parseDate(obj?.periodStart) ||
    parseDate(obj?.subscription?.current_period_start) ||
    parseDate(obj?.subscription?.currentPeriodStart)
  );
}

function addUtcDays(from: Date, days: number): string {
  const date = new Date(from.getTime());
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

async function findUserIdFromSubscription(subscriptionId: string | null): Promise<string | null> {
  if (!subscriptionId) return null;
  const { data, error } = await supabaseService
    .from('creem_subscriptions')
    .select('user_id')
    .eq('creem_subscription_id', subscriptionId)
    .maybeSingle();

  if (error) {
    console.error('[api/creem/webhook] find subscription user failed', error);
    return null;
  }

  return data?.user_id || null;
}

async function upsertSubscription(params: {
  userId: string;
  subscriptionId: string | null;
  customerId: string | null;
  productId: string;
  planKey: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  eventType: string;
  eventId: string;
  payload: CreemWebhookPayload;
}) {
  const row = {
    user_id: params.userId,
    creem_customer_id: params.customerId,
    creem_subscription_id: params.subscriptionId,
    creem_product_id: params.productId,
    plan_key: params.planKey,
    status: params.status,
    current_period_start: params.periodStart,
    current_period_end: params.periodEnd,
    canceled_at: CANCELED_EVENT_TYPES.has(params.eventType) || SCHEDULED_CANCEL_EVENT_TYPES.has(params.eventType)
      ? new Date().toISOString()
      : null,
    latest_event_type: params.eventType,
    latest_event_id: params.eventId,
    latest_event_payload: params.payload,
    updated_at: new Date().toISOString(),
  };

  const query = params.subscriptionId
    ? supabaseService.from('creem_subscriptions').upsert(row, { onConflict: 'creem_subscription_id' })
    : supabaseService.from('creem_subscriptions').insert(row);

  const { error } = await query;
  if (error) {
    console.error('[api/creem/webhook] upsert subscription failed', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ received: false, error: 'Method not allowed' });
  }

  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ received: false, error: 'Webhook secret is not configured' });
  }

  const rawBody = await readRawBody(req);
  if (!verifyCreemSignature(rawBody, req.headers['creem-signature'], secret)) {
    return res.status(401).json({ received: false, error: 'Invalid signature' });
  }

  let payload: CreemWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ received: false, error: 'Invalid JSON payload' });
  }

  const eventType = getEventType(payload);
  const eventId = payload.id || getNestedString(payload, ['event_id', 'eventId']) || `${eventType}:${Date.now()}`;
  const eventObject = getEventObject(payload);
  const subscriptionId = getSubscriptionId(eventObject);

  const { error: eventInsertError } = await supabaseService.from('creem_webhook_events').insert({
    creem_event_id: eventId,
    event_type: eventType || 'unknown',
    creem_subscription_id: subscriptionId,
    payload,
  });

  if (eventInsertError) {
    if ((eventInsertError as any).code === '23505') {
      return res.status(200).json({ received: true });
    }
    console.error('[api/creem/webhook] event insert failed', eventInsertError);
    return res.status(500).json({ received: false, error: 'Unable to record webhook event' });
  }

  const metadata = getMetadata(eventObject);
  const userIdFromMetadata = typeof metadata.userId === 'string' ? metadata.userId : null;
  const userId = userIdFromMetadata || await findUserIdFromSubscription(subscriptionId);
  const productId = getProductId(eventObject);
  const plan = getCreemPlan(metadata.planKey) || getCreemPlanByProductId(productId);

  if (!userId || !productId || !plan) {
    console.error('[api/creem/webhook] missing required webhook mapping data', {
      eventType,
      eventId,
      hasUserId: Boolean(userId),
      productId,
      planKey: metadata.planKey,
    });
    await supabaseService
      .from('creem_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('creem_event_id', eventId);
    return res.status(200).json({ received: true });
  }

  const periodStart = getPeriodStart(eventObject);
  const periodEnd = getPeriodEnd(eventObject) || addUtcDays(new Date(), plan.fallbackDurationDays);
  const customerId = getCustomerId(eventObject);

  let status = eventObject?.status || eventType || 'unknown';
  if (ACTIVE_EVENT_TYPES.has(eventType)) status = 'active';
  if (CANCELED_EVENT_TYPES.has(eventType)) status = 'canceled';
  if (SCHEDULED_CANCEL_EVENT_TYPES.has(eventType)) status = 'scheduled_cancel';
  if (PAST_DUE_EVENT_TYPES.has(eventType)) status = 'past_due';
  if (INACTIVE_EVENT_TYPES.has(eventType)) status = 'inactive';

  await upsertSubscription({
    userId,
    subscriptionId,
    customerId,
    productId,
    planKey: plan.key,
    status,
    periodStart,
    periodEnd,
    eventType,
    eventId,
    payload,
  });

  if (ACTIVE_EVENT_TYPES.has(eventType) || CANCELED_EVENT_TYPES.has(eventType) || SCHEDULED_CANCEL_EVENT_TYPES.has(eventType)) {
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({ membership_expires_at: periodEnd })
      .eq('id', userId);

    if (profileError) {
      console.error('[api/creem/webhook] profile update failed', profileError);
      return res.status(500).json({ received: false, error: 'Unable to update membership' });
    }
  }

  if (INACTIVE_EVENT_TYPES.has(eventType)) {
    const nowIso = new Date().toISOString();
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({ membership_expires_at: nowIso })
      .eq('id', userId);

    if (profileError) {
      console.error('[api/creem/webhook] profile revoke failed', profileError);
      return res.status(500).json({ received: false, error: 'Unable to update membership' });
    }
  }

  await supabaseService
    .from('creem_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('creem_event_id', eventId);

  return res.status(200).json({ received: true });
}
