import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

const STORAGE_KEY_SESSION_ID = 'guest_trial_session_id';
const STORAGE_KEY_EXPIRES_AT = 'guest_trial_expires_at';
const TRIAL_USAGE_LIMIT = 8;

interface GuestTrialState {
  sessionId: string | null;
  expiresAt: string | null;
  isActive: boolean;
  isExpired: boolean;
  totalUsed: number;
  totalRemaining: number;
  hoursLeft: number;
  minutesLeft: number;
  isLoading: boolean;
  /** Returns true if session was created successfully */
  startTrial: () => Promise<boolean>;
  refreshTrialStatus: () => Promise<void>;
  clearTrial: () => void;
}

const GuestTrialContext = createContext<GuestTrialState | null>(null);

function computeTimeLeft(expiresAt: string | null): {
  hoursLeft: number;
  minutesLeft: number;
  isExpired: boolean;
} {
  if (!expiresAt) return { hoursLeft: 0, minutesLeft: 0, isExpired: true };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { hoursLeft: 0, minutesLeft: 0, isExpired: true };
  const totalMinutes = Math.floor(diff / 60_000);
  return {
    hoursLeft: Math.floor(totalMinutes / 60),
    minutesLeft: totalMinutes % 60,
    isExpired: false,
  };
}

export function GuestTrialProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [totalUsed, setTotalUsed] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(TRIAL_USAGE_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const { hoursLeft, minutesLeft } = computeTimeLeft(expiresAt);
  const isActive = !!sessionId && !isExpired;

  const clearTrial = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_SESSION_ID);
      localStorage.removeItem(STORAGE_KEY_EXPIRES_AT);
    }
    setSessionId(null);
    setExpiresAt(null);
    setTotalUsed(0);
    setTotalRemaining(TRIAL_USAGE_LIMIT);
    setIsExpired(false);
  }, []);

  const refreshTrialStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const storedSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
    if (!storedSessionId) {
      setSessionId(null);
      setExpiresAt(null);
      setTotalUsed(0);
      setTotalRemaining(TRIAL_USAGE_LIMIT);
      setIsExpired(false);
      return;
    }

    try {
      const response = await fetch('/api/guest-trial/status', {
        headers: { 'x-guest-session-id': storedSessionId },
      });
      const data = await response.json();

      if (data.valid === true) {
        localStorage.setItem(STORAGE_KEY_SESSION_ID, data.session_id);
        localStorage.setItem(STORAGE_KEY_EXPIRES_AT, data.expires_at);
        setSessionId(data.session_id);
        setExpiresAt(data.expires_at);
        setTotalUsed(data.total_used ?? 0);
        setTotalRemaining(data.total_remaining ?? TRIAL_USAGE_LIMIT);
        setIsExpired(computeTimeLeft(data.expires_at).isExpired);
      } else {
        clearTrial();
        if (data.reason === 'expired') {
          setIsExpired(true);
        }
      }
    } catch (err) {
      console.error('[GuestTrialContext] refreshTrialStatus failed', err);
    }
  }, [clearTrial]);

  const startTrial = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/guest-trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_SESSION_ID, data.session_id);
          localStorage.setItem(STORAGE_KEY_EXPIRES_AT, data.expires_at);
        }
        setSessionId(data.session_id);
        setExpiresAt(data.expires_at);
        setTotalUsed(0);
        setTotalRemaining(TRIAL_USAGE_LIMIT);
        setIsExpired(false);
        return true;
      } else {
        console.error('[GuestTrialContext] startTrial failed', data.error);
        return false;
      }
    } catch (err) {
      console.error('[GuestTrialContext] startTrial unexpected error', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 挂载时从 localStorage 恢复状态并校验
  useEffect(() => {
    refreshTrialStatus();
  }, [refreshTrialStatus]);

  // 多标签页同步：监听 localStorage 变化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_SESSION_ID || e.key === STORAGE_KEY_EXPIRES_AT) {
        refreshTrialStatus();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshTrialStatus]);

  // 每分钟重新计算 isExpired，保持倒计时 UI 同步
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      setIsExpired(computeTimeLeft(expiresAt).isExpired);
    }, 60_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const value: GuestTrialState = {
    sessionId,
    expiresAt,
    isActive,
    isExpired,
    totalUsed,
    totalRemaining,
    hoursLeft,
    minutesLeft,
    isLoading,
    startTrial,
    refreshTrialStatus,
    clearTrial,
  };

  return (
    <GuestTrialContext.Provider value={value}>
      {children}
    </GuestTrialContext.Provider>
  );
}

export function useGuestTrial(): GuestTrialState {
  const ctx = useContext(GuestTrialContext);
  if (!ctx) {
    throw new Error('useGuestTrial must be used within GuestTrialProvider');
  }
  return ctx;
}
