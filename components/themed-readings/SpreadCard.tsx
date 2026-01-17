import { useRouter } from 'next/router';
import { SpreadConfig } from '../../config/themedReadings';
import PaywallBadge from './PaywallBadge';

interface SpreadCardProps {
  spread: SpreadConfig;
  theme: string;
  isMember: boolean;
  onLockedClick: () => void;
}

/**
 * 单个牌阵卡片组件
 */
export default function SpreadCard({
  spread,
  theme,
  isMember,
  onLockedClick,
}: SpreadCardProps) {
  const router = useRouter();

  // 临时白名单：relationship-development, reconciliation 暂时开放（会员系统上线后移除）
  const isTemporarilyOpen = spread.id === 'relationship-development' || spread.id === 'reconciliation';
  const isLocked = spread.isPaid && !isMember && !isTemporarilyOpen;

  const handleClick = () => {
    if (isLocked) {
      onLockedClick();
    } else {
      // 这些牌阵直接进入抽牌页面
      if (
        spread.id === 'future-lover' || 
        spread.id === 'what-they-think' || 
        spread.id === 'relationship-development' || 
        spread.id === 'reconciliation' ||
        spread.id === 'skills-direction'
      ) {
        router.push(`/themed-readings/${theme}/${spread.id}/draw`);
      } else {
        router.push(`/themed-readings/${theme}/${spread.id}`);
      }
    }
  };

  return (
    <div
      className={`
        group relative flex flex-col gap-4 rounded-xl bg-white/5 p-6 
        transition-all duration-300 border border-white/10
        ${isLocked ? 'hover:bg-white/10' : 'hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow hover:border-primary/50'}
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
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 text-3xl">
          {spread.icon}
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
          className={`
            px-4 py-2 rounded-lg font-semibold text-sm transition-all
            ${isLocked 
              ? 'bg-white/10 text-white/70 hover:bg-primary/20 hover:text-primary' 
              : 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
            }
          `}
        >
          {isLocked ? '解锁查看' : '开始占卜'}
        </button>
      </div>
    </div>
  );
}

