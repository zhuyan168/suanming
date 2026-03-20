import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { saveReadingHistory } from '../../../lib/saveReadingHistory';
import { getAuthHeaders } from '../../../lib/apiHeaders';

type ResultType = 'sheng' | 'yin' | 'xiao';

interface ResultInfo {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  color: string;
  gradient: string;
}

const resultData: Record<ResultType, ResultInfo> = {
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
};

export default function ResultPage() {
  const router = useRouter();
  const { type, question } = router.query;
  const [isVisible, setIsVisible] = useState(false);
  const [result, setResult] = useState<ResultInfo | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const hasSavedRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (type && typeof type === 'string') {
      const resultType = type as ResultType;
      if (resultData[resultType]) {
        setResult(resultData[resultType]);
        setTimeout(() => setIsVisible(true), 100);
        
        // 检查免费次数后再决定是否继续
        checkAndProceed(resultType, question as string | undefined);
      } else {
        router.push('/');
      }
    }
  }, [type, question, router]);

  const checkAndProceed = (resultType: ResultType, userQuestion?: string) => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // 有问题则调用 AI 解读，否则直接保存基础结果
    if (userQuestion && userQuestion.trim()) {
      fetchAIInterpretation(resultType, userQuestion.trim());
    } else {
      if (!hasSavedRef.current) {
        hasSavedRef.current = true;
        saveReadingHistory({
          spreadType: 'divination-jiaobei',
          cards: [],
          readingResult: {
            type: resultType,
            title: resultData[resultType].title,
            description: resultData[resultType].description,
          },
          resultPath: `/divination/jiaobei/result?type=${resultType}`,
        });
      }
    }
  };

  const fetchAIInterpretation = async (resultType: ResultType, userQuestion: string) => {
    setIsLoadingAI(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/jiaobei', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: userQuestion,
          result: resultType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.interpretation) {
        setAiInterpretation(data.interpretation);
        
        // AI 解读成功后保存记录
        if (!hasSavedRef.current) {
          hasSavedRef.current = true;
          saveReadingHistory({
            spreadType: 'divination-jiaobei',
            question: userQuestion,
            cards: [],
            readingResult: {
              type: resultType,
              title: resultData[resultType].title,
              description: resultData[resultType].description,
              aiInterpretation: data.interpretation,
            },
            resultPath: `/divination/jiaobei/result?type=${resultType}&question=${encodeURIComponent(userQuestion)}`,
          });
        }
      } else {
        console.error('AI 解读失败:', data);
        // 即使 AI 失败也保存记录
        if (!hasSavedRef.current) {
          hasSavedRef.current = true;
          saveReadingHistory({
            spreadType: 'divination-jiaobei',
            question: userQuestion,
            cards: [],
            readingResult: {
              type: resultType,
              title: resultData[resultType].title,
              description: resultData[resultType].description,
            },
            resultPath: `/divination/jiaobei/result?type=${resultType}&question=${encodeURIComponent(userQuestion)}`,
          });
        }
      }
    } catch (error) {
      console.error('调用 AI 解读出错:', error);
      // 即使出错也保存记录
      if (!hasSavedRef.current) {
        hasSavedRef.current = true;
        saveReadingHistory({
          spreadType: 'divination-jiaobei',
          question: userQuestion,
          cards: [],
          readingResult: {
            type: resultType,
            title: resultData[resultType].title,
            description: resultData[resultType].description,
          },
          resultPath: `/divination/jiaobei/result?type=${resultType}&question=${encodeURIComponent(userQuestion)}`,
        });
      }
    } finally {
      setIsLoadingAI(false);
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
        <title>{result.title} - 掷筊占卜结果 - Mystic Insights</title>
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
          body {
            margin: 0;
            font-family: 'Spline Sans', sans-serif;
          }
          html.dark,
          html.dark body {
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
        <div className="font-display bg-background-dark min-h-screen">
          <div className="relative flex min-h-screen w-full flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white">
                <div className="size-6 text-primary">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Mystic Insights</h2>
              </div>
              <button
                type="button"
                onClick={handleBackHome}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">home</span>
                <span className="text-sm font-medium hidden sm:inline">返回首页</span>
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
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">AI 解读</span>
                          </div>
                          <div className="mb-3 text-white/70 text-sm">
                            <span className="font-medium">你的问题：</span>{question}
                          </div>
                          {isLoadingAI ? (
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              <span className="text-sm">正在解读中...</span>
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
                        <span>再掷一次</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBackHome}
                        className="flex items-center gap-2 rounded-full bg-white/10 text-white px-6 py-3 text-base font-bold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                      >
                        <span className="material-symbols-outlined text-xl">home</span>
                        <span>返回首页</span>
                      </button>
                    </div>
                  </div>

                  {/* 额外提示 */}
                  <div className="mt-8 text-center">
                    <p className="text-white/50 text-sm">
                      占卜仅供参考，最终决策请结合实际情况谨慎判断
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

