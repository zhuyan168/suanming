import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { trackReadingFunnelEvent } from '../lib/readingQuestionEvents';

const SIGNUP_PENDING_KEY = 'reading_funnel_signup_pending';

function isResultPath(path: string): boolean {
  const clean = path.split('?')[0].split('#')[0];
  return /\/(result|reading)$/.test(clean);
}

export default function ReadingFunnelTracker() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady || !isResultPath(router.asPath)) return;
    const timer = window.setTimeout(() => {
      void trackReadingFunnelEvent('result_viewed');
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [router.asPath, router.isReady]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_IN' || sessionStorage.getItem(SIGNUP_PENDING_KEY) !== '1') return;
      sessionStorage.removeItem(SIGNUP_PENDING_KEY);
      void trackReadingFunnelEvent('signup_after_result');
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}

