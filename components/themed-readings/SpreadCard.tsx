import { useState } from 'react';
import { useRouter } from 'next/router';
import { SpreadConfig } from '../../config/themedReadings';
import PaywallBadge from './PaywallBadge';
import { supabase } from '../../lib/supabase';
import { canUseSpread, getTodayFreeUsageCount } from '../../lib/access';

interface SpreadCardProps {
  spread: SpreadConfig;
  theme: string;
  isMember: boolean;
  userId?: string | null;
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
  userId,
  onLockedClick,
  onClick,
}: SpreadCardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const spreadAccess = spread.access ?? 'free';
  const showPaywallBadge = spreadAccess === 'member' && !isMember;

  const handleClick = async (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (checking) return;

    const targetPath = spread.href 
      ? spread.href 
      : (
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
        ) 
        ? `/themed-readings/${theme}/${spread.id}/draw`
        : `/themed-readings/${theme}/${spread.id}`;

    if (isMember) {
      router.push(targetPath);
      return;
    }

    setChecking(true);

    try {
      let todayFreeUsageCount = 0;
      
      if (userId && spreadAccess === 'free') {
        todayFreeUsageCount = await getTodayFreeUsageCount({ supabase, userId });
      }

      const result = canUseSpread({
        spreadAccess,
        isMember,
        todayFreeUsageCount,
      });

      if (result.allowed) {
        router.push(targetPath);
      } else {
        if (result.reason === 'member_only') {
          alert('该牌阵为会员专属，请开通会员后使用');
        } else if (result.reason === 'daily_limit') {
          alert('今日免费次数已用完，开通会员后可继续使用');
        }
      }
    } catch (error) {
      console.error('[SpreadCard] 权限检查失败:', error);
      router.push(targetPath);
    } finally {
      setChecking(false);
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
      {/* 付费锁标识（仅显示角标，不阻止点击） */}
      {showPaywallBadge && <PaywallBadge />}

      {/* 热门标签 */}
      {spread.badge && !showPaywallBadge && (
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

