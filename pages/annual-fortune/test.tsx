/**
 * 测试页面
 * 访问 /annual-fortune/test 运行测试
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { runAllTests } from '../../tests/annual-fortune.test';

export default function TestPage() {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);

  const runTests = () => {
    setIsRunning(true);
    setOutput([]);
    setAllPassed(null);

    // 捕获 console.log 输出
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    console.error = (...args: any[]) => {
      logs.push('ERROR: ' + args.join(' '));
      originalError(...args);
    };

    console.warn = (...args: any[]) => {
      logs.push('WARN: ' + args.join(' '));
      originalWarn(...args);
    };

    // 运行测试
    try {
      const passed = runAllTests();
      setAllPassed(passed);
    } catch (error) {
      logs.push(`FATAL ERROR: ${error}`);
      setAllPassed(false);
    }

    // 恢复 console
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;

    setOutput(logs);
    setIsRunning(false);
  };

  // 自动运行测试
  useEffect(() => {
    runTests();
  }, []);

  return (
    <>
      <Head>
        <title>Annual Fortune Tests - Mystic Insights</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            <div className="flex items-center gap-4">
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                Mystic Insights
              </h2>
              <span className="text-white/50 text-sm">/ Tests</span>
            </div>
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-10 md:py-16">
            <div className="mx-auto max-w-5xl">
              {/* 标题 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight mb-3">
                  年度运势测试
                </h1>
                <p className="text-white/60 text-base">
                  验证数据验证、本地规则生成、存储功能
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center mb-8">
                <button
                  onClick={runTests}
                  disabled={isRunning}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">
                    {isRunning ? 'hourglass_empty' : 'play_arrow'}
                  </span>
                  {isRunning ? '运行中...' : '重新运行测试'}
                </button>
              </div>

              {/* 测试结果汇总 */}
              {allPassed !== null && (
                <div className={`mb-6 p-6 rounded-2xl border ${
                  allPassed 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-4xl ${
                      allPassed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {allPassed ? 'check_circle' : 'error'}
                    </span>
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        allPassed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {allPassed ? '所有测试通过！' : '部分测试失败'}
                      </h2>
                      <p className="text-white/60 text-sm mt-1">
                        {allPassed 
                          ? '功能运行正常，可以上线' 
                          : '请检查失败的测试用例'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 测试输出 */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">terminal</span>
                  测试输出
                </h3>
                
                <div className="bg-black/50 rounded-xl p-4 font-mono text-sm max-h-[600px] overflow-y-auto">
                  {output.length === 0 ? (
                    <p className="text-white/40">等待测试结果...</p>
                  ) : (
                    output.map((line, index) => (
                      <div
                        key={index}
                        className={`mb-1 ${
                          line.includes('PASSED') || line.includes('✅')
                            ? 'text-green-400'
                            : line.includes('FAILED') || line.includes('❌')
                            ? 'text-red-400'
                            : line.includes('WARN') || line.includes('⚠️')
                            ? 'text-amber-400'
                            : 'text-white/80'
                        }`}
                      >
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 说明 */}
              <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
                <h4 className="text-lg font-semibold mb-2">测试说明</h4>
                <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                  <li>测试 1：验证缺少 readingId 时显示空态</li>
                  <li>测试 2：验证 sessionStorage fallback 机制</li>
                  <li>测试 3：验证 JSON 校验失败时的 fallback</li>
                  <li>测试 4：验证本地规则生成的完整性</li>
                  <li>测试 5：验证正逆位对解读的影响</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

