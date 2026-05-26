import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import type { SpreadTheme } from '../config/themedReadings';
import { getSpreadConfig } from '../config/themedReadings';
import { getSpreadByKey, type SpreadAccess } from '../lib/spreads';
import { getAuthHeaders } from '../lib/apiHeaders';
import { supabase } from '../lib/supabase';

export interface SpreadAccessState {
  loading: boolean;
  allowed: boolean;
  reason?:
    | 'member_only'
    | 'daily_limit'
    | 'not_logged_in'
    | 'guest_trial_expired'
    | 'guest_trial_limit_exceeded'
    | 'feature_trial_limit_exceeded';
  isMember: boolean;
  userId: string | null;
  remaining?: number;
}

// Codes that the access-check API (or any middleware in front of it) may return
// as a "business denial" — these must NEVER be treated as Runtime Errors.
const BUSINESS_DENIAL_CODES = new Set([
  'not_logged_in',
  'member_required',
  'member_only',
  'limit_reached',
  'daily_limit',
  'forbidden',
  'unauthorized',
  // Guest trial denial codes
  'guest_trial_invalid',
  'guest_trial_expired',
  'guest_trial_limit_exceeded',
  'feature_trial_limit_exceeded',
]);

function resolveReason(
  code: string,
  httpStatus: number,
  spreadAccess: SpreadAccess = 'free'
): SpreadAccessState['reason'] {
  // Explicit semantic codes always win, regardless of HTTP status.
  if (code === 'not_logged_in' || code === 'unauthorized') {
    return 'not_logged_in';
  }
  if (code === 'member_required' || code === 'member_only') {
    return 'member_only';
  }
  if (code === 'limit_reached' || code === 'daily_limit') {
    return 'daily_limit';
  }
  if (code === 'forbidden' || code === 'access_denied') {
    // "forbidden" without further detail: use spread type to pick the right copy.
    return spreadAccess === 'member' ? 'member_only' : 'daily_limit';
  }
  // Guest trial denial codes
  if (code === 'guest_trial_expired') return 'guest_trial_expired';
  if (code === 'guest_trial_limit_exceeded') return 'guest_trial_limit_exceeded';
  if (code === 'feature_trial_limit_exceeded') return 'feature_trial_limit_exceeded';
  if (code === 'guest_trial_invalid') return 'not_logged_in';

  // No semantic code — fall back on HTTP status + spread context.
  if (httpStatus === 401) {
    return 'not_logged_in';
  }
  if (httpStatus === 403) {
    // A member spread being 403'd almost certainly means membership required.
    // A free spread being 403'd almost certainly means the daily limit was hit.
    return spreadAccess === 'member' ? 'member_only' : 'daily_limit';
  }

  return 'not_logged_in';
}

interface UseSpreadAccessOptions {
  /** 主题占卜使用：theme + spreadId */
  theme?: SpreadTheme;
  spreadId?: string;
  /** 通用牌阵使用：直接传 spreadKey（lib/spreads.ts 中的 key）*/
  spreadKey?: string;
  /** 拒绝时的回调 */
  onDenied?: (reason: NonNullable<SpreadAccessState['reason']>) => void;
  /** 拒绝时是否自动重定向，默认为 true */
  redirectOnDenied?: boolean;
  /** 重定向目标路径，默认根据 theme / spreadKey 推断 */
  redirectPath?: string;
}

