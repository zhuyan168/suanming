import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import EightCardsSpecialSlots from '../../../../components/fortune/EightCardsSpecialSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import { SpreadCard } from '../../../../types/spread-reading';
import { saveReadingHistory } from '../../../../lib/saveReadingHistory';
import { useHistoryBack } from '../../../../hooks/useHistoryBack';
import { getAuthHeaders } from '../../../../lib/apiHeaders';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 结果数据接口
interface RelationshipDev8Result {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
}

// 解读数据接口 (8张牌专用 - 新版5模块结构)
interface RelationshipDevelopmentReading {
  // 模块1：牌阵整体说明
  spreadExplanation: string;
  // 模块2：单张牌解读（8张牌，每张一段完整解读）
  cardReadings: Array<{
    position: number;
    label: string;
    reading: string;  // 150-200字的完整解读文字
  }>;
  // 模块3：关系动力整合总结
  integration: {
    theme: string;        // 当前关系的主旋律
    drivingForce: string; // 推动关系的核心力量
    tension: string;      // 当前最需要被看见的卡点或张力
  };
  // 模块4：短期发展趋势
  shortTermTrend: string;
  // 模块5：情绪收尾提醒
  closing: string;
}

// LocalStorage keys
const STORAGE_KEY = 'relationship_development_result';
const READING_KEY = 'relationship_development_reading';

// 牌位配置（8张）
const SLOT_CONFIG = [
  {
    position: 1,
    title: '真实的你',
    meaning: '在这段关系里，你真正的状态与内心感受。不是你表现出来的样子，而是你心里真实发生的事。',
  },
  {
    position: 2,
    title: '真实的 TA',
    meaning: '在这段关系中，TA 真正的状态与内在动机。不是表面行为，而是更深层的真实。',
  },
  {
    position: 3,
    title: 'TA 眼中的你',
    meaning: 'TA 目前是如何看待你的。这份认知，与你真实的自己是否一致？',
  },
  {
    position: 4,
    title: '你眼中的 TA',
    meaning: '你现在是如何理解和看待 TA 的。这份理解，离 TA 的真实状态有多近？',
  },
  {
    position: 5,
    title: '关系的过去',
    meaning: '这段关系曾经走过的阶段。它是如何开始的，又留下些什么影响至今。',
  },
  {
    position: 6,
    title: '关系的当下',
    meaning: '此刻，这段关系真实所处的位置。不评价好坏，只呈现现状。',
  },
  {
    position: 7,
    title: '关系的走向',
    meaning: '如果保持目前的互动方式，这段关系正在自然走向哪里。',
  },
  {
    position: 8,
    title: '你的下一步',
    meaning: '为了让自己更安稳、也更诚实地面对这段关系，你可以采取的态度或行动方向。',
  },
];

// 从 localStorage 读取结果
const loadResult = (): RelationshipDev8Result | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load result:', error);
    return null;
  }
};

// 缓存解读到 localStorage
const saveReading = (data: RelationshipDevelopmentReading) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READING_KEY, JSON.stringify(data));
};

// 从 localStorage 读取解读
const loadReading = (): RelationshipDevelopmentReading | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(READING_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load reading:', error);
    return null;
  }
};

// 校验解读数据完整性
const validateReading = (reading: any): boolean => {
  if (!reading || typeof reading !== 'object') return false;
  
  // 校验必需字段（允许字符串为空，因为渲染时有 fallback）
  if (!reading.spreadExplanation && reading.spreadExplanation !== '') return false;
  if (typeof reading.spreadExplanation !== 'string') return false;
  
  if (!reading.cardReadings || !Array.isArray(reading.cardReadings) || reading.cardReadings.length !== 8) return false;
  
  if (!reading.integration || typeof reading.integration !== 'object') return false;
  
  if (!reading.shortTermTrend && reading.shortTermTrend !== '') return false;
  if (typeof reading.shortTermTrend !== 'string') return false;
  
  // closing 字段可以为空字符串，因为有 fallback
  if (reading.closing === undefined || reading.closing === null) return false;
  if (typeof reading.closing !== 'string') return false;
  
  return true;
};

