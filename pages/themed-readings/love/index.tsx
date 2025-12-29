import { useState } from 'react';
import Head from 'next/head';
import { useMembership } from '../../../hooks/useMembership';
import { getThemeConfig } from '../../../config/themedReadings';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';
import SpreadCard from '../../../components/themed-readings/SpreadCard';
import SpreadsGrid from '../../../components/themed-readings/SpreadsGrid';
import UnlockModal from '../../../components/themed-readings/UnlockModal';

/**
 * 爱情主题占卜页面
 * Love-themed Tarot Reading Page
 */
export default function LoveThemePage() {
  const { isMember } = useMembership();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const themeConfig = getThemeConfig('love');

  if (!themeConfig) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <p className="text-white">Theme not found</p>
      </div>
    );
  }

  const handleLockedClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>爱情占卜 Love Readings - Mystic Insights</title>
        <meta name="description" content="探索感情的奥秘，找到爱的答案" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </Head>

      <div className="min-h-screen bg-[#0f0f23]">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* 主内容 */}
        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-16 lg:px-24 py-12">
            {/* 头部 */}
            <ThemeHeader
              titleZh={themeConfig.titleZh}
              titleEn=""
              descZh={themeConfig.descZh}
              descEn=""
            />

            {/* 提示文字 */}
            <div className="mt-10 mb-6">
              <p className="text-white/70 text-base">
                <span className="material-symbols-outlined text-primary text-sm mr-2 align-middle">info</span>
                选择一种方式，温柔地看清你此刻的困惑
              </p>
            </div>

            {/* 牌阵网格 */}
            <SpreadsGrid>
              {themeConfig.spreads.map((spread) => (
                <SpreadCard
                  key={spread.id}
                  spread={spread}
                  theme="love"
                  isMember={isMember}
                  onLockedClick={handleLockedClick}
                />
              ))}
            </SpreadsGrid>

            {/* 底部提示 */}
            <div className="mt-16 flex justify-center">
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">auto_awesome</span>
                <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                  占卜呈现当下能量的趋势，但未来始终掌握在你手里
                </p>
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1s' }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 解锁弹窗 */}
      <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

