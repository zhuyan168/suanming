import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import FiveCardSlots from '../../../components/fortune/FiveCardSlots';
import { TarotCard } from '../../../components/fortune/CardItem';
import { tarotImagesFlat } from '../../../utils/tarotimages';
import { useHistoryBack } from '../../../hooks/useHistoryBack';
import { getAuthHeaders } from '../../../lib/apiHeaders';
import { useSpreadAccess } from '../../../hooks/useSpreadAccess';

// 获取当前季节
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1; // getMonth() 返回 0-11
  if (month >= 3 && month <= 5) return '春季';
  if (month >= 6 && month <= 8) return '夏季';
  if (month >= 9 && month <= 11) return '秋季';
  return '冬季'; // 12, 1, 2月
};

// 获取下个季度的日期范围
const getNextQuarterDateRange = (): { startMonth: number; startDay: number; endMonth: number; endDay: number; year: number } => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  
  // 春季 (3-5月) -> 下个季度是夏季 (6-8月)
  if (currentMonth >= 3 && currentMonth <= 5) {
    return {
      startMonth: 6,
      startDay: 1,
      endMonth: 8,
      endDay: 31,
      year: currentYear
    };
  }
  // 夏季 (6-8月) -> 下个季度是秋季 (9-11月)
  else if (currentMonth >= 6 && currentMonth <= 8) {
    return {
      startMonth: 9,
      startDay: 1,
      endMonth: 11,
      endDay: 30,
      year: currentYear
    };
  }
  // 秋季 (9-11月) -> 下个季度是冬季 (12-次年2月)
  else if (currentMonth >= 9 && currentMonth <= 11) {
    // 判断下一年是否为闰年
    const nextYear = currentYear + 1;
    const isLeapYear = (nextYear % 4 === 0 && nextYear % 100 !== 0) || (nextYear % 400 === 0);
    return {
      startMonth: 12,
      startDay: 1,
      endMonth: 2,
      endDay: isLeapYear ? 29 : 28,
      year: currentYear // 起始年份是当前年
    };
  }
  // 冬季 (12, 1, 2月) -> 下个季度是春季 (3-5月)
  else {
    // 如果现在是12月，下个季度在下一年
    // 如果现在是1-2月，下个季度在当前年
    const targetYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    return {
      startMonth: 3,
      startDay: 1,
      endMonth: 5,
      endDay: 31,
      year: targetYear
    };
  }
};

// 获取当前季度标识
const getCurrentQuarter = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  let quarter: number;
  if (month >= 3 && month <= 5) {
    quarter = 2; // 春季 Q2
  } else if (month >= 6 && month <= 8) {
    quarter = 3; // 夏季 Q3
  } else if (month >= 9 && month <= 11) {
    quarter = 4; // 秋季 Q4
  } else {
    // 冬季 12, 1, 2月 - 归属到当前年份的Q1
    quarter = 1;
    // 如果是12月，归到下一年的Q1
    if (month === 12) {
      return `${year + 1}-Q1`;
    }
  }
  
  return `${year}-Q${quarter}`;
};

// 工具函数：从旧 URL 中提取文件名作为 key
const getCardKeyFromUrl = (url: string) => {
  const match = url.match(/\/([^/]+)\.png$/);
  return match ? match[1] : null;
};

