import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import SixCardSlots from '../../../../components/fortune/SixCardSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import {
  generateFutureLoverBasicReading,
  generateBasicSummary,
  generateBasicActions,
} from '../../../../utils/future-lover-interpretation';
import { saveReadingHistory } from '../../../../lib/saveReadingHistory';
import { useHistoryBack } from '../../../../hooks/useHistoryBack';
import { getAuthHeaders } from '../../../../lib/apiHeaders';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 结果数据接口
interface FutureLoverResult {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
}

// 深度解读数据接口
interface DeepReading {
  sections: Array<{
    slotKey: string;
    title: string;
    text: string;
  }>;
  summary: {
    title: string;
    text: string;
  };
  actions: Array<{
    text: string;
  }>;
}

// LocalStorage keys
const STORAGE_KEY = 'future_lover_result';
const DEEP_READING_KEY = 'future_lover_deep_reading';

// 牌位配置
const SLOT_CONFIG = [
  { key: 'guide', label: '指引牌', question: '本次占卜的整体指引是什么？' },
  { key: 'type', label: '1号位', subLabel: '他/她是什么类型', question: 'TA的性格/气质/特征是什么？' },
  { key: 'appeared', label: '2号位', subLabel: '他/她已经出现了吗？', question: 'TA是否已经在你的生活圈/视野中？' },
  { key: 'obstacle', label: '3号位', subLabel: '遇到的阻力', question: '当前阻碍相遇/推进的因素是什么？' },
  { key: 'pattern', label: '4号位', subLabel: '相处模式', question: '你们更可能以怎样的方式相处与靠近？' },
  { key: 'how_to_meet', label: '5号位', subLabel: '怎样才能遇到他/她', question: '你可以采取什么行动/状态调整来更接近相遇？' },
];

// 从 localStorage 读取结果
const loadFutureLoverResult = (): FutureLoverResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load future lover result:', error);
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

export default function FutureLoverResult() {
  const router = useRouter();
  const { isFromHistory, goBack: goBackToHistory } = useHistoryBack();
  const [savedResult, setSavedResult] = useState<FutureLoverResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDeep, setIsGeneratingDeep] = useState(false);
  const [deepReading, setDeepReading] = useState<DeepReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [basicReading, setBasicReading] = useState<any[]>([]);
  const [basicSummary, setBasicSummary] = useState<string>('');
  const [basicActions, setBasicActions] = useState<string[]>([]);

  // 自动生成深度解读的函数
  const generateDeepReading = async (result: FutureLoverResult) => {
    setIsGeneratingDeep(true);
    setError(null);

    try {
      // 准备发送给 API 的数据
      const cardsData = result.cards.map((card, index) => ({
        slotName: SLOT_CONFIG[index].label,
        cardName: card.name,
        isReversed: card.orientation === 'reversed',
        keywords: card.keywords,
      }));

      const headers = await getAuthHeaders();
      const response = await fetch('/api/future-lover-reading', {
        method: 'POST',
        headers,
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

      saveReadingHistory({
        spreadType: 'love-future-lover',
        cards: result.cards,
        readingResult: data,
        resultPath: '/themed-readings/love/future-lover/result',
      });
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

    const result = loadFutureLoverResult();
    if (!result) {
      // 没有结果，返回抽牌页
      router.replace('/themed-readings/love/future-lover/draw');
      return;
    }

    setSavedResult(result);
    
    // 生成基础解读（作为兜底方案）
    try {
      const basic = generateFutureLoverBasicReading(result.cards);
      const summary = generateBasicSummary(result.cards);
      const actions = generateBasicActions(result.cards);
      setBasicReading(basic);
      setBasicSummary(summary);
      setBasicActions(actions);
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
      router.push('/themed-readings/love/future-lover/draw');
    }
  };


  if (isLoading || !savedResult) {
    return (
      <>
        <Head>
          <title>加载中... - 未来恋人牌阵</title>
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
        <title>未来恋人牌阵 - 解读结果</title>
        <meta name="description" content="探索你的未来恋人" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700;800&display=swap"
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
          html.dark, html.dark body { background-color: #0f0f23; }
        ` }} />
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
                onClick={isFromHistory ? goBackToHistory : handleReturnToList}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="hidden sm:inline">{isFromHistory ? '返回我的占卜记录' : '返回'}</span>
              </button>
              
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-white">未来恋人牌阵</h1>
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
              <SixCardSlots
                cards={savedResult.cards}
                isAnimating={[false, false, false, false, false, false]}
                showLoadingText={false}
                forceFlipped={true}
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
                          <span className="material-symbols-outlined notranslate text-sm">close</span>
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
                    {(basicSummary || deepReading?.summary) && (
                  <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">✨</span>
                      <h2 className="text-white text-lg font-bold">
                        {deepReading?.summary.title || '一句话总结'}
                      </h2>
                    </div>
                    <p className="text-white/80 text-base leading-relaxed">
                      {deepReading?.summary.text || basicSummary}
                    </p>
                  </div>
                    )}

                {/* 总体指引 */}
                <div className="mb-12">
                  <div className="rounded-xl bg-primary/10 border border-primary/30 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🌙</span>
                      <h2 className="text-white text-xl sm:text-2xl font-bold">
                        指引牌 - 整体指引
                      </h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-primary">
                          <img
                            src={savedResult.cards[0].image}
                            alt={savedResult.cards[0].name}
                            className={`w-full h-full object-cover ${
                              savedResult.cards[0].orientation === 'reversed' ? 'rotate-180' : ''
                            }`}
                            style={{
                              backgroundColor: 'white',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white text-lg font-semibold mb-2">
                          {savedResult.cards[0].name}
                        </h3>
                        <p className="text-white/60 text-sm mb-4">
                          {savedResult.cards[0].orientation === 'upright' ? '正位' : '逆位'}
                          {' · '}
                          {savedResult.cards[0].keywords.join('、')}
                        </p>
                        <div className="rounded-lg bg-white/5 p-4">
                          <p className="text-white/70 text-base leading-relaxed">
                            {deepReading?.sections[0]?.text || basicReading[0]?.text || SLOT_CONFIG[0].question}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 详细解读 */}
                <div className="space-y-8">
                  <h2 className="text-white text-2xl font-bold text-center mb-8">
                    详细解读
                  </h2>

                  {savedResult.cards.slice(1).map((card, index) => {
                    const config = SLOT_CONFIG[index + 1];
                    const deepSection = deepReading?.sections[index + 1];
                    const basicSection = basicReading[index + 1];
                    
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
                            <span className="text-primary font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-white text-lg font-bold">
                              {config.subLabel}
                            </h3>
                            <p className="text-white/50 text-sm">
                              {config.question}
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

                {/* 行动建议 */}
                {((deepReading?.actions && deepReading.actions.length > 0) || basicActions.length > 0) && (
                  <div className="mt-12 rounded-xl bg-white/5 border border-white/10 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-2xl">💫</span>
                      <h2 className="text-white text-xl font-bold">行动建议</h2>
                    </div>
                    <div className="space-y-3">
                      {(deepReading?.actions || basicActions.map(text => ({ text }))).map((action, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                            {index + 1}
                          </div>
                          <p className="text-white/80 text-sm flex-1">{action.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                        未来恋人牌阵帮助你看清自己的期待、当下的状态以及可能的路径。
                        请记住，真正的相遇需要你保持开放、真诚，并在合适的时机采取行动。
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

