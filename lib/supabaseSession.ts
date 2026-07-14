import { supabase } from './supabase';

type SupabaseSessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;

let pendingSessionRequest: Promise<SupabaseSessionResult> | null = null;

export async function getSupabaseSession(): Promise<SupabaseSessionResult> {
  if (!pendingSessionRequest) {
    pendingSessionRequest = supabase.auth.getSession().finally(() => {
      pendingSessionRequest = null;
    });
  }

  return pendingSessionRequest;
}
