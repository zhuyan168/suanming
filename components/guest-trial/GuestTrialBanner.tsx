import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { useGuestTrial } from '../../context/GuestTrialContext';

export default function GuestTrialBanner() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const { isActive, hoursLeft, minutesLeft } = useGuestTrial();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoggedIn || !isActive || dismissed) return null;

  const timeText =
    hoursLeft >= 1
      ? (isEn ? `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}` : `${hoursLeft} 小时`)
      : (isEn ? `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}` : `${minutesLeft} 分钟`);

  return (
    <div className="fixed inset-x-0 top-0 z-[9998] w-full border-b border-purple-500/30 bg-gradient-to-r from-[#2d1b4e] to-[#1e1a3a] shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4">
        <p className="min-w-0 flex-1 text-center text-[13px] leading-snug text-white/85 sm:text-left sm:text-sm">
          {isEn ? (
            <>
              Your free trial ends in{' '}
              <span className="font-semibold text-purple-300">{timeText}</span>.{' '}
              You can try up to 8 readings, including some member-only spreads. Sign up to get a daily free reading allowance.
            </>
          ) : (
            <>
              免费试用还剩{' '}
              <span className="font-semibold text-purple-300">{timeText}</span>，可体验 8 次解读，部分会员牌阵也可试用。注册后每日可获得免费次数。
            </>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/register"
            className="inline-flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-[#7f13ec] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#6b0fd4] sm:h-8 sm:flex-none"
          >
            {isEn ? 'Get More Free Readings' : '获得更多免费次数'}
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-white/50 transition-colors hover:text-white/80 sm:h-8 sm:w-8"
            aria-label={isEn ? 'Dismiss banner' : '关闭横幅'}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
