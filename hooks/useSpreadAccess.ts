import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import type { SpreadTheme } from '../config/themedReadings';
import { getSpreadConfig } from '../config/themedReadings';
import { getSpreadByKey, type SpreadAccess } from '../lib/spreads';
import { getAuthHeaders } from '../lib/apiHeaders';

export interface SpreadAccessState {
  loading: boolean;
  allowed: boolean;
  reason?: 'member_only' | 'daily_limit' | 'not_logged_in';
  isMember: boolean;
  userId: string | null;
  remaining?: number;
}

interface UseSpreadAccessOptions {
  /** 主题占卜使用：theme + spreadId */
  theme?: SpreadTheme;
  spreadId?: string;
  /** 通用牌阵使用：直接传 spreadKey（lib/spreads.ts 中的 key）*/
  spreadKey?: string;
  /** 拒绝时的回调 */
  onDenied?: (reason: 'member_only' | 'daily_limit' | 'not_logged_in') => void;
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

    let message = '请先登录账号以继续占卜';
    if (reason === 'member_only') {
      message = '该牌阵为会员专属，请开通会员后使用';
    } else if (reason === 'daily_limit') {
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

      const response = await fetch(`/api/access/check?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || '权限检查失败');
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

      handleDenied(payload.reason ?? 'daily_limit');
    } catch (error) {
      console.error('[useSpreadAccess] 权限检查失败', error);
      handleDenied('not_logged_in');
    }
  }, [theme, spreadId, spreadKey, redirectPath]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return state;
}