// 扩展的卡牌类型，包含预设的正逆位
interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 四季牌阵数据接口
interface SeasonalResult {
  userId?: string | null;
  cards: Array<{
    id: number;
    name: string;
    image: string;
    upright: string;
    reversed: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  reading?: SeasonalReading | null;  // 保存 AI 解读结果
  createdAt: number;
  quarter: string; // 季度标识，如 '2025-Q1'
}

// 按季度保存的历史记录接口
interface SeasonalRecords {
  [quarter: string]: SeasonalResult;
}

// DeepSeek 解读结果接口
interface SeasonalReading {
  coreEnergy: string;
  action: string;
  emotion: string;
  mind: string;
  material: string;
  synthesis: string;
}

// 五张卡槽的位置名称（对应API返回的顺序）
const SLOT_NAMES = [
  '行动力（Action）',
  '情感与人际关系（Emotion）',
  '思维与计划（Thinking）',
  '事业与财运（Wealth）',
  '整体运势（Overall）',
];

const SLOT_DESCRIPTIONS = [
  '你的行为方式、实践能力和执行力',
  '你的情感流动、感受体验和人际关系',
  '你的思考模式、决策方式和心智状态',
  '你的物质层面、现实状况和资源状态',
  '你的核心主题、整体方向和本质能量',
];

export default function SeasonalResult() {
  const router = useRouter();
  const { isFromHistory, goBack: goBackToHistory } = useHistoryBack();

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'fortune-seasonal',
    redirectPath: '/',
  });

  const [result, setResult] = useState<SeasonalResult | null>(null);
  const [cards, setCards] = useState<ShuffledTarotCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reading, setReading] = useState<SeasonalReading | null>(null);
  const [isLoadingReading, setIsLoadingReading] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  
  // 获取当前季节
  const currentSeason = getCurrentSeason();

  // 获取 DeepSeek 解读
  const fetchReading = useCallback(async (cardsData: ShuffledTarotCard[]) => {
    setIsLoadingReading(true);
    setReadingError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/seasonal-reading', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cards: cardsData.map(card => ({
            id: card.id,
            name: card.name,
            orientation: card.orientation,
            upright: card.upright,
            reversed: card.reversed,
            keywords: card.keywords,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('获取解读失败');
      }

      const readingData = await response.json();
      setReading(readingData);


      // 保存解读结果到 localStorage（按季度）
      if (typeof window !== 'undefined') {
        const currentQuarter = getCurrentQuarter();
        const storageKey = 'seasonal_fortune_records';
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const allRecords = JSON.parse(stored) as SeasonalRecords;
            if (allRecords[currentQuarter]) {
              allRecords[currentQuarter].reading = readingData;
              localStorage.setItem(storageKey, JSON.stringify(allRecords));
              console.log(`✅ ${currentQuarter} 解读结果已保存到 localStorage`);
            }
          } catch (e) {
            console.error('Failed to save reading to localStorage:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reading:', error);
      setReadingError(error instanceof Error ? error.message : '获取解读失败，请稍后重试');
    } finally {
      setIsLoadingReading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentQuarter = getCurrentQuarter();
    const storageKey = 'seasonal_fortune_records';
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      // 如果没有数据，跳转回抽牌页面
      router.push('/fortune/seasonal');
      return;
    }

    try {
      const allRecords = JSON.parse(stored) as SeasonalRecords;
      const parsedResult = allRecords[currentQuarter];
      
      if (!parsedResult) {
        // 如果当前季度没有记录，跳转回抽牌页面
        router.push('/fortune/seasonal');
        return;
      }
      
      // 验证并修复卡牌数据
      const validatedCards = parsedResult.cards.map(card => {
        const key = getCardKeyFromUrl(card.image);
        const newImage = key && tarotImagesFlat[key as keyof typeof tarotImagesFlat];
        
        if (newImage) {
          return {
            ...card,
            image: newImage,
          };
        }
        return card;
      });

      setResult({ ...parsedResult, cards: validatedCards });
      setCards(validatedCards as ShuffledTarotCard[]);
      setIsLoading(false);
      
      // 检查是否已有解读结果
      if (parsedResult.reading) {
        // 直接使用已保存的解读结果
        console.log('📖 使用已保存的解读结果');
        setReading(parsedResult.reading);
        setIsLoadingReading(false);
      } else {
        // 如果没有解读结果，才调用 API 获取
        console.log('🔮 首次获取解读结果');
        fetchReading(validatedCards as ShuffledTarotCard[]);
      }
    } catch (e) {
      console.error('Failed to parse stored result:', e);
      router.push('/fortune/seasonal');
    }
  }, [router, fetchReading]);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (accessLoading || !allowed || isLoading || !result) {
    return (
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-white/70">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{currentSeason}运势解析 - Mystic Insights</title>
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
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-flow {
            animation: flow 20s ease-in-out infinite;
          }
          html.dark,
          html.dark body {
            background-color: #191022;
          }
        ` }} />
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
                          },
                        },
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
          {/* 头部 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <button
              onClick={isFromHistory ? goBackToHistory : handleBackToHome}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">{isFromHistory ? '返回我的占卜记录' : '返回首页'}</span>
            </button>
            <div className="flex items-center gap-4 text-white">
              <div className="size-6 text-primary">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Mystic Insights</h2>
            </div>
            <div className="w-20"></div>
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
            <div className="mx-auto max-w-7xl">
              {/* 标题区域 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                  四季牌阵
                </p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  {currentSeason}运势已抽取
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  以下是你抽取的五张塔罗牌，它们揭示了你在不同维度的能量状态
                </p>
              </motion.div>

              {/* 卡牌展示 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <FiveCardSlots
                  cards={cards}
                  isAnimating={[false, false, false, false, false]}
                  showLoadingText={false}
                  forceFlipped={true}
                />
              </motion.div>

              {/* AI 解读内容 */}
              {isLoadingReading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-white/70">🔮 塔罗正在为你解读本季度的运势......</p>
                  </div>
                </motion.div>
              ) : readingError ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-sm text-center">
                    <p className="text-red-300 mb-4">{readingError}</p>
                    <button
                      onClick={() => fetchReading(cards)}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90"
                    >
                      重试
                    </button>
                  </div>
                </motion.div>
              ) : reading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="max-w-4xl mx-auto space-y-8"
                >
                  {/* 本季核心能量 */}
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl mt-1">
                        auto_awesome
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          整体运势（Overall）
                        </h3>
                        <p className="text-sm text-primary/80 font-medium mb-2">
                          {cards[4]?.name} ({cards[4]?.orientation === 'upright' ? '正位' : '逆位'})
                        </p>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {reading.coreEnergy}
                    </p>
                  </div>

                  {/* 行动 */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="material-symbols-outlined text-yellow-500 text-3xl mt-1">
                        bolt
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          行动力（Action）
                        </h3>
                        <p className="text-sm text-white/60 font-medium mb-2">
                          {cards[0]?.name} ({cards[0]?.orientation === 'upright' ? '正位' : '逆位'})
                        </p>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {reading.action}
                    </p>
                  </div>

                  {/* 情感与人际关系 */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="material-symbols-outlined text-pink-500 text-3xl mt-1">
                        favorite
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          情感与人际关系（Emotion）
                        </h3>
                        <p className="text-sm text-white/60 font-medium mb-2">
                          {cards[1]?.name} ({cards[1]?.orientation === 'upright' ? '正位' : '逆位'})
                        </p>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {reading.emotion}
                    </p>
                  </div>

                  {/* 思维与计划 */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="material-symbols-outlined text-blue-500 text-3xl mt-1">
                        psychology
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          思维与计划（Thinking）
                        </h3>
                        <p className="text-sm text-white/60 font-medium mb-2">
                          {cards[2]?.name} ({cards[2]?.orientation === 'upright' ? '正位' : '逆位'})
                        </p>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {reading.mind}
                    </p>
                  </div>

                  {/* 事业与财运 */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="material-symbols-outlined text-green-500 text-3xl mt-1">
                        account_balance_wallet
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          事业与财运（Wealth）
                        </h3>
                        <p className="text-sm text-white/60 font-medium mb-2">
                          {cards[3]?.name} ({cards[3]?.orientation === 'upright' ? '正位' : '逆位'})
                        </p>
                      </div>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {reading.material}
                    </p>
                  </div>

                  {/* 综合建议 */}
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary text-3xl mt-1">
                        explore
                      </span>
                      <h3 className="text-2xl font-bold text-white">
                        综合建议
                      </h3>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {reading.synthesis}
                    </p>
                  </div>
                </motion.div>
              ) : null}

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-12 flex justify-center"
              >
                <button
                  onClick={handleBackToHome}
                  className="px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                >
                  返回首页
                </button>
              </motion.div>

              {/* 提示文字 */}
              <div className="mt-8 text-center text-white/50 text-sm">
                <p>
                  🔒 本季度牌阵已抽取，下个季度 {(() => {
                    const nextQuarter = getNextQuarterDateRange();
                    const { startMonth, startDay, endMonth, endDay, year } = nextQuarter;
                    const currentYear = new Date().getFullYear();
                    
                    // 如果跨年，显示年份
                    if (startMonth === 12) {
                      return `${year}年${startMonth}月${startDay}日至${year + 1}年${endMonth}月${endDay}日`;
                    } else if (year > currentYear) {
                      return `${year}年${startMonth}月${startDay}日至${endMonth}月${endDay}日`;
                    } else {
                      return `${startMonth}月${startDay}日至${endMonth}月${endDay}日`;
                    }
                  })()} 可抽取新的牌阵
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

