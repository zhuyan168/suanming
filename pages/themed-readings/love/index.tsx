import { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useMembership } from '../../../hooks/useMembership';
import { getThemeConfig } from '../../../config/themedReadings';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';
import SpreadCard from '../../../components/themed-readings/SpreadCard';
import SpreadsGrid from '../../../components/themed-readings/SpreadsGrid';
import UnlockModal from '../../../components/themed-readings/UnlockModal';

/**
 * 爱情主题占卜页面
 */
export default function LoveThemePage() {
  const { isMember, userId, loading: membershipLoading } = useMembership();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');

  const themeConfig = getThemeConfig('love');

  if (!themeConfig) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <p className="text-white">Theme not found</p>
      </div>
    );
  }

  const orderedSpreads = [
    ...themeConfig.spreads.filter((spread) => spread.access === 'free'),
    ...themeConfig.spreads.filter((spread) => spread.access !== 'free'),
  ];

  return (
    <>
      <Head>
        <title>{t('spreads.love.metaTitle')}</title>
        <meta name="description" content={t('spreads.love.metaDesc')} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-16 lg:px-24 py-3">
            <ThemeHeader
              titleZh={themeConfig.titleZh}
              titleEn={themeConfig.titleEn}
              descZh={themeConfig.descZh}
              descEn={themeConfig.descEn}
            />

            <div className="mt-3 mb-3">
              <p className="text-white/70 text-xs">
                <span className="material-symbols-outlined text-primary text-xs mr-1 align-middle">info</span>
                {t('spreads.love.subtitle')}
              </p>
            </div>

            <SpreadsGrid>
              {orderedSpreads.map((spread) => (
                <SpreadCard
                  key={spread.id}
                  spread={spread}
                  theme="love"
                  isMember={isMember}
                  membershipLoading={membershipLoading}
                  userId={userId}
                  onLockedClick={() => setIsModalOpen(true)}
                />
              ))}
            </SpreadsGrid>

            <div className="mt-8 flex justify-center">
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">auto_awesome</span>
                <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                  {t('spreads.love.tagline')}
                </p>
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1s' }}>auto_awesome</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
