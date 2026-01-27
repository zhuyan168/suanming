import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useMembership } from '../../../hooks/useMembership';
import { getThemeConfig } from '../../../config/themedReadings';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';
import SpreadCard from '../../../components/themed-readings/SpreadCard';
import SpreadsGrid from '../../../components/themed-readings/SpreadsGrid';
import UnlockModal from '../../../components/themed-readings/UnlockModal';

/**
 * 财富主题占卜主界面
 */
export default function WealthThemePage() {
  const { isMember } = useMembership();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const themeConfig = getThemeConfig('wealth');

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showComingSoonToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({
      visible: true,
      title: '功能即将上线',
      message: '财富牌阵解析正在抓紧开发中，敬请期待。'
    });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  if (!themeConfig) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <p className="text-white">Theme not found</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>财富 Wealth - Mystic Insights</title>
        <meta name="description" content="看清金钱的流动与阻碍，做更踏实的选择" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </Head>

      <div className="min-h-screen bg-[#0f0f23]">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* 主内容 */}
        <div className="relative z-10 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-16 lg:px-24 py-3">
            {/* 头部 */}
            <ThemeHeader
              titleZh={themeConfig.titleZh}
              titleEn="Wealth Readings"
              descZh={themeConfig.descZh}
              descEn=""
            />

            {/* 牌阵网格 - 2列布局 */}
            <SpreadsGrid>
              {themeConfig.spreads.map((spread) => (
                <SpreadCard
                  key={spread.id}
                  spread={spread}
                  theme="wealth"
                  isMember={isMember}
                  onLockedClick={() => setIsModalOpen(true)}
                  onClick={spread.id === 'wealth-obstacles' ? showComingSoonToast : undefined}
                />
              ))}
            </SpreadsGrid>

            {/* 底部提示 */}
            <div className="mt-20 mb-12 flex justify-center">
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 shadow-glow-sm">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">auto_awesome</span>
                <p className="relative z-10 text-white/80 text-sm sm:text-base text-center leading-relaxed">
                  占卜呈现的是当下的能量趋势，但财富的改变，来自你的选择与持续行动。
                </p>
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1.5s' }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast 提示 */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-background-dark/90 backdrop-blur-md shadow-glow text-white">
          <span className="material-symbols-outlined text-primary">info</span>
          <div>
            <p className="text-sm font-bold">{toast.title}</p>
            <p className="text-xs text-white/60">{toast.message}</p>
          </div>
        </div>
      </div>

      {/* 解锁弹窗 (虽然暂不用，但保留结构一致性) */}
      {isModalOpen && (
        <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
