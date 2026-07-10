import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUserIdFromRequest } from '../../lib/accessServer';
import { supabaseService } from '../../lib/supabaseServer';

const MAX_TEXT_LENGTH = 2000;
const MAX_STACK_LENGTH = 6000;

function trimText(value: unknown, maxLength = MAX_TEXT_LENGTH): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function guestIdFromRequest(req: NextApiRequest): string | null {
  const value = req.headers['x-guest-session-id'];
  const guestId = Array.isArray(value) ? value[0] : value;
  return typeof guestId === 'string' && /^[0-9a-f-]{36}$/i.test(guestId) ? guestId : null;
}

function getIpHashSource(req: NextApiRequest): string | null {
  const forwardedFor = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  const ip = raw?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
  return ip ? Buffer.from(ip).toString('base64').slice(0, 64) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const source = trimText(body.source, 80) || 'unknown';
  const message = trimText(body.message) || 'Unknown client error';
  const stack = trimText(body.stack, MAX_STACK_LENGTH);
  const pagePath = trimText(body.pagePath, 1200);
  const locale = trimText(body.locale, 20);
  const userAgent = trimText(req.headers['user-agent'], 600);
  const browser = trimText(body.browser, 600);
  const componentStack = trimText(body.componentStack, MAX_STACK_LENGTH);

  const userId = await getAuthenticatedUserIdFromRequest(req);
  const guestId = guestIdFromRequest(req);

  const { error } = await supabaseService.from('client_error_events').insert({
    user_id: userId ?? null,
    guest_id: guestId,
    source,
    message,
    stack,
    component_stack: componentStack,
    page_path: pagePath,
    locale,
    browser,
    user_agent: userAgent,
    ip_hash: getIpHashSource(req),
  });

  if (error) {
    console.error('[client-error-events] insert failed', error);
    return res.status(204).end();
  }

  return res.status(204).end();
}
