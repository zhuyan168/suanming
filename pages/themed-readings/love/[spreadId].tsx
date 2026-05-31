import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMembership } from '../../../hooks/useMembership';
import { useGuestTrial } from '../../../context/GuestTrialContext';
import { getSpreadConfig } from '../../../config/themedReadings';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';

/**
 * 牌阵详情页（占位）
 * Spread Detail Page (Placeholder)
 */
export default function SpreadDetailPage() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const text = isEn ? {
    notFoundTitle: 'Spread Not Found',
    notFoundPageTitle: 'Spread Not Found - FateAura',
    backToLove: 'Back to Love Readings',
    loadingTitle: 'Loading - FateAura',
    loading: 'Loading...',
    pageSuffix: 'Love Reading',
    cardCountPrefix: 'This spread uses ',
    cardCountSuffix: ' tarot cards',
    estimatedTime: 'Estimated reading time: 3-5 minutes',
    memberOnly: 'Member-only spread',
    inDevelopmentTitle: 'Coming Soon',
    inDevelopmentBody: 'The draw and reading experience for this spread is still in development.',
    comingNext: 'Future updates will include:',
    featureDraw: 'Interactive card drawing',
    featureAi: 'In-depth AI interpretation powered by DeepSeek',
    featureAdvice: 'Personalized advice and guidance',
    startSoon: 'Start Reading (Coming Soon)',
    back: 'Back to Selection',
  } : {
    notFoundTitle: '牌阵未找到',
    notFoundPageTitle: '牌阵未找到 - FateAura',
    backToLove: '返回爱情占卜',
    loadingTitle: '加载中 - FateAura',
    loading: '加载中…',
    pageSuffix: '爱情占卜',
    cardCountPrefix: '此牌阵使用 ',
    cardCountSuffix: ' 张塔罗牌',
    estimatedTime: '预计占卜时间：3-5 分钟',
    memberOnly: '会员专享牌阵',
    inDevelopmentTitle: '功能开发中',
    inDevelopmentBody: '此牌阵的抽牌界面与解读功能正在开发中。',
    comingNext: '后续版本将接入：',
    featureDraw: '交互式抽牌动画',
    featureAi: 'AI 深度解读（接入 DeepSeek）',
    featureAdvice: '个性化建议与指引',
    startSoon: '开始占卜（即将推出）',
    back: '返回选择',
  };
  const { spreadId } = router.query;
  const { isMember, loading: membershipLoading, userId } = useMembership();
  const { isActive: isTrialActive } = useGuestTrial();

  const spreadConfig = spreadId ? getSpreadConfig('love', spreadId as string) : null;
  const isTemporarilyOpen = spreadId === 'relationship-development';

  // guest trial 绕过仅对未登录游客有效
  const guestTrialAllows = isTrialActive && !userId;

  useEffect(() => {
    if (!router.isReady || membershipLoading) return;
    const id = typeof spreadId === 'string' ? spreadId : null;
    if (!id) return;
    const cfg = getSpreadConfig('love', id);
    if (!cfg?.isPaid || id === 'relationship-development') return;
    if (!isMember && !guestTrialAllows) {
      void router.replace('/membership');
    }
  }, [router.isReady, membershipLoading, spreadId, isMember, guestTrialAllows, router]);

  // 如果牌阵不存在
  if (router.isReady && !spreadConfig) {
    return (
      <>
        <Head>
          <title>{text.notFoundPageTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined' && !window.tailwindConfigSet) {
                  window.tailwindConfigSet = true;
                  (function() {
                    var script = document.createElement('script');
                    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
                    script.async = true;
                    script.onload = function() {
                      if (window.tailwind) {
                        window.tailwind.config = {
                          darkMode: 'class',
                          theme: {
                            extend: {
                              colors: {
                                primary: '#7f13ec',
                                'background-light': '#f7f6f8',
                                'background-dark': '#191022',
                              },
                              fontFamily: {
                                display: ['Spline Sans', 'sans-serif'],
                              },
                              borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
                              boxShadow: {
                                glow: '0 0 15px 0 rgba(234, 179, 8, 0.2), 0 0 5px 0 rgba(234, 179, 8, 0.1)',
                              },
                            }
                          }
                        };
                      }
                    };
                    document.head.appendChild(script);
                  })();
                }
              `,
            }}
          />
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-white/30 text-6xl mb-4">error</span>
            <h1 className="text-white text-2xl font-bold mb-6">{text.notFoundTitle}</h1>
            <button
              onClick={() => router.push('/themed-readings/love')}
              className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
            >
              {text.backToLove}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (
    router.isReady &&
    spreadConfig?.isPaid &&
    !isTemporarilyOpen &&
    membershipLoading
  ) {
    return (
      <>
        <Head>
          <title>{text.loadingTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          />
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <p className="text-white/50 text-sm">{text.loading}</p>
        </div>
      </>
    );
  }

  if (
    router.isReady &&
    spreadConfig?.isPaid &&
    !isTemporarilyOpen &&
    !membershipLoading &&
    !isMember &&
    !guestTrialAllows
  ) {
    return null;
  }

  if (!spreadConfig) {
    return null;
  }

  // 未来恋人牌阵直接跳转到抽牌页
  if (spreadId === 'future-lover' && router.isReady) {
    router.replace('/themed-readings/love/future-lover/draw');
    return null;
  }

  // 对方在想什么牌阵直接跳转到抽牌页
  if (spreadId === 'what-they-think' && router.isReady) {
    router.replace('/themed-readings/love/what-they-think/draw');
    return null;
  }

  // 这段感情的发展（8张牌）直接跳转到抽牌页
  if (spreadId === 'relationship-development' && router.isReady) {
    router.replace('/themed-readings/love/relationship-development/draw');
    return null;
  }

  return (
      <>
        <Head>
          <title>{isEn ? spreadConfig.titleEn : spreadConfig.titleZh} - {text.pageSuffix}</title>
          <meta name="description" content={isEn ? spreadConfig.descEn : spreadConfig.descZh} />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined' && !window.tailwindConfigSet) {
                  window.tailwindConfigSet = true;
                  (function() {
                    var script = document.createElement('script');
                    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
                    script.async = true;
                    script.onload = function() {
                      if (window.tailwind) {
                        window.tailwind.config = {
                          darkMode: 'class',
                          theme: {
                            extend: {
                              colors: {
                                primary: '#7f13ec',
                                'background-light': '#f7f6f8',
                                'background-dark': '#191022',
                              },
                              fontFamily: {
                                display: ['Spline Sans', 'sans-serif'],
                              },
                              borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
                              boxShadow: {
                                glow: '0 0 15px 0 rgba(234, 179, 8, 0.2), 0 0 5px 0 rgba(234, 179, 8, 0.1)',
                              },
                            }
                          }
                        };
                      }
                    };
                    document.head.appendChild(script);
                  })();
                }
              `,
            }}
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
          <div className="mx-auto max-w-4xl px-4 sm:px-8 md:px-16 lg:px-24 py-12">
            {/* 头部 */}
            <ThemeHeader
              titleZh={spreadConfig.titleZh}
              titleEn={spreadConfig.titleEn}
              descZh={spreadConfig.descZh}
              descEn={spreadConfig.descEn}
            />

            {/* 内容区域 */}
            <div className="mt-12">
              {/* 牌阵信息卡片 */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-8">
                <div className="flex items-start gap-6">
                  {/* 图标 */}
                  {spreadConfig.icon && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center text-5xl">
                      {spreadConfig.icon}
                    </div>
                  )}

                  {/* 信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary">style</span>
                      <span className="text-white/70 text-lg">
                        {text.cardCountPrefix}<span className="text-white font-semibold">{spreadConfig.cardsCount}</span>{text.cardCountSuffix}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <span className="text-white/70 text-lg">{text.estimatedTime}</span>
                    </div>

                    {spreadConfig.isPaid && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        <span className="text-white/70 text-lg">{text.memberOnly}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 占位说明 */}
              <div className="mt-8 rounded-xl bg-primary/5 border border-primary/20 p-8">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-3xl">construction</span>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">{text.inDevelopmentTitle}</h3>
                    <p className="text-white/70 text-base leading-relaxed mb-4">
                      {text.inDevelopmentBody}
                      <br />
                      {text.comingNext}
                    </p>
                    <ul className="text-white/60 text-sm space-y-2 ml-6">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {text.featureDraw}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {text.featureAi}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {text.featureAdvice}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 按钮 */}
              <div className="mt-8 flex gap-4">
                <button
                  disabled
                  className="flex-1 py-4 rounded-lg bg-white/10 text-white/40 font-semibold cursor-not-allowed"
                >
                  {text.startSoon}
                </button>
                <button
                  onClick={() => router.push('/themed-readings/love')}
                  className="px-8 py-4 rounded-lg bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  {text.back}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