export default function RelationshipDev8Result() {
  const router = useRouter();
  const { isFromHistory, goBack: goBackToHistory } = useHistoryBack();

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'love-relationship-development',
    redirectPath: '/themed-readings/love',
  });

  const [savedResult, setSavedResult] = useState<RelationshipDev8Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reading, setReading] = useState<RelationshipDevelopmentReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 使用 ref 防止 useEffect 重复执行
  const hasInitialized = useRef(false);

  // 自动生成解读的函数
  const generateReading = async (result: RelationshipDev8Result) => {
    setIsGenerating(true);
    setError(null);

    try {
      // 准备发送给 API 的数据
      const cardsData: SpreadCard[] = result.cards?.map((card) => ({
        id: card.id.toString(),
        name: card.name,
        cnName: card.name, // 可以添加中文名映射
        upright: card.orientation === 'upright',
        imageUrl: card.image,
        keywords: card.keywords,
      })) || [];

    const headers = await getAuthHeaders();
    const response = await fetch('/api/relationship-development-reading', {
      method: 'POST',
      headers,
      body: JSON.stringify({
          cards: cardsData,
          locale: 'zh',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成解读失败');
      }

      const data = await response.json();
      if (data.ok && data.reading) {
        // 校验数据完整性
        if (!validateReading(data.reading)) {
          console.error('[RelationshipDev] API 返回的解读数据不完整', data.reading);
          throw new Error('解读数据不完整，请重试');
        }
        
        // 检查 closing 字段是否缺失
        if (!data.reading.closing || !data.reading.closing.trim()) {
          console.warn('[RelationshipDev] closing 字段缺失或为空', data.reading);
        }
        
        setReading(data.reading);
        saveReading(data.reading);

        saveReadingHistory({
          spreadType: 'love-relationship-development',
          cards: result.cards,
          readingResult: data.reading,
          resultPath: '/themed-readings/love/relationship-development/result',
        });
      } else {
        throw new Error('解读数据格式错误');
      }
    } catch (err: any) {
      console.error('Failed to generate reading:', err);
      setError(err.message || '生成解读失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 防止重复执行（React 18 Strict Mode 会执行两次）
    if (hasInitialized.current) {
      return;
    }
    
    hasInitialized.current = true;
    
    const result = loadResult();
    if (!result) {
      router.replace('/themed-readings/love/relationship-development/draw');
      return;
    }

    setSavedResult(result);

    // 尝试加载已保存的解读
    const savedReading = loadReading();
    if (savedReading) {
      // 校验数据完整性
      if (validateReading(savedReading)) {
        // 数据完整，直接使用
        setReading(savedReading);
        setIsLoading(false);
      } else {
        // 数据不完整，清除并重新生成
        localStorage.removeItem(READING_KEY);
        setIsLoading(false);
        generateReading(result);
      }
    } else {
      // 如果没有缓存，自动生成解读
      setIsLoading(false);
      generateReading(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  // 确保页面滚动到顶部 - 延迟执行确保 DOM 完全渲染
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading && savedResult && reading) {
      // 使用 setTimeout 确保 DOM 完全渲染后再滚动
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, savedResult, reading]);

  const handleReturnToList = () => {
    router.push('/themed-readings/love');
  };

  const handleDrawAgain = () => {
    if (confirm('确定要重新抽牌吗？当前结果将被清空。')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(READING_KEY);
      router.push('/themed-readings/love/relationship-development/draw');
    }
  };

  const handleRetry = () => {
    if (savedResult) {
      generateReading(savedResult);
    }
  };

  if (accessLoading || !allowed || isLoading) {
    return (
      <>
        <Head>
          <title>加载中... - 这段感情的发展</title>
        </Head>
        <div className="min-h-screen bg-[#191022] flex items-center justify-center">
          <div className="text-white text-lg">加载中...</div>
        </div>
      </>
    );
  }

  if (!savedResult) {
    return (
      <>
        <Head>
          <title>加载中... - 这段感情的发展</title>
        </Head>
        <div className="min-h-screen bg-[#191022] flex items-center justify-center">
          <div className="text-white text-lg">数据加载中...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>这段感情的发展 - 解读结果</title>
        <meta name="description" content="看看这段关系的真实状态与自然走向" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <style dangerouslySetInnerHTML={{ __html: `
          html.dark, html.dark body { background-color: #191022; }
        ` }} />
      </Head>

      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white pb-20" style={{ backgroundColor: '#191022' }}>
          {/* 背景装饰 */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          {/* 主内容 */}
          <div className="relative z-10">
            {/* 顶部导航 */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm" style={{ backgroundColor: 'rgba(25, 16, 34, 0.8)' }}>
              <button
                onClick={isFromHistory ? goBackToHistory : handleReturnToList}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-medium">{isFromHistory ? '返回我的占卜记录' : '返回'}</span>
              </button>
              
              <div className="flex items-center gap-4 text-white">
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">这段感情的发展</h2>
              </div>

              <button
                onClick={handleDrawAgain}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">refresh</span>
                <span className="text-sm font-medium hidden sm:inline">重置</span>
              </button>
            </header>

            {/* 标题区域 */}
            <div className="px-4 sm:px-8 md:px-16 lg:px-24 pt-4 pb-2">
              <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-2">Reading Result</p>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-2">
                  这段感情的发展
                </h1>
                <p className="text-white/70 text-base max-w-2xl mx-auto">
                  理解关系的真实状态与自然走向
                </p>
              </div>
            </div>

            {/* 牌阵展示 */}
            {savedResult?.cards && savedResult.cards.length > 0 && (
              <div className="px-4 sm:px-8 md:px-16 lg:px-24 mt-2">
                <div className="max-w-7xl mx-auto">
                  <EightCardsSpecialSlots
                    cards={savedResult.cards}
                    isAnimating={[false, false, false, false, false, false, false, false]}
                    showLoadingText={false}
                    forceFlipped={true}
                    slotConfig={SLOT_CONFIG}
                  />
                </div>
              </div>
            )}

            {/* 解读内容 */}
            <div className="px-4 sm:px-8 md:px-16 lg:px-24 mt-6">
              <div className="max-w-5xl mx-auto">
                <div>
                  {/* 错误提示 */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-red-400">error</span>
                          <div className="flex-1">
                            <p className="text-red-300 text-sm">{error}</p>
                            <button
                              onClick={handleRetry}
                              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                            >
                              点击重试
                            </button>
                          </div>
                          <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <span className="material-symbols-outlined notranslate text-sm">close</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 正在生成解读 */}
                  {isGenerating && !reading && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 p-8 text-center"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" style={{ borderTopColor: '#7f13ec' }}></div>
                        <p className="text-white text-lg font-semibold">正在为你解读这段关系的真实状态</p>
                        <p className="text-white/60 text-sm">
                          这需要一点时间，请放心等待
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* 新版5模块结构解读 */}
                  {reading ? (
                    <>
                      {/* 模块1：牌阵整体说明 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10 rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">📖</span>
                          <h2 className="text-white text-lg sm:text-xl font-bold">牌阵说明</h2>
                        </div>
                        <p className="text-white/75 text-base leading-relaxed whitespace-pre-wrap">
                          {reading.spreadExplanation}
                        </p>
                      </motion.div>

                      {/* 模块2：单张牌解读 */}
                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-2xl">🎴</span>
                          <h2 className="text-white text-xl sm:text-2xl font-bold">牌面解读</h2>
                        </div>
                        <div className="space-y-6">
                          {reading.cardReadings?.map((cardReading, index) => {
                            const card = savedResult.cards?.[index];
                            const config = SLOT_CONFIG?.[index];
                            
                            if (!card || !config) return null;
                            
                            return (
                              <motion.div
                                key={cardReading.position}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                                className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8"
                              >
                                {/* 牌位标题 */}
                                <div className="flex items-start gap-4 mb-6">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center" style={{ backgroundColor: 'rgba(127, 19, 236, 0.2)' }}>
                                    <span className="text-primary font-bold text-lg" style={{ color: '#7f13ec' }}>{cardReading.position}</span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-white text-lg sm:text-xl font-bold mb-1">
                                      {cardReading.label}
                                    </h3>
                                    <p className="text-white/50 text-sm">
                                      {config.meaning}
                                    </p>
                                  </div>
                                </div>

                                {/* 卡牌展示与解读 */}
                                <div className="flex flex-col sm:flex-row gap-6">
                                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                                    <div className="relative w-28 h-44 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                                      <img
                                        src={card.image}
                                        alt={card.name}
                                        className={`w-full h-full object-cover ${
                                          card.orientation === 'reversed' ? 'rotate-180' : ''
                                        }`}
                                        style={{ backgroundColor: 'white' }}
                                      />
                                    </div>
                                    <div className="mt-3 text-center">
                                      <h4 className="text-white text-sm font-semibold mb-1">
                                        {card.name}
                                      </h4>
                                      <p className="text-white/50 text-xs">
                                        {card.orientation === 'upright' ? '正位' : '逆位'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-5">
                                      <p className="text-white/85 text-base leading-relaxed whitespace-pre-wrap">
                                        {cardReading.reading}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 模块3：关系动力整合总结 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-6 sm:p-8"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-2xl">✨</span>
                          <h2 className="text-white text-xl sm:text-2xl font-bold">关系动力整合</h2>
                        </div>
                        
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-white/70 text-sm font-semibold mb-2 uppercase tracking-wider">
                              当前关系的主旋律
                            </h3>
                            <p className="text-white/90 text-base leading-relaxed">
                              {reading.integration.theme}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-white/70 text-sm font-semibold mb-2 uppercase tracking-wider">
                              推动关系的核心力量
                            </h3>
                            <p className="text-white/90 text-base leading-relaxed">
                              {reading.integration.drivingForce}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-white/70 text-sm font-semibold mb-2 uppercase tracking-wider">
                              当前最需要被看见的张力
                            </h3>
                            <p className="text-white/90 text-base leading-relaxed">
                              {reading.integration.tension}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* 模块4：短期发展趋势 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mb-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-6 sm:p-8"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🔮</span>
                          <h2 className="text-white text-xl sm:text-2xl font-bold">短期发展趋势</h2>
                        </div>
                        <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap">
                          {reading.shortTermTrend}
                        </p>
                      </motion.div>

                      {/* 模块5：情绪收尾提醒 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="mb-8 rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-2xl">💫</span>
                          <div className="flex-1">
                            <h2 className="text-white text-lg font-bold mb-3">最后的话</h2>
                            <p className="text-white/85 text-base leading-relaxed whitespace-pre-wrap">
                              {reading.closing?.trim() || '塔罗牌为你呈现了这段关系的现状，愿你在理解中找到自己的节奏。'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  ) : null}

                  {/* 操作按钮 */}
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleDrawAgain}
                      className="flex-1 py-4 rounded-xl bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
                    >
                      重新抽牌
                    </button>
                    <button
                      onClick={handleReturnToList}
                      className="flex-1 py-4 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                      style={{ backgroundColor: '#7f13ec' }}
                    >
                      返回爱情占卜
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

