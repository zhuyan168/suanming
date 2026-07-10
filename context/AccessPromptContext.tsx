import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface AccessPromptOptions {
  title: string;
  message: string;
  primaryLabel: string;
  primaryHref?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  icon?: string;
}

interface AccessPromptContextValue {
  showAccessPrompt: (options: AccessPromptOptions) => void;
  closeAccessPrompt: () => void;
}

const AccessPromptContext = createContext<AccessPromptContextValue | null>(null);

export function AccessPromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState<AccessPromptOptions | null>(null);

  const closeAccessPrompt = () => setPrompt(null);

  const showAccessPrompt = (options: AccessPromptOptions) => {
    setPrompt(options);
  };

  useEffect(() => {
    const handleRouteChange = () => closeAccessPrompt();
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  const handlePrimaryClick = () => {
    const currentPrompt = prompt;
    if (!currentPrompt) return;

    closeAccessPrompt();
    if (currentPrompt.onPrimary) {
      currentPrompt.onPrimary();
      return;
    }
    if (currentPrompt.primaryHref) {
      if (typeof window !== 'undefined') {
        window.location.assign(currentPrompt.primaryHref);
        return;
      }
      void router.push(currentPrompt.primaryHref);
    }
  };

  const handleSecondaryClick = () => {
    const currentPrompt = prompt;
    closeAccessPrompt();
    currentPrompt?.onSecondary?.();
  };

  return (
    <AccessPromptContext.Provider value={{ showAccessPrompt, closeAccessPrompt }}>
      {children}

      {prompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6">
          <div
            role="presentation"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeAccessPrompt}
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-primary/40 bg-[#161025] shadow-2xl"
          >
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="px-5 py-6 sm:px-6">
              <button
                type="button"
                aria-label="Close"
                onClick={closeAccessPrompt}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-[32px]">
                  {prompt.icon ?? 'auto_awesome'}
                </span>
              </div>

              <h2 className="text-center text-2xl font-bold leading-tight text-white">
                {prompt.title}
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-white/70">
                {prompt.message}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handlePrimaryClick}
                  className="h-11 w-full rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/85"
                >
                  {prompt.primaryLabel}
                </button>
                <button
                  type="button"
                  onClick={handleSecondaryClick}
                  className="h-11 w-full rounded-lg bg-white/10 px-5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                >
                  {prompt.secondaryLabel ?? 'Not now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AccessPromptContext.Provider>
  );
}

export function useAccessPrompt(): AccessPromptContextValue {
  const context = useContext(AccessPromptContext);
  if (!context) {
    throw new Error('useAccessPrompt must be used within AccessPromptProvider');
  }
  return context;
}
