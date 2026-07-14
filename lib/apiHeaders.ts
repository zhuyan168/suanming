import { getSupabaseSession } from './supabaseSession';

const GUEST_SESSION_STORAGE_KEY = 'guest_trial_session_id';
const GUEST_SESSION_EXPIRES_KEY = 'guest_trial_expires_at';

async function ensureGuestSession(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
  const storedExpiresAt = localStorage.getItem(GUEST_SESSION_EXPIRES_KEY);
  if (stored && (!storedExpiresAt || new Date(storedExpiresAt).getTime() > Date.now())) {
    return stored;
  }

  try {
    const response = await fetch('/api/guest-trial/start', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (data?.success && data.session_id) {
      localStorage.setItem(GUEST_SESSION_STORAGE_KEY, data.session_id);
      if (data.expires_at) {
        localStorage.setItem(GUEST_SESSION_EXPIRES_KEY, data.expires_at);
      }
      return data.session_id;
    }
  } catch (error) {
    console.error('[apiHeaders] ensureGuestSession failed', error);
  }

  return null;
}

export async function getAuthHeaders(baseHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    ...(baseHeaders || {}),
    'Content-Type': 'application/json',
  };

  try {
    const { data } = await getSupabaseSession();
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      return headers;
    }
  } catch (error) {
    console.error('[apiHeaders] getSession failed', error);
  }

  if (typeof window !== 'undefined') {
    const guestSessionId = await ensureGuestSession();
    if (guestSessionId) {
      headers['x-guest-session-id'] = guestSessionId;
    }
  }

  return headers;
}

export async function getClientCacheIdentity(): Promise<string> {
  try {
    const { data } = await getSupabaseSession();
    const userId = data?.session?.user?.id;
    if (userId) {
      return `user_${userId}`;
    }
  } catch (error) {
    console.error('[apiHeaders] getClientCacheIdentity failed', error);
  }

  if (typeof window !== 'undefined') {
    const guestSessionId = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
    if (guestSessionId) {
      return `guest_${guestSessionId}`;
    }
  }

  return 'guest_anonymous';
}
