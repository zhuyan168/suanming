import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { trackReadingFunnelEvent } from '../../lib/readingQuestionEvents';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnlockModal({ isOpen, onClose }: UnlockModalProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (isOpen) void trackReadingFunnelEvent('paywall_shown');
  }, [isOpen]);

  if (typeof window === 'undefined') return null;
  if (!isOpen || isOpen !== true) return null;

  const handleGoMembership = () => {
    onClose();
    router.push('/membership');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-[#1a1a2e] rounded-2xl border border-primary/30 shadow-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">lock</span>
              </div>
            </div>

            <h3 className="text-white text-2xl font-bold text-center mb-4">
              {t('spreads.unlockTitle')}
            </h3>

            <p className="text-white/60 text-center leading-relaxed mb-6 whitespace-pre-line">
              {t('spreads.unlockDesc')}
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoMembership}
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
              >
                {t('spreads.goMembership')}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition-colors"
              >
                {t('spreads.backButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
