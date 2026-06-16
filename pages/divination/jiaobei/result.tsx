import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getAuthHeaders } from '../../../lib/apiHeaders';

type ResultType = 'sheng' | 'yin' | 'xiao';

interface JiaobeiReadingCache {
  requestId: string;
  type: ResultType;
  question: string;
  locale: 'en' | 'zh';
  interpretation: string;
}

interface ResultInfo {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  gradient: string;
}

const resultData: Record<'en' | 'zh', Record<ResultType, ResultInfo>> = {
  en: {
    sheng: {
      title: 'Sheng Jiao',
      subtitle: 'Positive Sign',
      description:
        'This points to a favorable answer. The timing is supportive, so move forward with care and confidence.',
      emoji: '🌕🌑',
      color: '#10b981',
      gradient: 'from-emerald-500/20 to-green-500/20',
    },
    yin: {
      title: 'Yin Jiao',
      subtitle: 'Negative Sign',
      description:
        'This suggests pausing for now. Take more time to reflect, avoid forcing the matter, and wait for a better moment.',
      emoji: '🌕🌕',
      color: '#ef4444',
      gradient: 'from-red-500/20 to-rose-500/20',
    },
    xiao: {
      title: 'Xiao Jiao',
      subtitle: 'Unclear Sign',
      description:
        'The answer is not clear yet. Your question may need to be more specific, or the situation may need more time.',
      emoji: '🌑🌑',
      color: '#f59e0b',
      gradient: 'from-amber-500/20 to-yellow-500/20',
    },
  },
  zh: {
    sheng: {
      title: '圣筊',
      subtitle: 'Positive Sign',
      description: '此事可行，顺势而为。神明已允准你的请求，时机成熟，把握当下，勇敢前行。',
      emoji: '🌕🌑',
      color: '#10b981',
      gradient: 'from-emerald-500/20 to-green-500/20',
    },
    yin: {
      title: '阴筊',
      subtitle: 'Negative Sign',
      description: '暂缓行事，宜再思量。此时不宜轻举妄动，建议沉淀思考，等待更好的时机。',
      emoji: '🌕🌕',
      color: '#ef4444',
      gradient: 'from-red-500/20 to-rose-500/20',
    },
    xiao: {
      title: '笑筊',
      subtitle: 'Unclear Sign',
      description: '神明含笑未答，再问一次吧。或许你的问题需要更明确，或者神明希望你再思考一下。',
      emoji: '🌑🌑',
      color: '#f59e0b',
      gradient: 'from-amber-500/20 to-yellow-500/20',
    },
  },
};

const STORAGE_KEY_READING_PREFIX = 'jiaobei_reading_v1:';

const getReadingCacheKey = (requestId: string) => `${STORAGE_KEY_READING_PREFIX}${requestId}`;

const getQueryString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
};

const getFallbackRequestId = (resultType: ResultType, userQuestion: string, locale: 'en' | 'zh') =>
  `legacy_${locale}_${resultType}_${encodeURIComponent(userQuestion)}`;

