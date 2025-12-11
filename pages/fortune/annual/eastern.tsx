import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// 用户状态类型定义
interface User {
  id?: string;
  membership?: 'free' | 'premium' | 'vip';
  isPaid?: boolean;
}

export default function EasternAnnualGuidance() {
  const router = useRouter();
  
  // 动态获取当前年份
  const currentYear = new Date().getFullYear();
  
  // 用户状态
  const [user, setUser] = useState<User | null>(null);

  // 会员判断逻辑
  const isMember = user?.membership === 'premium' || user?.membership === 'vip' || user?.isPaid === true;

  // 初始化用户状态并检查会员权限
  useEffect(() => {
    // TODO: 从全局状态管理或 API 获取用户信息
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    
    // 如果没有用户数据，默认为免费用户
    if (!userData) {
      setUser({ membership: 'free', isPaid: false });
    }
    
    // 会员权限检查（暂时注释，方便开发调试）
    // if (!isMember) {
    //   router.push('/membership/unlock');
    // }
  }, []);
  
  const handleBackToAnnual = () => {
    router.push('/fortune/annual');
  };

  return (
    <>
      <Head>
        <title>生肖 × 易经 · 年运 - Mystic Insights</title>
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
              onClick={handleBackToAnnual}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">返回年度运势</span>
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
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-8 text-8xl">☯</div>
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">生肖 × 易经 · 年运</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                  Zodiac × I-Ching · Annual Guidance
                </h1>
                <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12">
                  <p className="text-white/70 text-lg leading-relaxed mb-4">
                    此功能正在开发中...
                  </p>
                  <p className="text-white/50 text-sm">
                    敬请期待 {currentYear} 年的生肖易经年运指引
                  </p>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

