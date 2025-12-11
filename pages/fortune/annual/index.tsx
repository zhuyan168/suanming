import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// 用户状态类型定义
interface User {
  id?: string;
  membership?: 'free' | 'premium' | 'vip';
  isPaid?: boolean;
}

export default function AnnualFortune() {
  const router = useRouter();
  
  // 动态获取当前年份
  const currentYear = new Date().getFullYear();
  
  // 用户状态（后续从全局状态管理或 API 获取）
  const [user, setUser] = useState<User | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // 会员判断逻辑
  const isMember = user?.membership === 'premium' || user?.membership === 'vip' || user?.isPaid === true;

  // 初始化用户状态（示例：从 localStorage 或 API 获取）
  useEffect(() => {
    // TODO: 从全局状态管理（如 Context、Redux、Zustand）或 API 获取用户信息
    // 示例：从 localStorage 获取
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsPaid(parsedUser.membership === 'premium' || parsedUser.membership === 'vip' || parsedUser.isPaid === true);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    // 如果没有用户数据，默认为免费用户
    if (!userData) {
      setUser({ membership: 'free', isPaid: false });
      setIsPaid(false);
    }
  }, []);
  
  const handleBackToHome = () => {
    router.push('/');
  };

  const handleCardClick = (path: string, isPremium: boolean = true) => {
    // 年度运势是会员功能，需要验证会员状态
    // 暂时绕过会员检查，方便查看界面
    // if (isPremium && !isMember) {
    //   router.push('/membership/unlock');
    //   return;
    // }
    
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>年度运势 - Mystic Insights</title>
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
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 5px 0px rgba(127, 19, 236, 0.4), 0 0 2px 0px rgba(127, 19, 236, 0.2);
            }
            50% {
              box-shadow: 0 0 10px 2px rgba(127, 19, 236, 0.6), 0 0 4px 1px rgba(127, 19, 236, 0.4);
            }
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
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
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">返回首页</span>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">年度运势</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  探索你的 {currentYear} 年运势
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mb-3">
                  选择你感应到的占卜方式，开启全新一年的神秘指引。
                </p>
                {/* 会员提示 */}
                <div className="flex items-center justify-center gap-2 text-primary/80 text-sm">
                  <svg 
                    className="w-4 h-4" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-medium">会员专享功能</span>
                </div>
              </motion.div>

              {/* 入口卡片区域 */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-6xl mx-auto">
                {/* 左侧卡片 - 塔罗年度运势 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex-1 md:w-1/2"
                >
                  <AnnualEntryCard
                    title="塔罗年度运势"
                    subtitle="Tarot Annual Reading"
                    description={`Tap to view your ${currentYear} insights`}
                    icon="🔮"
                    gradient="from-purple-900/40 via-indigo-900/40 to-purple-900/40"
                    onClick={() => handleCardClick('/fortune/annual/tarot')}
                  />
                </motion.div>

                {/* 右侧卡片 - 生肖 × 易经 · 年运 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex-1 md:w-1/2"
                >
                  <AnnualEntryCard
                    title="生肖 × 易经 · 年运"
                    subtitle="Zodiac × I-Ching · Annual Guidance"
                    description={`Tap to view your ${currentYear} insights`}
                    icon="☯"
                    gradient="from-amber-900/40 via-orange-900/40 to-red-900/40"
                    onClick={() => handleCardClick('/fortune/annual/eastern')}
                  />
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// 年度运势入口卡片组件
interface AnnualEntryCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  onClick: () => void;
}

function AnnualEntryCard({ title, subtitle, description, icon, gradient, onClick }: AnnualEntryCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // 添加轻微延迟，让用户看到 loading 状态
    setTimeout(() => {
      onClick();
    }, 300);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative cursor-pointer rounded-3xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(127,19,236,0.4)] h-full flex flex-col ${
        isLoading ? 'opacity-70 pointer-events-none' : ''
      }`}
      onClick={handleClick}
    >
      {/* 背景渐变 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* 神秘光效 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center h-full justify-between min-h-[450px]">
        {/* 图标区域 */}
        <div className="mb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="text-8xl mb-4 filter drop-shadow-[0_0_20px_rgba(127,19,236,0.6)] group-hover:drop-shadow-[0_0_30px_rgba(127,19,236,0.9)] transition-all duration-300"
          >
            {icon}
          </motion.div>
        </div>

        {/* 文字内容 */}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-white/60 text-sm sm:text-base font-medium mb-4 tracking-wide">
            {subtitle}
          </p>
          <p className="text-white/40 text-xs sm:text-sm italic">
            {description}
          </p>
        </div>

        {/* 按钮区域 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <div className={`w-full px-8 py-4 rounded-xl bg-primary/80 backdrop-blur-sm text-white font-bold text-base sm:text-lg transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(127,19,236,0.6)] border border-primary/30 ${
            isLoading ? 'animate-pulse' : ''
          }`}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                加载中...
              </span>
            ) : (
              '开始占卜'
            )}
          </div>
        </motion.div>

        {/* 会员专享标识 */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-sm">
            <svg 
              className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(127,19,236,0.8)]" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-semibold text-primary">会员专享</span>
          </div>
        </div>
      </div>

      {/* 边缘光晕效果 */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-flow" style={{ backgroundSize: '200% 100%' }}></div>
      </div>
    </motion.div>
  );
}