const loadReadingCache = (requestId: string): JiaobeiReadingCache | null => {
  if (typeof window === 'undefined' || !requestId) return null;
  try {
    const raw = localStorage.getItem(getReadingCacheKey(requestId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveReadingCache = (data: JiaobeiReadingCache) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getReadingCacheKey(data.requestId), JSON.stringify(data));
};

export default function ResultPage() {
  const router = useRouter();
  const isEn = router.locale !== 'zh';
  const locale = isEn ? 'en' : 'zh';
  const text = isEn
    ? {
        pageTitle: 'Jiaobei Oracle Result',
        backHome: 'Back Home',
        aiReading: 'AI Reading',
        yourQuestion: 'Your question: ',
        loadingAi: 'Reading...',
        tryAgain: 'Cast Again',
        disclaimer: 'Divination is for reflection only. Please make final decisions with real-world judgment.',
      }
    : {
        pageTitle: '掷筊占卜结果',
        backHome: '返回首页',
        aiReading: 'AI 解读',
        yourQuestion: '你的问题：',
        loadingAi: '正在解读中...',
        tryAgain: '再掷一次',
        disclaimer: '占卜仅供参考，最终决策请结合实际情况谨慎判断',
      };
  const { type, question, rid } = router.query;
  const [isVisible, setIsVisible] = useState(false);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (type && typeof type === 'string') {
      const resultType = type as ResultType;
      if (resultData[locale][resultType]) {
        setResult(resultData[locale][resultType]);
        setTimeout(() => setIsVisible(true), 100);
        
        // 检查免费次数后再决定是否继续
        checkAndProceed(
          resultType,
          getQueryString(question).trim(),
          getQueryString(rid) || getFallbackRequestId(resultType, getQueryString(question).trim(), locale)
        );
      } else {
        router.push('/');
      }
    }
  }, [type, question, rid, router, locale]);

  const checkAndProceed = (resultType: ResultType, userQuestion: string, requestId: string) => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const cached = loadReadingCache(requestId);
    if (
      cached &&
      cached.type === resultType &&
      cached.question === userQuestion &&
      cached.locale === locale
    ) {
      setAiInterpretation(cached.interpretation);
      return;
    }

    fetchInterpretation(resultType, userQuestion, requestId);
  };

  const fetchInterpretation = async (resultType: ResultType, userQuestion: string, requestId: string) => {
    const hasQuestion = userQuestion.length > 0;
    if (hasQuestion) setIsLoadingAI(true);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/jiaobei', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: userQuestion || '',
          result: resultType,
          locale: isEn ? 'en' : 'zh',
          clientRequestId: requestId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.interpretation) {
        setAiInterpretation(data.interpretation);
        saveReadingCache({
          requestId,
          type: resultType,
          question: userQuestion,
          locale,
          interpretation: data.interpretation,
        });
      } else if (!response.ok) {
        console.error('解读请求失败:', data);
      }
    } catch (error) {
      console.error('调用解读出错:', error);
    } finally {
      if (hasQuestion) setIsLoadingAI(false);
    }
  };

  const handleTryAgain = () => {
    router.push('/divination/jiaobei');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  if (!result) {
    return null; // 或者显示加载状态
  }

  return (
    <>
      <Head>
        <title>{result.title} - {text.pageTitle} - FateAura</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-fade-in-scale {
            animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes pulse-ring {
            0%, 100% {
              transform: scale(1);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.3;
            }
          }
          .animate-pulse-ring {
            animation: pulse-ring 2s ease-in-out infinite;
          }
        `
        }} />
        
      </Head>
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen">
          <div className="relative flex min-h-screen w-full flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white">
                <img
                    src="/favicon.png"
                    alt=""
                    aria-hidden="true"
                    className="size-8 rounded-md object-cover shrink-0"
                  />
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">FateAura</h2>
              </div>
              <button
                type="button"
                onClick={handleBackHome}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">home</span>
                <span className="text-sm font-medium hidden sm:inline">{text.backHome}</span>
              </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16 flex items-center justify-center">
              <div className="mx-auto max-w-3xl w-full">
                <div
                  className={`relative transition-all duration-600 ${isVisible ? 'animate-fade-in-scale' : 'opacity-0'
                    }`}
                >
                  {/* 背景光晕 */}
                  <div className="absolute inset-0 -z-10 flex items-center justify-center">
                    <div
                      className="w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-ring"
                      style={{
                        background: `radial-gradient(circle, ${result.color} 0%, transparent 70%)`,
                      }}
                    />
                  </div>

                  {/* 结果卡片 */}
                  <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${result.gradient} backdrop-blur-sm p-8 sm:p-12 text-center`}>
                    {/* Emoji */}
                    <div className="text-7xl sm:text-8xl mb-6 animate-pulse">
                      {result.emoji}
                    </div>

                    {/* 标题 */}
                    <div className="mb-6">
                      <h1
                        className="text-5xl sm:text-6xl font-black mb-3 tracking-tight"
                        style={{ color: result.color }}
                      >
                        {result.title}
                      </h1>
                      <p className="text-white/60 text-lg font-medium uppercase tracking-wider">
                        {result.subtitle}
                      </p>
                    </div>

                    {/* 描述 */}
                    <div className="max-w-xl mx-auto mb-8">
                      <p className="text-white/80 text-lg sm:text-xl leading-relaxed">
                        {result.description}
                      </p>
                    </div>

                    {/* AI 解读区域 */}
                    {(question && typeof question === 'string' && question.trim()) && (
                      <div className="max-w-xl mx-auto mb-8">
                        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">{text.aiReading}</span>
                          </div>
                          <div className="mb-3 text-white/70 text-sm">
                            <span className="font-medium">{text.yourQuestion}</span>{question}
                          </div>
                          {isLoadingAI ? (
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              <span className="text-sm">{text.loadingAi}</span>
                            </div>
                          ) : aiInterpretation ? (
                            <p className="text-white/90 text-base leading-relaxed">
                              {aiInterpretation}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )}


                    {/* 分隔线 */}
                    <div className="w-24 h-px bg-white/20 mx-auto mb-8" />

                    {/* 操作按钮 */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        type="button"
                        onClick={handleTryAgain}
                        className="flex items-center gap-2 rounded-full bg-primary text-white px-6 py-3 text-base font-bold shadow-[0_0_30px_rgba(127,19,236,0.4)] hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                      >
                        <span className="material-symbols-outlined text-xl">refresh</span>
                        <span>{text.tryAgain}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBackHome}
                        className="flex items-center gap-2 rounded-full bg-white/10 text-white px-6 py-3 text-base font-bold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                      >
                        <span className="material-symbols-outlined text-xl">home</span>
                        <span>{text.backHome}</span>
                      </button>
                    </div>
                  </div>

                  {/* 额外提示 */}
                  <div className="mt-8 text-center">
                    <p className="text-white/50 text-sm">
                      {text.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

