/**
 * 付费锁标识组件
 * 显示在付费牌阵卡片上
 */
export default function PaywallBadge() {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/40">
      <span className="material-symbols-outlined text-primary text-sm">lock</span>
      <span className="text-primary text-xs font-semibold tracking-wide">
        会员专享
      </span>
    </div>
  );
}

