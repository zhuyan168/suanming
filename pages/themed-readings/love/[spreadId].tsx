import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMembership } from '../../../hooks/useMembership';
import { getSpreadConfig } from '../../../config/themedReadings';
import ThemeHeader from '../../../components/themed-readings/ThemeHeader';

/**
 * 牌阵详情页（占位）
 * Spread Detail Page (Placeholder)
 */
export default function SpreadDetailPage() {
  const router = useRouter();
  const { spreadId } = router.query;
  const { isMember } = useMembership();

  const spreadConfig = spreadId ? getSpreadConfig('love', spreadId as string) : null;

  // 如果牌阵不存在
  if (router.isReady && !spreadConfig) {
    return (
      <>
        <Head>
          <title>牌阵未找到 - Mystic Insights</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          />
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-white/30 text-6xl mb-4">error</span>
            <h1 className="text-white text-2xl font-bold mb-6">牌阵未找到</h1>
            <button
              onClick={() => router.push('/themed-readings/love')}
              className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
            >
              返回爱情占卜
            </button>
          </div>
        </div>
      </>
    );
  }

  // 如果是付费牌阵且用户非会员
  if (spreadConfig && spreadConfig.isPaid && !isMember) {
    return (
      <>
        <Head>
          <title>{spreadConfig.titleZh} - Mystic Insights</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          />
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
            </div>
            <h1 className="text-white text-2xl font-bold mb-8">会员专享内容</h1>
            <button
              onClick={() => router.push('/themed-readings/love')}
              className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
            >
              返回爱情占卜
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!spreadConfig) {
    return null;
  }

  return (
      <>
        <Head>
          <title>{spreadConfig.titleZh} - 爱情占卜</title>
          <meta name="description" content={spreadConfig.descZh} />
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
          <div className="mx-auto max-w-4xl px-4 sm:px-8 md:px-16 lg:px-24 py-12">
            {/* 头部 */}
            <ThemeHeader
              titleZh={spreadConfig.titleZh}
              titleEn=""
              descZh={spreadConfig.descZh}
              descEn=""
            />

            {/* 占位内容区域 */}
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
                        此牌阵使用 <span className="text-white font-semibold">{spreadConfig.cardsCount}</span> 张塔罗牌
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary">schedule</span>
                      <span className="text-white/70 text-lg">预计占卜时间：3-5 分钟</span>
                    </div>

                    {spreadConfig.isPaid && (
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        <span className="text-white/70 text-lg">会员专享牌阵</span>
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
                    <h3 className="text-white text-xl font-bold mb-2">功能开发中</h3>
                    <p className="text-white/70 text-base leading-relaxed mb-4">
                      此牌阵的抽牌界面与解读功能正在开发中。
                      <br />
                      后续版本将接入：
                    </p>
                    <ul className="text-white/60 text-sm space-y-2 ml-6">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        交互式抽牌动画
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        AI 深度解读（接入 DeepSeek）
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        个性化建议与指引
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
                  开始占卜（即将推出）
                </button>
                <button
                  onClick={() => router.push('/themed-readings/love')}
                  className="px-8 py-4 rounded-lg bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  返回选择
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

