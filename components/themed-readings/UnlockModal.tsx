import { useRouter } from 'next/router';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 会员解锁提示弹窗
 */
export default function UnlockModal({ isOpen, onClose }: UnlockModalProps) {
  const router = useRouter();

  // 硬防御：只有明确为 true 时才渲染
  if (typeof window === 'undefined') return null; // SSR 阶段不渲染
  if (!isOpen || isOpen !== true) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-[#1a1a2e] rounded-2xl border border-primary/30 shadow-2xl overflow-hidden">
          {/* 顶部装饰 */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* 内容区域 */}
          <div className="p-8">
            {/* 图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">lock</span>
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-white text-2xl font-bold text-center mb-4">
              会员专享
            </h3>

            {/* 说明 */}
            <p className="text-white/60 text-center leading-relaxed mb-8">
              此牌阵为会员专享内容。<br />会员系统即将上线，敬请期待！
            </p>

            {/* 按钮 */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
              >
                了解更多
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

