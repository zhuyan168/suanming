/**
 * 年度运势结果页
 * 路由: /annual-fortune/result
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AnnualSpreadView from '../../components/fortune/AnnualSpreadView';
import AnnualInterpretationPanel from '../../components/fortune/AnnualInterpretationPanel';
import type { AnnualFortuneReading, AnnualInterpretation, PageState } from '../../types/annual-fortune';
import { getAnnualFortuneReading, saveReadingToLocal } from '../../utils/annual-fortune-storage';
import { generateAnnualReading, validateInterpretation } from '../../utils/annual-interpretation';

export default function AnnualFortuneResultPage() {
  const router = useRouter();
  const { readingId, sessionId } = router.query;
  
  const [pageState, setPageState] = useState<PageState>('loading');
  const [reading, setReading] = useState<AnnualFortuneReading | null>(null);
  const [interpretation, setInterpretation] = useState<AnnualInterpretation | null>(null);
  const [error, setError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 获取当前年份
  const currentYear = new Date().getFullYear();

  /**
   * 初始化：加载抽牌结果
   */
  useEffect(() => {
    loadReading();
  }, [readingId, sessionId]);

  const loadReading = async () => {
    setPageState('loading');
    setError('');

    try {
      // 尝试获取抽牌结果
      const id = (readingId || sessionId) as string | undefined;
      const result = await getAnnualFortuneReading(id);

      if (!result) {
        setPageState('empty');
        return;
      }

      setReading(result.reading);

      // 如果已有解读，直接使用
      if (result.interpretation) {
        setInterpretation(result.interpretation);
        setPageState('success');
      } else {
        // 没有解读，生成本地解读
        generateInterpretation(result.reading);
      }
    } catch (err: any) {
      console.error('❌ Failed to load reading:', err);
      setError(err.message || '加载失败，请稍后重试');
      setPageState('error');
    }
  };

  /**
   * 生成解读（优先本地规则，可选 LLM）
   */
  const generateInterpretation = async (readingData: AnnualFortuneReading) => {
    setIsGenerating(true);
    setError('');

    try {
      // 1. 优先使用本地规则生成
      console.log('📋 Generating interpretation with local rules...');
      const localInterpretation = generateAnnualReading(
        readingData.themeCard,
        readingData.monthCards
      );

      // 验证生成结果
      if (!validateInterpretation(localInterpretation)) {
        throw new Error('生成的解读数据不完整');
      }

      setInterpretation(localInterpretation);
      setPageState('success');

      // 保存到 localStorage
      saveReadingToLocal(readingData, localInterpretation);

      console.log('✅ Interpretation generated successfully');

      // 2. 可选：后台调用 LLM 升级解读（异步，不阻塞 UI）
      tryUpgradeWithLLM(readingData, localInterpretation);

    } catch (err: any) {
      console.error('❌ Failed to generate interpretation:', err);
      setError(err.message || '生成解读失败');
      setPageState('error');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 尝试使用 LLM 升级解读（后台异步）
   * 
   * TODO: 会员功能 - LLM 增强解读
   * 当前阶段：会员系统未实现，此函数不会真正调用 LLM
   * API 内部会检查会员状态（永远返回 false），直接返回本地规则解读
   */
  const tryUpgradeWithLLM = async (
    readingData: AnnualFortuneReading,
    fallbackInterpretation: AnnualInterpretation
  ) => {
    // TODO: enable when membership system is implemented
    // 当前阶段此函数被禁用，不会实际调用
    return;

    /* 以下代码预留给未来会员功能
    try {
      const response = await fetch('/api/annual-fortune/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeCard: readingData.themeCard,
          monthCards: readingData.monthCards,
          year: readingData.meta?.year || currentYear
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 检查是否为会员且使用了 LLM
        if (data.isMember && data.method === 'llm' && validateInterpretation(data.interpretation)) {
          console.log('✅ Upgraded interpretation with LLM (member feature)');
          setInterpretation(data.interpretation);
          saveReadingToLocal(readingData, data.interpretation);
        }
      }
    } catch (err) {
      // LLM 升级失败不影响用户体验，已有本地解读
      console.warn('⚠️ LLM upgrade failed, using local interpretation:', err);
    }
    */
  };

  /**
   * 复制当前页面链接
   */
  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板！');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  /**
   * 返回抽牌页
   */
  const handleBackToDrawing = () => {
    router.push('/annual-fortune');
  };

  /**
   * 渲染不同状态
   */
  if (pageState === 'loading') {
    return (
      <PageLayout title="加载中...">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <LoadingSpinner />
          <p className="text-white/70 text-lg">正在加载年度运势...</p>
        </div>
      </PageLayout>
    );
  }

  if (pageState === 'empty') {
    return (
      <PageLayout title="未找到抽牌记录">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <span className="material-symbols-outlined text-white/30 text-8xl">search_off</span>
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">未找到抽牌记录</h2>
            <p className="text-white/60 mb-6">请先完成年度运势抽牌</p>
            <button
              onClick={handleBackToDrawing}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              去抽牌
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (pageState === 'error') {
    return (
      <PageLayout title="加载失败">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <span className="material-symbols-outlined text-red-400 text-8xl">error</span>
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">加载失败</h2>
            <p className="text-white/60 mb-6">{error || '未知错误'}</p>
            <div className="flex gap-3">
              <button
                onClick={loadReading}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                重试
              </button>
              <button
                onClick={handleBackToDrawing}
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ========== Success State ==========
  if (!reading || !interpretation) {
    return null;
  }

  const displayYear = reading.meta?.year || currentYear;
  const createdDate = new Date(reading.createdAt);
  const formattedDate = createdDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PageLayout title={`${displayYear} 年度运势`}>
      {/* A. 顶部信息区 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-12"
      >
        <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary mb-3 sm:mb-4">
          Annual Fortune
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3 sm:mb-4">
          {displayYear} 年度运势结果
        </h1>
        <p className="text-white/60 text-sm sm:text-base">
          生成时间：{formattedDate}
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            onClick={handleBackToDrawing}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            重新抽取
          </button>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">share</span>
            复制链接
          </button>
          {/* TODO: 会员功能 - 下载图片 */}
          {/* 当前阶段：功能未实现，按钮禁用 */}
          <button
            onClick={() => alert('下载功能开发中...')}
            className="px-4 py-2 rounded-lg bg-white/10 text-white/50 text-sm font-medium cursor-not-allowed flex items-center gap-2"
            disabled
            title="功能开发中"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            下载图片
          </button>
        </div>
      </motion.div>

      {/* B. 牌阵展示区 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12 sm:mb-16"
      >
        <AnnualSpreadView
          themeCard={reading.themeCard}
          monthCards={reading.monthCards}
          showLabels={true}
        />
      </motion.div>

      {/* C. 解读内容区 */}
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <LoadingSpinner />
          <p className="text-white/70 text-lg">正在生成解读...</p>
        </div>
      ) : (
        <AnnualInterpretationPanel
          interpretation={interpretation}
          themeCard={reading.themeCard}
          monthCards={reading.monthCards}
        />
      )}

      {/* 底部提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-white/40 text-sm mt-16 pt-8 border-t border-white/10"
      >
        <p>✨ 愿你的 {displayYear} 年充满光明与成长</p>
      </motion.div>
    </PageLayout>
  );
}

/**
 * 页面布局组件
 */
function PageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>{title} - Mystic Insights</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            html.dark, html.dark body {
              background-color: #191022;
            }
          `
        }} />
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

      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white">
          {/* 顶部导航 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">返回</span>
            </button>
            <div className="flex items-center gap-4 text-white">
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Mystic Insights
              </h2>
            </div>
            <div className="w-20"></div>
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-10 md:py-16">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}

/**
 * 加载动画组件
 */
function LoadingSpinner() {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-primary/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

