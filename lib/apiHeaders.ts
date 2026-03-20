import { supabase } from './supabase';

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
    }
  } catch (error) {
    console.error('[apiHeaders] getSession failed', error);
  }

  return headers;
}
