interface SpreadAccessStatusProps {
  loading: boolean;
  failed: boolean;
  retry: () => Promise<void>;
  locale?: string;
  backgroundColor?: string;
}

export default function SpreadAccessStatus({
  loading,
  failed,
  retry,
  locale,
  backgroundColor = '#0f0f23',
}: SpreadAccessStatusProps) {
  const isEn = locale !== 'zh';

  return (
    <div
      className="min-h-screen text-white flex items-center justify-center px-6"
      style={{ backgroundColor }}
      aria-busy={loading}
    >
      {failed ? (
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold mb-2">
            {isEn ? 'We could not verify your reading access.' : '暂时无法确认您的使用资格'}
          </p>
          <p className="text-sm text-white/60 mb-5">
            {isEn
              ? 'Please check your connection and try again.'
              : '请检查网络后重新尝试。'}
          </p>
          <button
            type="button"
            onClick={() => void retry()}
            className="rounded-xl bg-[#7f13ec] px-6 py-3 font-semibold text-white"
          >
            {isEn ? 'Try Again' : '重新尝试'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-white/70" role="status" aria-live="polite">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          <span>{isEn ? 'Checking access…' : '正在确认使用资格…'}</span>
        </div>
      )}
    </div>
  );
}
