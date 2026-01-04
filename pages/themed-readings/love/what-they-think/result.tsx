import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import TwoRowsThreeColsSlots from '../../../../components/fortune/TwoRowsThreeColsSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 结果数据接口
interface WhatTheyThinkResult {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
}

// 深度解读数据接口
interface DeepReading {
  sections: Array<{
    position: number;
    title: string;
    text: string;
  }>;
  summary: {
    title: string;
    text: string;
  };
}

// LocalStorage keys
const STORAGE_KEY = 'what_they_think_result';
const DEEP_READING_KEY = 'what_they_think_deep_reading';

// 牌位配置（⚠️ 不可更改）
const SLOT_CONFIG = [
  {
    position: 1,
    title: 'TA 对你说出口的态度',
    meaning: 'TA 目前对你表达出来的想法与立场，代表你现在听到和看到的那一层。',
  },
  {
    position: 2,
    title: 'TA 内心真正的想法',
    meaning: 'TA 心里正在反复思考的真实念头，以及理性层面对这段关系的判断。',
  },
  {
    position: 3,
    title: 'TA 内心深处的真实感受',
    meaning: 'TA 潜意识中的情绪与真实感受，可能连 TA 自己都没有完全意识到。',
  },
  {
    position: 4,
    title: 'TA 对你的实际行动',
    meaning: 'TA 在现实中对你采取的行为与反应，用来对照前面的说、想与感受。',
  },
  {
    position: 5,
    title: '正在影响 TA 的外在因素',
    meaning: '来自现实或他人的外部影响因素，正在左右 TA 的判断与选择。',
  },
  {
    position: 6,
    title: '这段关系的短期走向',
    meaning: '基于当前状态，这段关系在接下来约 2–3 个月内最可能的发展趋势。',
  },
];

// 从 localStorage 读取结果
const loadWhatTheyThinkResult = (): WhatTheyThinkResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load what they think result:', error);
    return null;
  }
};

// 缓存深度解读到 localStorage
const saveDeepReading = (data: DeepReading) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEEP_READING_KEY, JSON.stringify(data));
};

// 从 localStorage 读取深度解读
const loadDeepReading = (): DeepReading | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(DEEP_READING_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load deep reading:', error);
    return null;
  }
};

// 生成基础解读（兜底方案）
const generateBasicReading = (cards: ShuffledTarotCard[]) => {
  return cards.map((card, index) => {
    const config = SLOT_CONFIG[index];
    const text = card.orientation === 'upright' ? card.upright : card.reversed;
    return {
      position: config.position,
      title: config.title,
      text: text,
    };
  });
};

