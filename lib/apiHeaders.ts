import { supabase } from './supabase';

const GUEST_SESSION_STORAGE_KEY = 'guest_trial_session_id';

export async function getAuthHeaders(baseHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    ...(baseHeaders || {}),
    'Content-Type': 'application/json'
  };

  try {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      // 已登录用户优先使用 auth token，不附加游客 header
      return headers;
    }
  } catch (error) {
    console.error('[apiHeaders] getSession failed', error);
  }

  // 未登录时：如果 localStorage 有游客 session，自动附加
  if (typeof window !== 'undefined') {
    const guestSessionId = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
    if (guestSessionId) {
      headers['x-guest-session-id'] = guestSessionId;
    }
  }

  return headers;
}
