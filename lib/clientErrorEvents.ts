import { getSupabaseSession } from './supabaseSession';

const GUEST_SESSION_STORAGE_KEY = 'guest_trial_session_id';

interface ClientErrorEventPayload {
  source: string;
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  pagePath?: string | null;
  locale?: string | null;
  browser?: string | null;
}

let lastEventKey = '';
let lastEventAt = 0;

function shouldSkipDuplicate(payload: ClientErrorEventPayload): boolean {
  const key = `${payload.source}|${payload.message}|${payload.pagePath ?? ''}`;
  const now = Date.now();
  if (key === lastEventKey && now - lastEventAt < 5000) return true;
  lastEventKey = key;
  lastEventAt = now;
  return false;
}

export async function trackClientErrorEvent(payload: ClientErrorEventPayload): Promise<void> {
  try {
    if (shouldSkipDuplicate(payload)) return;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const { data } = await getSupabaseSession();
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    } else if (typeof window !== 'undefined') {
      const guestSessionId = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
      if (guestSessionId) headers['x-guest-session-id'] = guestSessionId;
    }

    await fetch('/api/client-error-events', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn('[clientErrorEvents] tracking failed', error);
  }
}
