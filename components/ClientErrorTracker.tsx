import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trackClientErrorEvent } from '../lib/clientErrorEvents';

function browserLabel(): string {
  if (typeof navigator === 'undefined') return '';
  return [
    navigator.platform,
    navigator.language,
    `${window.innerWidth}x${window.innerHeight}`,
  ].filter(Boolean).join(' | ');
}

function normalizeReason(reason: unknown): { message: string; stack?: string | null } {
  if (reason instanceof Error) {
    return { message: reason.message || 'Unhandled error', stack: reason.stack };
  }
  if (typeof reason === 'string') {
    return { message: reason };
  }
  try {
    return { message: JSON.stringify(reason) || 'Unhandled rejection' };
  } catch {
    return { message: 'Unhandled rejection' };
  }
}

export default function ClientErrorTracker() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const buildBasePayload = () => ({
      pagePath: `${window.location.pathname}${window.location.search}`,
      locale: router.locale ?? null,
      browser: browserLabel(),
    });

    const handleError = (event: ErrorEvent) => {
      void trackClientErrorEvent({
        source: event.message === 'Script error.' ? 'script_error' : 'window_error',
        message: event.message || 'Script error',
        stack: event.error instanceof Error ? event.error.stack : null,
        ...buildBasePayload(),
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = normalizeReason(event.reason);
      void trackClientErrorEvent({
        source: 'unhandled_rejection',
        message: reason.message,
        stack: reason.stack,
        ...buildBasePayload(),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [router.locale]);

  return null;
}
