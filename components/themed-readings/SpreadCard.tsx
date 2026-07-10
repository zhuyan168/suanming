import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { SpreadConfig } from '../../config/themedReadings';
import PaywallBadge from './PaywallBadge';
import { useGuestTrial } from '../../context/GuestTrialContext';
import { useAccessPrompt } from '../../context/AccessPromptContext';

interface SpreadCardProps {
  spread: SpreadConfig;
  theme: string;
  isMember: boolean;
  membershipLoading?: boolean;
  /** 当前登录用户的 ID（null 表示未登录游客）*/
  userId: string | null;
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
  membershipLoading = false,
  userId,
  onLockedClick,
  onClick,
}: SpreadCardProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const isZh = router.locale === 'zh';
  const { isActive: isTrialActive, startTrial } = useGuestTrial();
  const { showAccessPrompt } = useAccessPrompt();
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const title = isZh ? spread.titleZh : (spread.titleEn || spread.titleZh);
  const desc  = isZh ? spread.descZh  : (spread.descEn  || spread.descZh);

  const spreadAccess = spread.access ?? 'free';
  // Guest visitors can try member spreads during the trial, so only show the
  // member badge to signed-in non-members.
  const showPaywallBadge = spreadAccess === 'member' && !isMember && !!userId;

  // guest trial 绕过仅对未登录游客有效；已登录用户不受影响
  const guestTrialAllows = isTrialActive && !userId;

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

  const handleClick = async (e: React.MouseEvent) => {
    if (isStartingTrial || membershipLoading) return;

    if (onClick) {
      onClick(e);
      return;
    }

    if (spreadAccess === 'member' && !isMember && !!userId) {
      router.push('/membership');
      return;
    }

    if (spreadAccess === 'member' && !guestTrialAllows && !userId) {
      setIsStartingTrial(true);
      const result = await startTrial();
      setIsStartingTrial(false);

      if (!result.success) {
        const failureReason = 'reason' in result ? result.reason : 'unknown';
        if (failureReason === 'trial_expired' || failureReason === 'trial_limit_exceeded') {
          showAccessPrompt({
            title: isZh ? '免费次数已用完' : 'Free readings used',
            message: isZh
              ? '您的 3 次免注册免费解读已用完。免费注册后可获得更多每日免费次数并保存占卜记录。'
              : "You've used your 3 free readings. Create a free account to get more daily readings and save your results.",
            primaryLabel: isZh ? '免费注册' : 'Create free account',
            primaryHref: `/register?next=${encodeURIComponent(targetPath)}`,
            secondaryLabel: isZh ? '稍后再说' : 'Maybe later',
            icon: 'auto_awesome',
          });
          return;
        }

        showAccessPrompt({
          title: isZh ? '暂时无法开始' : 'Unable to start',
          message: isZh
            ? '暂时无法开始免费解读，请检查网络后重试。'
            : 'We could not start your free reading. Please check your connection and try again.',
          primaryLabel: isZh ? '重试' : 'Try again',
          onPrimary: () => void router.push(targetPath),
          secondaryLabel: isZh ? '稍后再说' : 'Maybe later',
          icon: 'refresh',
        });
        return;
      }
    }

    router.push(targetPath);
  };

  return (
    <div
      className={`
        group relative flex flex-col gap-4 rounded-xl bg-white/5 p-6 
        transition-all duration-300 border border-white/10
        hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow hover:border-primary/50
        cursor-pointer
      `}
      onClick={(event) => void handleClick(event)}
      aria-busy={isStartingTrial || membershipLoading}
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
          {title}
        </h3>
      </div>

      {/* 描述 */}
      <p className="text-white/60 text-sm leading-relaxed flex-1">
        {desc}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-end pt-4 border-t border-white/10">
        <button
          type="button"
          disabled={isStartingTrial || membershipLoading}
          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-primary/20 text-primary hover:bg-primary hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {isStartingTrial
            ? (isZh ? '正在开启免费试用…' : 'Starting Free Trial…')
            : t('spreads.beginReading')}
        </button>
      </div>
    </div>
  );
}