export default function WhatTheyThinkResult() {
  const router = useRouter();
  const [savedResult, setSavedResult] = useState<WhatTheyThinkResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDeep, setIsGeneratingDeep] = useState(false);
  const [deepReading, setDeepReading] = useState<DeepReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [basicReading, setBasicReading] = useState<any[]>([]);

  // 自动生成深度解读的函数
  const generateDeepReading = async (result: WhatTheyThinkResult) => {
    setIsGeneratingDeep(true);
    setError(null);

    try {
      // 准备发送给 API 的数据
      const cardsData = result.cards.map((card, index) => ({
        position: SLOT_CONFIG[index].position,
        title: SLOT_CONFIG[index].title,
        meaning: SLOT_CONFIG[index].meaning,
        cardName: card.name,
        isReversed: card.orientation === 'reversed',
        keywords: card.keywords,
      }));

      const response = await fetch('/api/what-they-think-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: cardsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成解读失败');
      }

      const data: DeepReading = await response.json();
      setDeepReading(data);
      saveDeepReading(data);
    } catch (err: any) {
      console.error('Failed to generate deep reading:', err);
      setError(err.message || '生成深度解读失败，已显示基础解读');
      // API 失败时，基础解读作为兜底方案
    } finally {
      setIsGeneratingDeep(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const result = loadWhatTheyThinkResult();
    if (!result) {
      // 没有结果，返回抽牌页
      router.replace('/themed-readings/love/what-they-think/draw');
      return;
    }

    setSavedResult(result);
    
    // 生成基础解读（作为兜底方案）
    try {
      const basic = generateBasicReading(result.cards);
      setBasicReading(basic);
    } catch (err) {
      console.error('Failed to generate basic reading:', err);
    }

    // 尝试加载已保存的深度解读
    const savedDeepReading = loadDeepReading();
    if (savedDeepReading) {
      // 如果有缓存，直接使用
      setDeepReading(savedDeepReading);
      setIsLoading(false);
    } else {
      // 如果没有缓存，自动生成深度解读
      setIsLoading(false); // 先显示页面内容
      generateDeepReading(result); // 后台生成深度解读
    }
  }, [router]);

  const handleReturnToList = () => {
    router.back();
  };

  const handleDrawAgain = () => {
    if (confirm('确定要重新抽牌吗？当前结果将被清空。')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DEEP_READING_KEY);
      router.push('/themed-readings/love/what-they-think/draw');
    }
  };

  if (isLoading || !savedResult) {
    return (
      <>
        <Head>
          <title>加载中... - 对方在想什么</title>
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <div className="text-white text-lg">加载中...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>对方在想什么 - 解读结果</title>
        <meta name="description" content="探索对方此刻的真实想法与情绪" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] pb-20">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* 主内容 */}
        <div className="relative z-10">
          {/* 顶部导航 */}
          <div className="px-4 sm:px-8 py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={handleReturnToList}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="hidden sm:inline">返回</span>
              </button>
              
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-white">对方在想什么</h1>
                <p className="text-sm text-white/50 mt-1">解读结果</p>
              </div>

              <button
                onClick={handleDrawAgain}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">refresh</span>
                <span className="hidden sm:inline">重抽</span>
              </button>
            </div>
          </div>

          {/* 牌阵展示 */}
          <div className="px-4 sm:px-8 mt-8">
            <div className="max-w-7xl mx-auto">
              <TwoRowsThreeColsSlots
                cards={savedResult.cards}
                isAnimating={[false, false, false, false, false, false]}
                showLoadingText={false}
                forceFlipped={true}
                slotConfig={SLOT_CONFIG}
              />
            </div>
          </div>

          {/* 解读内容 */}
          <div className="px-4 sm:px-8 mt-12">
            <div className="max-w-4xl mx-auto">
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
                      className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <p className="text-red-300 text-sm flex-1">{error}</p>
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

                {/* 顶部加载提示 - 正在生成 AI 深度解读 */}
                {isGeneratingDeep && !deepReading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">✨ AI 正在为你生成深度解读...</p>
                        <p className="text-white/60 text-xs mt-1">请稍候，解读内容生成后将自动展示</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 解读内容区域 - 只在有深度解读或不在生成中时显示 */}
                {(!isGeneratingDeep || deepReading) && (
                  <>
                    {/* 一句话总结 */}
                    {deepReading?.summary && (
                      <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">✨</span>
                          <h2 className="text-white text-lg font-bold">
                            {deepReading.summary.title}
                          </h2>
                        </div>
                        <p className="text-white/80 text-base leading-relaxed">
                          {deepReading.summary.text}
                        </p>
                      </div>
                    )}

                    {/* 详细解读 */}
                    <div className="space-y-8">
                      <h2 className="text-white text-2xl font-bold text-center mb-8">
                        详细解读
                      </h2>

                      {savedResult.cards.map((card, index) => {
                        const config = SLOT_CONFIG[index];
                        const deepSection = deepReading?.sections[index];
                        const basicSection = basicReading[index];
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="rounded-xl bg-white/5 border border-white/10 p-6 sm:p-8"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary font-bold">{config.position}</span>
                              </div>
                              <div>
                                <h3 className="text-white text-lg font-bold">
                                  {config.title}
                                </h3>
                                <p className="text-white/50 text-sm">
                                  {config.meaning}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                              <div className="flex-shrink-0 mx-auto sm:mx-0">
                                <div className="relative w-28 h-42 rounded-lg overflow-hidden border-2 border-white/20">
                                  <img
                                    src={card.image}
                                    alt={card.name}
                                    className={`w-full h-full object-cover ${
                                      card.orientation === 'reversed' ? 'rotate-180' : ''
                                    }`}
                                    style={{
                                      backgroundColor: 'white',
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="flex-1">
                                <h4 className="text-white text-base font-semibold mb-2">
                                  {card.name}
                                </h4>
                                <p className="text-white/60 text-sm mb-4">
                                  {card.orientation === 'upright' ? '正位' : '逆位'}
                                  {' · '}
                                  {card.keywords.join('、')}
                                </p>
                                <div className="rounded-lg bg-white/5 p-4">
                                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                                    {deepSection?.text || basicSection?.text || (card.orientation === 'upright' ? card.upright : card.reversed)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* 加载状态 - 正在生成 AI 深度解读（底部） */}
                    {isGeneratingDeep && !deepReading && (
                      <div className="mt-8 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-white text-lg font-semibold">✨ AI 正在为你生成深度解读...</p>
                          <p className="text-white/60 text-sm">
                            这可能需要 10-30 秒，请稍候
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 底部提示 */}
                <div className="mt-12 rounded-xl bg-primary/5 border border-primary/20 p-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary text-2xl">info</span>
                    <div className="flex-1">
                      <h3 className="text-white text-lg font-bold mb-2">关于这次占卜</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        塔罗牌反映的是当下的能量与趋势，而非绝对的命运。
                        「对方在想什么」牌阵帮助你更清晰地理解对方的内在状态与外在表现，
                        但请记住，真正的沟通需要双方的开放与真诚。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDrawAgain}
                    className="flex-1 py-4 rounded-lg bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    重新抽牌
                  </button>
                  <button
                    onClick={handleReturnToList}
                    className="flex-1 py-4 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
                  >
                    返回爱情占卜
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

