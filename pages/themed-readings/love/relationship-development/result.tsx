import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import EightCardsSpecialSlots from '../../../../components/fortune/EightCardsSpecialSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import { SpreadCard } from '../../../../types/spread-reading';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 结果数据接口
interface RelationshipDev8Result {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
}

// 解读数据接口 (8张牌专用)
interface SpreadReading8 {
  title: string;
  overall: string;
  positions: Array<{
    position: number;
    label: string;
    reading: string;
  }>;
  guidance: {
    trend: string;
    advice: string[];
    watchFor: string[];
  };
  disclaimer: string;
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
const saveReading = (data: SpreadReading8) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READING_KEY, JSON.stringify(data));
};

// 从 localStorage 读取解读
const loadReading = (): SpreadReading8 | null => {
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

export default function RelationshipDev8Result() {
  const router = useRouter();
  const [savedResult, setSavedResult] = useState<RelationshipDev8Result | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reading, setReading] = useState<SpreadReading8 | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      const response = await fetch('/api/relationship-development-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setReading(data.reading);
        saveReading(data.reading);
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

    const result = loadResult();
    if (!result) {
      // 没有结果，返回抽牌页
      router.replace('/themed-readings/love/relationship-development/draw');
      return;
    }

    setSavedResult(result);

    // 尝试加载已保存的解读
    const savedReading = loadReading();
    if (savedReading) {
      // 如果有缓存，直接使用
      setReading(savedReading);
      setIsLoading(false);
    } else {
      // 如果没有缓存，自动生成解读
      setIsLoading(false);
      generateReading(result);
    }
  }, [router]);

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

  if (isLoading || !savedResult) {
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
                onClick={handleReturnToList}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-medium">返回</span>
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
            <div className="px-4 sm:px-8 md:px-16 lg:px-24 pt-10 sm:pt-16 pb-8">
              <div className="max-w-7xl mx-auto text-center">
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">Reading Result</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  {reading?.title || '这段感情的发展'}
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  看清关系的真实状态，找到最适合自己的方向
                </p>
              </div>
            </div>

            {/* 牌阵展示 */}
            {savedResult?.cards && savedResult.cards.length > 0 && (
              <div className="px-4 sm:px-8 md:px-16 lg:px-24 mt-4">
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
            <div className="px-4 sm:px-8 md:px-16 lg:px-24 mt-12">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
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
                            <span className="material-symbols-outlined text-sm">close</span>
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

                  {/* 总览 */}
                  {reading && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/10 border border-primary/30 p-6 sm:p-8"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">✨</span>
                          <h2 className="text-white text-xl sm:text-2xl font-bold">总览</h2>
                        </div>
                        <p className="text-white/90 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                          {reading.overall}
                        </p>
                      </motion.div>

                      {/* 八个位置解读 */}
                      <div className="space-y-6 mb-10">
                        {reading.positions?.map((pos, index) => {
                          const card = savedResult.cards?.[index];
                          const config = SLOT_CONFIG?.[index];
                          
                          // 防御性检查：如果 card 或 config 不存在，跳过此项
                          if (!card || !config) return null;
                          
                          return (
                            <motion.div
                              key={pos.position}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                              className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8"
                            >
                              <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center" style={{ backgroundColor: 'rgba(127, 19, 236, 0.2)' }}>
                                  <span className="text-primary font-bold text-lg" style={{ color: '#7f13ec' }}>{pos.position}</span>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white text-lg sm:text-xl font-bold mb-1">
                                    {pos.label}
                                  </h3>
                                  <p className="text-white/50 text-sm">
                                    {config?.meaning}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-shrink-0 mx-auto sm:mx-0">
                                  <div className="relative w-28 h-44 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                                    <img
                                      src={card?.image}
                                      alt={card?.name}
                                      className={`w-full h-full object-cover ${
                                        card?.orientation === 'reversed' ? 'rotate-180' : ''
                                      }`}
                                      style={{ backgroundColor: 'white' }}
                                    />
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <h4 className="text-white text-base font-semibold mb-2">
                                    {card?.name}
                                  </h4>
                                  <p className="text-white/60 text-sm mb-4">
                                    {card?.orientation === 'upright' ? '正位' : '逆位'}
                                    {card?.keywords && card.keywords.length > 0 && (
                                      <>
                                        {' · '}
                                        {card.keywords.join('、')}
                                      </>
                                    )}
                                  </p>
                                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-4">
                                    <p className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                      {pos.reading}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* 关系指引 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-6 sm:p-8"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🔮</span>
                          <h2 className="text-white text-xl sm:text-2xl font-bold">关系走向与建议</h2>
                        </div>
                        {reading.guidance?.trend && (
                          <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap mb-6">
                            {reading.guidance.trend}
                          </p>
                        )}

                        {/* 建议 */}
                        {reading.guidance?.advice && reading.guidance.advice.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                              <span className="text-xl">💡</span>
                              建议方向
                            </h3>
                            <ul className="space-y-2">
                              {reading.guidance.advice.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-white/80 text-sm sm:text-base">
                                  <span className="text-primary mt-1" style={{ color: '#7f13ec' }}>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 观察点 */}
                        {reading.guidance?.watchFor && reading.guidance.watchFor.length > 0 && (
                          <div>
                            <h3 className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                              <span className="text-xl">👁️</span>
                              观察重点
                            </h3>
                            <ul className="space-y-2">
                              {reading.guidance.watchFor.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-white/80 text-sm sm:text-base">
                                  <span className="text-indigo-400 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>

                      {/* 免责声明 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="rounded-2xl bg-white/[0.03] border border-white/10 p-6"
                      >
                        <div className="flex items-start gap-4">
                          <span className="material-symbols-outlined text-white/50 text-2xl">info</span>
                          <div className="flex-1">
                            <p className="text-white/70 text-sm leading-relaxed">
                              {reading.disclaimer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}

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
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

