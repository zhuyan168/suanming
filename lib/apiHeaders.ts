import { supabase } from './supabase';

const GUEST_SESSION_STORAGE_KEY = 'guest_trial_session_id';

export async function getAuthHeaders(baseHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    ...(baseHeaders || {}),
    'Content-Type': 'application/json',
  };

  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      return headers;
    }
  } catch (error) {
    console.error('[apiHeaders] getSession failed', error);
  }

  if (typeof window !== 'undefined') {
    const guestSessionId = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
    if (guestSessionId) {
      headers['x-guest-session-id'] = guestSessionId;
    }
  }

  return headers;
}

export async function getClientCacheIdentity(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
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