export function useSpreadAccess(options: UseSpreadAccessOptions): SpreadAccessState {
  const { theme, spreadId, spreadKey, onDenied, redirectOnDenied = true, redirectPath } = options;
  const router = useRouter();

  const [state, setState] = useState<SpreadAccessState>({
    loading: true,
    allowed: false,
    isMember: false,
    userId: null,
  });

  // Tracks when the last access check completed; used by the visibility-change
  // handler to avoid hammering the server on rapid tab switches.
  const lastCheckedRef = useRef<number>(0);

  const handleDenied = (reason: SpreadAccessState['reason']) => {
    setState({
      loading: false,
      allowed: false,
      reason,
      isMember: false,
      userId: null,
    });

    if (onDenied && reason) {
      onDenied(reason);
    }

    if (!redirectOnDenied || !reason) {
      return;
    }

    if (reason === 'member_only') {
      router.replace('/membership');
      return;
    }

    // Guest trial exhausted — guide toward registration
    if (
      reason === 'guest_trial_expired' ||
      reason === 'guest_trial_limit_exceeded' ||
      reason === 'feature_trial_limit_exceeded'
    ) {
      const isEn = router.locale === 'en';
      const guestDenialMessages: Record<
        'guest_trial_expired' | 'guest_trial_limit_exceeded' | 'feature_trial_limit_exceeded',
        string
      > = {
        guest_trial_expired: isEn
          ? 'Your free trial has ended. Sign up to save your readings and continue.'
          : '您的免费试用已结束。注册账号即可保存解读记录并继续使用。',
        guest_trial_limit_exceeded: isEn
          ? "You've used all 8 free trial readings. Sign up to continue and save your readings."
          : '您的 8 次免费试用解读已用完。注册账号即可继续使用并保存解读记录。',
        feature_trial_limit_exceeded: isEn
          ? "You've used your free trial for this spread. Sign up to unlock more readings and save your results."
          : '这个牌阵的免费体验次数已用完。注册或开通会员后，可继续使用并保存解读记录。',
      };
      alert(guestDenialMessages[reason as 'guest_trial_expired' | 'guest_trial_limit_exceeded' | 'feature_trial_limit_exceeded']);
      router.replace('/register');
      return;
    }

    let message = '请先登录账号以继续占卜';
    if (reason === 'daily_limit') {
      message = '今日免费次数已用完，开通会员后可继续使用';
    }

    alert(message);

    if (reason === 'not_logged_in') {
      router.replace('/login');
      return;
    }

    const targetPath = redirectPath || (theme ? `/themed-readings/${theme}` : '/reading/general');
    router.replace(targetPath);
  };

  const checkAccess = useCallback(async () => {
    // Record the moment this check starts so the visibility-change handler
    // can decide whether a recheck is needed on next tab focus.
    lastCheckedRef.current = Date.now();

    try {
      let spreadAccess: SpreadAccess = 'free';

      if (spreadKey) {
        const spreadMeta = getSpreadByKey(spreadKey);
        if (!spreadMeta) {
          console.warn(`[useSpreadAccess] 未找到牌阵配置 spreadKey=${spreadKey}`);
          setState({ loading: false, allowed: true, isMember: false, userId: null });
          return;
        }
        spreadAccess = spreadMeta.access;
      } else if (theme && spreadId) {
        const spreadConfig = getSpreadConfig(theme, spreadId);
        if (!spreadConfig) {
          console.warn(`[useSpreadAccess] 未找到牌阵配置 ${theme}/${spreadId}`);
          setState({ loading: false, allowed: true, isMember: false, userId: null });
          return;
        }
        spreadAccess = spreadConfig.access ?? 'free';
      } else {
        console.warn('[useSpreadAccess] 未提供 spreadKey 或 theme + spreadId');
        setState({ loading: false, allowed: true, isMember: false, userId: null });
        return;
      }

      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      params.set('spreadAccess', spreadAccess);
      // Send the browser's IANA timezone so the server can compute "today"
      // relative to the user's local clock rather than a fixed server timezone.
      params.set('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      // Send spread key for per-feature guest trial limit checking
      const resolvedKey = spreadKey || (theme && spreadId ? `${theme}-${spreadId}` : null);
      if (resolvedKey) params.set('spreadKey', resolvedKey);

      const response = await fetch(`/api/access/check?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        // Try to read the body; an unparseable body is itself a true error signal.
        let errPayload: Record<string, unknown> = {};
        try {
          errPayload = await response.json();
        } catch {
          // Body is not JSON — this is a true server/infrastructure error.
          throw new Error(`权限检查失败 (${response.status})`);
        }

        // Extract a semantic denial code if the server sent one.
        const code =
          typeof errPayload.code === 'string'
            ? errPayload.code
            : typeof errPayload.error === 'string'
            ? errPayload.error
            : '';

        // 4xx with a known business code → soft denial, not a crash.
        // Also treat any plain 401/403 as a business denial even without a code.
        const isBusinessDenial =
          BUSINESS_DENIAL_CODES.has(code) ||
          response.status === 401 ||
          response.status === 403;

        if (isBusinessDenial) {
          handleDenied(resolveReason(code, response.status, spreadAccess));
          return;
        }

        // 5xx or unexpected 4xx — genuine server/infrastructure error.
        throw new Error(
          typeof errPayload.error === 'string'
            ? errPayload.error
            : `权限检查失败 (${response.status})`
        );
      }

      const payload = await response.json();
      if (payload.allowed) {
        setState({
          loading: false,
          allowed: true,
          isMember: payload.isMember,
          userId: payload.userId ?? null,
          remaining: payload.remaining,
        });
        return;
      }

      // payload.reason comes from the server and is already typed correctly.
      // Only fall back to spread-context inference when the server omits it.
      handleDenied(payload.reason ?? (spreadAccess === 'member' ? 'member_only' : 'daily_limit'));
    } catch (error) {
      console.error('[useSpreadAccess] 权限检查失败', error);
      // Network/server errors should NOT be treated as "not logged in".
      // Show a neutral error state so the user isn't wrongly redirected.
      setState({ loading: false, allowed: false, reason: undefined, isMember: false, userId: null });
    }
  }, [theme, spreadId, spreadKey, redirectPath]);

  useEffect(() => {
    let cancelled = false;

    // Wait for Supabase to finish hydrating the auth session from storage before
    // making the access check. Without this, getSession() may return null on first
    // render even for logged-in users, triggering a false "not_logged_in" denial.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') {
        subscription.unsubscribe();
        if (!cancelled) {
          checkAccess();
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [checkAccess]);

  // Recheck access when the user returns to this tab after being away.
  // This handles the "crossed midnight without refreshing the page" scenario:
  // the user's free quota resets at their local midnight, and the next time
  // they tab back in (after ≥ 60 s since the last check) we re-verify.
  //
  // We use visibilitychange rather than a midnight timer because:
  //  - No need to compute ms-to-midnight or handle DST / clock-change edge cases
  //  - No stale timer references after component updates
  //  - Naturally triggers when the user comes back to the page, which is exactly
  //    when an updated answer is most useful
  //  - A 60-second debounce prevents hammering the server on rapid tab switches
  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastCheckedRef.current > 60_000
      ) {
        checkAccess();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [checkAccess]);

  return state;
}
