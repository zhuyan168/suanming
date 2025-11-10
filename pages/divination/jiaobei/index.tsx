import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

type ResultType = 'sheng' | 'yin' | 'xiao';

export default function JiaoBeiPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    // 确保 Tailwind 配置已加载
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThrow = () => {
    // 防止重复点击
    if (isProcessing) return;

    setIsProcessing(true);

    // 模拟真实筊杯的物理偏向（凸面较不稳定）
    // 概率分布：圣筊 49.92%、笑筊 27.04%、阴筊 23.04%
    const firstFaceUp = Math.random() > 0.48;
    const secondFaceUp = Math.random() > 0.48;

    let result: ResultType;
    if (firstFaceUp !== secondFaceUp) {
      result = 'sheng'; // 一正一反 - 圣筊
    } else if (!firstFaceUp && !secondFaceUp) {
      result = 'xiao'; // 两反 - 笑筊
    } else {
      result = 'yin'; // 两正 - 阴筊
    }

    // 延迟 1.5 秒后跳转到结果页，携带问题参数
    setTimeout(() => {
      const params = new URLSearchParams({ type: result });
      if (question.trim()) {
        params.append('question', question.trim());
      }
      router.push(`/divination/jiaobei/result?${params.toString()}`);
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>掷筊占卜 - Mystic Insights</title>
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
          /* 等待提示淡入动画 */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* 加载动画 */
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
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
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-medium">返回首页</span>
              </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
              <div className="mx-auto max-w-4xl">
                {/* 介绍文字 */}
                <div className="mb-12 text-center">
                  <div className="inline-block mb-4 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5">
                    <span className="text-primary text-sm font-semibold uppercase tracking-wider">掷筊占卜</span>
                  </div>
                  <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] mb-6">
                    掷筊 · 问神明
                  </h1>
                  <div className="max-w-2xl mx-auto space-y-4 text-white/70 text-base leading-relaxed">
                    <p>
                      掷筊，又称问筊，是传统民俗中与神明沟通的方式。
                    </p>
                    <p>
                      人们在心中默念问题后，掷出两块圣杯，通过杯面朝向来判断神明的回应。
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-2xl mb-2">🌕🌑</div>
                        <div className="font-semibold text-white mb-1">圣筊</div>
                        <div className="text-white/60">一正一反，表示允准</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-2xl mb-2">🌑🌑</div>
                        <div className="font-semibold text-white mb-1">笑筊</div>
                        <div className="text-white/60">两反，神明含笑未答</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-2xl mb-2">🌕🌕</div>
                        <div className="font-semibold text-white mb-1">阴筊</div>
                        <div className="text-white/60">两正，表示否定或不宜</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 问题输入区域 */}
                {!isProcessing && (
                  <div className="mb-12 max-w-2xl mx-auto">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <label className="block text-sm font-semibold text-white/80 mb-3" htmlFor="jiaobei-question">
                        你的问题（可选）
                      </label>
                      <textarea
                        id="jiaobei-question"
                        className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        rows={3}
                        maxLength={100}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="在心中默念问题后开始掷筊，也可以在此输入问题获得更详细的解读..."
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                        <span>输入问题可获得 AI 个性化解读</span>
                        <span>{question.length}/100</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 等待提示区域 */}
                {isProcessing && (
                  <div 
                    className="text-center mb-12 min-h-[200px] flex items-center justify-center"
                    style={{
                      animation: 'fadeIn 0.5s ease-out forwards',
                    }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      {/* 加载图标 */}
                      <div
                        className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
                        style={{
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      {/* 提示文字 */}
                      <p className="text-white text-lg font-medium">
                        神明正在回应……
                      </p>
                    </div>
                  </div>
                )}

                {/* 开始掷筊按钮 */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleThrow}
                    disabled={isProcessing}
                    className={`flex items-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition-all duration-300 ${
                      !isProcessing
                        ? 'bg-primary text-white shadow-[0_0_30px_rgba(127,19,236,0.5)] hover:bg-primary/90 hover:scale-105 cursor-pointer'
                        : 'bg-white/10 text-white/40 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {isProcessing ? 'hourglass_empty' : 'auto_awesome'}
                    </span>
                    <span>{isProcessing ? '掷筊中…' : '开始掷筊'}</span>
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

