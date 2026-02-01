import { useRouter } from 'next/router';
import { SpreadConfig } from '../../config/themedReadings';
import PaywallBadge from './PaywallBadge';

interface SpreadCardProps {
  spread: SpreadConfig;
  theme: string;
  isMember: boolean;
  onLockedClick: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * 单个牌阵卡片组件
 */
export default function SpreadCard({
  spread,
  theme,
  isMember,
  onLockedClick,
  onClick,
}: SpreadCardProps) {
  const router = useRouter();

  // 临时白名单：relationship-development, reconciliation, offer-decision, stay-or-leave, wealth-obstacles 暂时开放（会员系统上线后移除）
  const isTemporarilyOpen = spread.id === 'relationship-development' || spread.id === 'reconciliation' || spread.id === 'offer-decision' || spread.id === 'stay-or-leave' || spread.id === 'wealth-obstacles';
  const isLocked = spread.isPaid && !isMember && !isTemporarilyOpen;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (isLocked) {
      onLockedClick();
      return;
    }

    if (spread.href) {
      router.push(spread.href);
      return;
    }

    // 这些牌阵直接进入抽牌页面
    if (
      spread.id === 'future-lover' || 
      spread.id === 'what-they-think' || 
      spread.id === 'relationship-development' || 
      spread.id === 'reconciliation' ||
      spread.id === 'skills-direction' ||
      spread.id === 'interview-exam-key-reminders' ||
      spread.id === 'offer-decision' ||
      spread.id === 'stay-or-leave' ||
      spread.id === 'current-wealth-status' ||
      spread.id === 'wealth-obstacles'
    ) {
      router.push(`/themed-readings/${theme}/${spread.id}/draw`);
    } else {
      router.push(`/themed-readings/${theme}/${spread.id}`);
    }
  };

  return (
    <div
      className={`
        group relative flex flex-col gap-4 rounded-xl bg-white/5 p-6 
        transition-all duration-300 border border-white/10
        hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow hover:border-primary/50
        cursor-pointer
      `}
      onClick={handleClick}
    >
      {/* 付费锁标识（暂时开放的也显示会员角标） */}
      {(isLocked || isTemporarilyOpen) && <PaywallBadge />}

      {/* 热门标签 */}
      {spread.badge && !isLocked && !isTemporarilyOpen && (
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/30 backdrop-blur-sm">
          <span className="text-primary text-xs font-semibold tracking-wide">
            {spread.badge}
          </span>
        </div>
      )}

      {/* 图标 */}
      {spread.icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10">
          {typeof spread.icon === 'string' ? (
            <span className="material-symbols-outlined text-3xl">
              {spread.icon}
            </span>
          ) : (
            spread.icon
          )}
        </div>
      )}

      {/* 标题 */}
      <div className="flex flex-col gap-1">
        <h3 className="text-white text-xl font-bold leading-tight">
          {spread.titleZh}
        </h3>
      </div>

      {/* 描述 */}
      <p className="text-white/60 text-sm leading-relaxed flex-1">
        {spread.descZh}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-end pt-4 border-t border-white/10">
        <button
          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-primary/20 text-primary hover:bg-primary hover:text-white"
        >
          开始占卜
        </button>
      </div>
    </div>
  );
}

