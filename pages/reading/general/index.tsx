import { useState } from 'react';
import Head from 'next/head';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';
import SpreadsGrid from '../../../components/themed-readings/SpreadsGrid';
import SpreadCard from '../../../components/themed-readings/SpreadCard';
import UnlockModal from '../../../components/themed-readings/UnlockModal';
import { useMembership } from '../../../hooks/useMembership';
import { GENERAL_SPREADS } from '../../../data/spreads';

export default function GeneralReadingPage() {
  const { isMember } = useMembership();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLockedClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Head>
        <title>通用牌阵 - Mystic Insights</title>
        <meta
          name="description"
          content="适用于任何主题的通用牌阵，帮助你在犹豫与选择之间快速获得清晰指引。"
        />
      </Head>

      <div className="min-h-screen bg-[#0f0f23]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-16 lg:px-24 py-6">
            <ThemeHeader
              titleZh="通用牌阵"
              titleEn=""
              descZh="适用于任何主题，快速获得清晰指引"
            />

            <SpreadsGrid>
              {GENERAL_SPREADS.map((spread) => (
                <SpreadCard
                  key={spread.id}
                  spread={spread}
                  theme="general"
                  isMember={isMember}
                  onLockedClick={handleLockedClick}
                />
              ))}
            </SpreadsGrid>

            <div className="mt-8 flex justify-center">
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">auto_awesome</span>
                <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                  占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。
                </p>
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1s' }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </div>

        <UnlockModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </>
  );
}
