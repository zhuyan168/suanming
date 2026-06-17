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

const MEMBERSHIP_EXTENSION_EVENT_TYPES = new Set([
  'checkout.completed',
  'subscription.paid',
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

const REFUND_EVENT_TYPES = new Set([
  'refund.created',
  'refund.succeeded',
  'payment.refunded',
  'checkout.refunded',
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
    (obj?.object === 'subscription' && typeof obj?.id === 'string' ? obj.id : null) ||
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

function getCustomerEmail(obj: any): string | null {
  const email = obj?.customer?.email || obj?.email || obj?.subscription?.customer?.email;
  return typeof email === 'string' && email.trim() ? email : null;
}

function getMetadata(obj: any): Record<string, any> {
  const metadata = obj?.metadata || obj?.subscription?.metadata || obj?.checkout?.metadata;
  return metadata && typeof metadata === 'object' ? metadata : {};
}

function parseDate(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const numericValue = typeof value === 'number' && value < 10_000_000_000 ? value * 1000 : value;
  const date = new Date(numericValue);
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
    parseDate(obj?.last_transaction?.period_end) ||
    parseDate(obj?.lastTransaction?.periodEnd) ||
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
    parseDate(obj?.current_period_start_date) ||
    parseDate(obj?.currentPeriodStartDate) ||
    parseDate(obj?.period_start) ||
    parseDate(obj?.periodStart) ||
    parseDate(obj?.last_transaction?.period_start) ||
    parseDate(obj?.lastTransaction?.periodStart) ||
    parseDate(obj?.subscription?.current_period_start) ||
    parseDate(obj?.subscription?.currentPeriodStart) ||
    parseDate(obj?.subscription?.current_period_start_date) ||
    parseDate(obj?.subscription?.currentPeriodStartDate)
  );
}

function addUtcDays(from: Date, days: number): string {
  const date = new Date(from.getTime());
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function addMilliseconds(from: Date, milliseconds: number): string {
  return new Date(from.getTime() + milliseconds).toISOString();
}

function subtractUtcDays(from: Date, days: number): string {
  const date = new Date(from.getTime());
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function shiftUtcDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function laterIso(a: string | null | undefined, b: string): string {
  if (!a) return b;
  const aTime = new Date(a).getTime();
  const bTime = new Date(b).getTime();
  if (!Number.isFinite(aTime)) return b;
  if (!Number.isFinite(bTime)) return a;
  return aTime >= bTime ? a : b;
}

async function findExistingCreemPeriodLedger(params: {
  subscriptionId: string | null;
  periodEnd: string | null;
}): Promise<{ ledger: any | null; error: unknown | null }> {
  if (!params.subscriptionId || !params.periodEnd) {
    return { ledger: null, error: null };
  }

  const { data, error } = await supabaseService
    .from('membership_ledger')
    .select('id, creem_event_id, creem_period_end, expires_after, plan_key')
    .eq('source', 'creem')
    .eq('action', 'extend')
    .eq('creem_subscription_id', params.subscriptionId)
    .gte('creem_period_end', shiftUtcDays(params.periodEnd, -1))
    .lte('creem_period_end', shiftUtcDays(params.periodEnd, 1))
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[api/creem/webhook] membership ledger period check failed', error);
    return { ledger: null, error };
  }

  return { ledger: data || null, error: null };
}

async function writeMembershipProfile(params: {
  userId: string;
  email: string | null;
  membershipExpiresAt: string;
  planKey: string;
}): Promise<{ error: unknown | null }> {
  const payload = {
    membership_expires_at: params.membershipExpiresAt,
    is_member: true,
    member_type: params.planKey,
  };

  const { data: updated, error: updateError } = await supabaseService
    .from('profiles')
    .update(payload)
    .eq('id', params.userId)
    .select('id');

  if (updateError) return { error: updateError };
  if (updated?.length) return { error: null };

  const { error: insertError } = await supabaseService
    .from('profiles')
    .insert({
      id: params.userId,
      email: params.email,
      ...payload,
    });

  return { error: insertError ?? null };
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

async function extendMembershipFromCurrentProfile(params: {
  userId: string;
  durationDays: number;
  planKey: string;
  productId: string;
  eventId: string;
  subscriptionId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  email: string | null;
  payload: CreemWebhookPayload;
}): Promise<{ expiresAt: string | null; skipped: boolean; error: unknown | null }> {
  const { data: profile, error: readError } = await supabaseService
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', params.userId)
    .maybeSingle();

  if (readError) {
    console.error('[api/creem/webhook] profile read failed', readError);
    return { expiresAt: null, skipped: false, error: readError };
  }

  const now = new Date();
  const currentRaw = profile?.membership_expires_at;
  const currentExp = currentRaw ? new Date(currentRaw as string) : null;
  const base = currentExp && !Number.isNaN(currentExp.getTime()) && currentExp > now ? currentExp : now;
  const periodStart = params.periodStart ? new Date(params.periodStart) : null;
  const periodEnd = params.periodEnd ? new Date(params.periodEnd) : null;
  const hasValidPeriod =
    periodStart &&
    periodEnd &&
    !Number.isNaN(periodStart.getTime()) &&
    !Number.isNaN(periodEnd.getTime()) &&
    periodEnd > periodStart;

  const periodDurationMs = hasValidPeriod ? periodEnd.getTime() - periodStart.getTime() : null;
  const newExpiresAt =
    periodDurationMs !== null && periodStart !== null && base > periodStart
      ? addMilliseconds(base, periodDurationMs)
      : periodEnd && !Number.isNaN(periodEnd.getTime()) && periodEnd > now
        ? periodEnd.toISOString()
        : addUtcDays(base, params.durationDays);
  const daysDelta = periodDurationMs
    ? Math.max(1, Math.round(periodDurationMs / 86_400_000))
    : params.durationDays;

  const { ledger: existingPeriodLedger, error: existingPeriodError } = await findExistingCreemPeriodLedger({
    subscriptionId: params.subscriptionId,
    periodEnd: params.periodEnd,
  });

  if (existingPeriodError) {
    return { expiresAt: null, skipped: false, error: existingPeriodError };
  }

  if (existingPeriodLedger) {
    const repairExpiresAt = laterIso(
      currentRaw,
      existingPeriodLedger.expires_after || params.periodEnd || newExpiresAt
    );
    const { error: repairError } = await writeMembershipProfile({
      userId: params.userId,
      email: params.email,
      membershipExpiresAt: repairExpiresAt,
      planKey: existingPeriodLedger.plan_key || params.planKey,
    });

    if (repairError) {
      console.error('[api/creem/webhook] profile repair for existing membership ledger failed', repairError);
      return { expiresAt: null, skipped: false, error: repairError };
    }

    console.info('[api/creem/webhook] membership extension period already recorded', {
      eventId: params.eventId,
      existingEventId: existingPeriodLedger.creem_event_id,
      subscriptionId: params.subscriptionId,
      periodEnd: params.periodEnd,
      existingPeriodEnd: existingPeriodLedger.creem_period_end,
    });
    return { expiresAt: repairExpiresAt, skipped: true, error: null };
  }

  const { data: ledgerRow, error: ledgerError } = await supabaseService
    .from('membership_ledger')
    .insert({
      user_id: params.userId,
      source: 'creem',
      action: 'extend',
      days_delta: daysDelta,
      expires_before: currentRaw || null,
      expires_after: newExpiresAt,
      plan_key: params.planKey,
      creem_event_id: params.eventId,
      creem_subscription_id: params.subscriptionId,
      creem_product_id: params.productId,
      creem_period_end: params.periodEnd,
      metadata: params.payload,
    })
    .select('id')
    .single();

  if (ledgerError) {
    if ((ledgerError as any).code === '23505') {
      console.info('[api/creem/webhook] membership extension already recorded', {
        eventId: params.eventId,
        subscriptionId: params.subscriptionId,
        periodEnd: params.periodEnd,
      });
      return { expiresAt: null, skipped: true, error: null };
    }
    console.error('[api/creem/webhook] membership ledger insert failed', ledgerError);
    return { expiresAt: null, skipped: false, error: ledgerError };
  }

  const { error: updateError } = await writeMembershipProfile({
    userId: params.userId,
    email: params.email,
    membershipExpiresAt: newExpiresAt,
    planKey: params.planKey,
  });

  if (updateError) {
    console.error('[api/creem/webhook] profile membership extension failed', updateError);
    if (ledgerRow?.id) {
      await supabaseService.from('membership_ledger').delete().eq('id', ledgerRow.id);
    }
    return { expiresAt: null, skipped: false, error: updateError };
  }

  return { expiresAt: newExpiresAt, skipped: false, error: null };
}

async function findLatestUnreversedCreemLedger(params: {
  subscriptionId: string | null;
  userId: string | null;
  productId: string | null;
}): Promise<any | null> {
  let query = supabaseService
    .from('membership_ledger')
    .select('id, user_id, days_delta, expires_before, expires_after, plan_key, creem_subscription_id, creem_product_id, creem_period_end, created_at')
    .eq('source', 'creem')
    .eq('action', 'extend')
    .order('created_at', { ascending: false })
    .limit(10);

  if (params.subscriptionId) {
    query = query.eq('creem_subscription_id', params.subscriptionId);
  } else if (params.userId) {
    query = query.eq('user_id', params.userId);
    if (params.productId) {
      query = query.eq('creem_product_id', params.productId);
    }
  } else {
    return null;
  }

  const { data: ledgers, error } = await query;

  if (error) {
    console.error('[api/creem/webhook] find creem ledger for refund failed', error);
    return null;
  }

  for (const ledger of ledgers || []) {
    const { data: reversal, error: reversalError } = await supabaseService
      .from('membership_ledger')
      .select('id')
      .eq('source', 'refund')
      .eq('action', 'reverse')
      .eq('related_ledger_id', ledger.id)
      .maybeSingle();

    if (reversalError) {
      console.error('[api/creem/webhook] find refund reversal failed', reversalError);
      continue;
    }

    if (!reversal) return ledger;
  }

  return null;
}

async function findLatestUnreversedCreemLedgerForRefund(params: {
  subscriptionId: string | null;
  productId: string | null;
}): Promise<any | null> {
  const bySubscription = await findLatestUnreversedCreemLedger({
    subscriptionId: params.subscriptionId,
    userId: null,
    productId: null,
  });
  if (bySubscription) return bySubscription;

  const userId = await findUserIdFromSubscription(params.subscriptionId);
  return findLatestUnreversedCreemLedger({
    subscriptionId: null,
    userId,
    productId: params.productId,
  });
}

async function reverseMembershipForRefund(params: {
  eventId: string;
  subscriptionId: string | null;
  productId: string | null;
  payload: CreemWebhookPayload;
}): Promise<{ reversed: boolean; error: unknown | null }> {
  const originalLedger = await findLatestUnreversedCreemLedgerForRefund({
    subscriptionId: params.subscriptionId,
    productId: params.productId,
  });
  if (!originalLedger) {
    console.info('[api/creem/webhook] no unreversed membership ledger found for refund', {
      eventId: params.eventId,
      subscriptionId: params.subscriptionId,
      productId: params.productId,
    });
    return { reversed: false, error: null };
  }

  const { data: profile, error: readError } = await supabaseService
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', originalLedger.user_id)
    .maybeSingle();

  if (readError) {
    console.error('[api/creem/webhook] profile read for refund failed', readError);
    return { reversed: false, error: readError };
  }

  const now = new Date();
  const currentRaw = profile?.membership_expires_at;
  const currentExp = currentRaw ? new Date(currentRaw as string) : null;
  const base = currentExp && !Number.isNaN(currentExp.getTime()) && currentExp > now ? currentExp : now;
  const reversedIso = subtractUtcDays(base, Math.abs(Number(originalLedger.days_delta) || 0));
  const reversedDate = new Date(reversedIso);
  const newExpiresAt = reversedDate > now ? reversedIso : now.toISOString();

  const { data: ledgerRow, error: ledgerError } = await supabaseService
    .from('membership_ledger')
    .insert({
      user_id: originalLedger.user_id,
      source: 'refund',
      action: 'reverse',
      days_delta: -Math.abs(Number(originalLedger.days_delta) || 0),
      expires_before: currentRaw || null,
      expires_after: newExpiresAt,
      plan_key: originalLedger.plan_key,
      creem_event_id: params.eventId,
      creem_subscription_id: originalLedger.creem_subscription_id,
      creem_product_id: originalLedger.creem_product_id,
      creem_period_end: originalLedger.creem_period_end,
      related_ledger_id: originalLedger.id,
      metadata: params.payload,
    })
    .select('id')
    .single();

  if (ledgerError) {
    if ((ledgerError as any).code === '23505') {
      console.info('[api/creem/webhook] refund reversal already recorded', {
        eventId: params.eventId,
        subscriptionId: params.subscriptionId,
      });
      return { reversed: false, error: null };
    }
    console.error('[api/creem/webhook] refund ledger insert failed', ledgerError);
    return { reversed: false, error: ledgerError };
  }

  const isStillMember = new Date(newExpiresAt).getTime() > Date.now();
  const { error: updateError } = await supabaseService
    .from('profiles')
    .upsert({
      id: originalLedger.user_id,
      membership_expires_at: newExpiresAt,
      is_member: isStillMember,
      member_type: isStillMember ? originalLedger.plan_key : null,
    }, { onConflict: 'id' });

  if (updateError) {
    console.error('[api/creem/webhook] profile refund reversal failed', updateError);
    if (ledgerRow?.id) {
      await supabaseService.from('membership_ledger').delete().eq('id', ledgerRow.id);
    }
    return { reversed: false, error: updateError };
  }

  return { reversed: true, error: null };
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
      console.info('[api/creem/webhook] event already recorded, checking whether processing can be completed', {
        eventType,
        eventId,
        subscriptionId,
      });
    } else {
      console.error('[api/creem/webhook] event insert failed', eventInsertError);
      return res.status(500).json({ received: false, error: 'Unable to record webhook event' });
    }
  }

  if (REFUND_EVENT_TYPES.has(eventType)) {
    const { error: refundError } = await reverseMembershipForRefund({
      eventId,
      subscriptionId,
      productId: getProductId(eventObject),
      payload,
    });

    if (refundError) {
      return res.status(500).json({ received: false, error: 'Unable to process refund' });
    }

    await supabaseService
      .from('creem_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('creem_event_id', eventId);

    return res.status(200).json({ received: true });
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
  const customerEmail = getCustomerEmail(eventObject);

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

  if (MEMBERSHIP_EXTENSION_EVENT_TYPES.has(eventType)) {
    const { error: profileError } = await extendMembershipFromCurrentProfile({
      userId,
      durationDays: plan.fallbackDurationDays,
      planKey: plan.key,
      productId,
      eventId,
      subscriptionId,
      periodStart,
      periodEnd,
      email: customerEmail,
      payload,
    });

    if (profileError) {
      return res.status(500).json({ received: false, error: 'Unable to update membership' });
    }
  } else if (CANCELED_EVENT_TYPES.has(eventType) || SCHEDULED_CANCEL_EVENT_TYPES.has(eventType) || INACTIVE_EVENT_TYPES.has(eventType)) {
    console.info('[api/creem/webhook] subscription status recorded without shortening membership', {
      eventType,
      eventId,
      subscriptionId,
      userId,
      periodEnd,
    });
  }

  if (PAST_DUE_EVENT_TYPES.has(eventType)) {
    console.info('[api/creem/webhook] subscription past due recorded without changing membership', {
      eventType,
      eventId,
      subscriptionId,
      userId,
    });
  }

  await supabaseService
    .from('creem_webhook_events')
    .update({
      processed_at: new Date().toISOString(),
      event_type: eventType || 'unknown',
      creem_subscription_id: subscriptionId,
      payload,
    })
    .eq('creem_event_id', eventId);

  return res.status(200).json({ received: true });
}
