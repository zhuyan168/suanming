import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

const tarotCards = [
  {
    id: 0,
    name: '0. The Fool',
    image: '/assets/tatorcard/major_arcana_fool.png',
    upright: '新的开始、信任直觉、勇敢冒险',
    reversed: '冲动行事、犹豫不决、方向不明',
    keywords: ['纯真', '自由', '机会'],
  },
  {
    id: 1,
    name: 'I. The Magician',
    image: '/assets/tatorcard/major_arcana_magician.png',
    upright: '资源整合、贯彻执行、影响力',
    reversed: '分散注意、欺骗、缺乏计划',
    keywords: ['行动', '意志', '显化'],
  },
  {
    id: 2,
    name: 'II. The High Priestess',
    image: '/assets/tatorcard/major_arcana_priestess.png',
    upright: '内在智慧、直觉洞察、保持沉静',
    reversed: '忽略直觉、情绪混乱、资讯不明',
    keywords: ['直觉', '秘密', '平衡'],
  },
  {
    id: 3,
    name: 'VI. The Lovers',
    image: '/assets/tatorcard/major_arcana_lovers.png',
    upright: '真诚连接、重要抉择、价值一致',
    reversed: '矛盾、分歧、失去平衡',
    keywords: ['关系', '信任', '选择'],
  },
  {
    id: 4,
    name: 'XVII. The Star',
    image: '/assets/tatorcard/major_arcana_star.png',
    upright: '希望重燃、疗愈、灵感源泉',
    reversed: '信心不足、能量枯竭、迟滞',
    keywords: ['希望', '指引', '灵性'],
  },
  {
    id: 5,
    name: 'XIX. The Sun',
    image: '/assets/tatorcard/major_arcana_sun.png',
    upright: '乐观、成功、清晰洞见',
    reversed: '延迟、自满、暂时挫折',
    keywords: ['活力', '喜悦', '成长'],
  },
  {
    id: 6,
    name: 'XVIII. The Moon',
    image: '/assets/tatorcard/major_arcana_moon.png',
    upright: '潜意识、梦境、面对不安',
    reversed: '困惑解除、真相浮现、逐渐明朗',
    keywords: ['直觉', '感受', '阴影'],
  },
  {
    id: 7,
    name: 'XVI. The Tower',
    image: '/assets/tatorcard/major_arcana_tower.png',
    upright: '突发变化、觉醒、旧结构崩塌',
    reversed: '抗拒改变、延迟崩解、局部冲击',
    keywords: ['变革', '释放', '突破'],
  },
];

const uprightTemplates = [
  (card, question) => `关于“${question}”，${card.name} 正位提醒你：${card.upright}。保持开阔的心，主动迎接机会。`,
  (card, question) => `你心中的问题“${question}”得到这张牌的回应。正位的 ${card.name} 鼓励你踏实运用资源，让愿望逐步显化。`,
  (card, question) => `${card.name} 在正位出现，象征你的直觉与理性保持一致。相信你对“${question}”的判断，并勇敢实践。`,
  (card, question) => `正位的 ${card.name} 表示：${card.upright}。在处理“${question}”时，不妨给自己更多信任与承诺。`,
];

const reversedTemplates = [
  (card, question) => `面对“${question}”，${card.name} 逆位提示你留意：${card.reversed}。请放慢脚步，先厘清内心真正的需求。`,
  (card, question) => `当 ${card.name} 以逆位回应“${question}”时，意味着目前能量不稳定，需要你重新调整节奏与策略。`,
  (card, question) => `逆位的 ${card.name} 暗示：${card.reversed}。处理“${question}”时，可以先整理情绪，等待更明确的讯号。`,
  (card, question) => `关于“${question}”，这张牌的逆位提醒你先修复根基，再作决定，这样才能避免重复旧的模式。`,
];

const cardBackWords = ['专注', '能量', '命运', '直觉', '旅程', '灵感'];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const generateInterpretation = (card, orientation, question) => {
  const normalizedQuestion = question.trim();
  const displayQuestion = normalizedQuestion.length > 0 ? normalizedQuestion : '这个主题';
  const templates = orientation === 'upright' ? uprightTemplates : reversedTemplates;
  const template = pickRandom(templates);
  return template(card, displayQuestion);
};

const FeatureToast = ({ visible, title, message, onClose }) => {
  if (!title && !message) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] w-72 rounded-2xl border border-white/10 bg-background-dark/90 p-4 text-white shadow-glow backdrop-blur transition-all duration-300 ${visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-2xl text-primary">auto_fix_high</span>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-xs text-white/70 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:text-white"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};

const TarotReadingModal = ({ isOpen, onRequestClose }) => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [drawResult, setDrawResult] = useState(null);
  const closeTimerRef = useRef(null);
  const questionInputRef = useRef(null);
  const wasOpenRef = useRef(false);
  const cardBackIndices = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = setTimeout(() => {
        setQuestion('');
        setError(null);
        setDrawResult(null);
      }, 320);
      return () => {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }
      };
    }

    if (!wasOpenRef.current) {
      setQuestion('');
      setError(null);
      setDrawResult(null);
    }
    wasOpenRef.current = true;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    // 只在未抽牌时才聚焦输入框
    if (!drawResult && questionInputRef.current) {
      questionInputRef.current.focus();
    }
    return undefined;
  }, [isOpen, drawResult]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }
    if (!isOpen) {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleClose = () => {
    onRequestClose();
  };

  const handleDrawCard = () => {
    if (!question.trim()) {
      setError('请先输入你的问题，再开始抽牌。');
      return;
    }

    setError(null);
    const card = pickRandom(tarotCards);
    const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';
    const interpretation = generateInterpretation(card, orientation, question);

    setDrawResult({
      card,
      orientation,
      interpretation,
    });
  };

  const handleDrawAgain = () => {
    setError(null);
    setDrawResult(null);
    // 移除任何元素的焦点，防止光标闪烁
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  };

  const isDrawDisabled = question.trim().length === 0;

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-background-dark/95 via-background-dark/90 to-black/90 backdrop-blur-md"
        onClick={handleClose}
      ></div>
      
      {/* 未抽牌时：垂直水平居中显示输入框和按钮 */}
      {!drawResult ? (
        <section
          className={`relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 text-white shadow-glow transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        >
          <button
            aria-label="关闭塔罗占卜面板"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition hover:border-white/20 hover:text-white"
            type="button"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <header className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-2">塔罗占卜</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight">静心提问，抽取你的指引</h2>
            <p className="text-sm text-white/70 mt-1">
              请在心中专注你的问题，深呼吸三次后开始抽牌。相信宇宙会为你带来最适合的讯息。
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3" htmlFor="tarot-question">
                你的问题
              </label>
              <textarea
                id="tarot-question"
                ref={questionInputRef}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={4}
                maxLength={160}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="例如：我应该接受新的工作机会吗？"
              ></textarea>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>最多 160 字</span>
                <span>{question.length}/160</span>
              </div>
              {error ? <p className="mt-2 text-sm text-orange-300">{error}</p> : null}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleDrawCard}
                disabled={isDrawDisabled}
                className={`flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition ${isDrawDisabled ? 'cursor-not-allowed bg-white/10 text-white/30' : 'bg-primary text-white shadow-glow hover:bg-primary/90 hover:scale-105'}`}
              >
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                抽牌
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* 抽牌后：显示结果 */
        <section
          className={`relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 text-white shadow-glow transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="关闭塔罗占卜面板"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition hover:border-white/20 hover:text-white z-20"
            type="button"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
            <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr] w-full">
              <div className="flex flex-col gap-4">
                {/* 卡片图片区域 */}
                <div className="flex flex-col items-center gap-4">
                  <div className="perspective w-full flex justify-center">
                    <div className="animate-flip-in h-72 w-48 overflow-hidden rounded-3xl border border-white/15 bg-black/20 shadow-glow">
                      <img
                        src={drawResult.card.image}
                        alt={drawResult.card.name}
                        className={`h-full w-full object-cover transition-transform duration-500 ${drawResult.orientation === 'reversed' ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50">若出现逆位，牌面将倒置显示。</p>
                </div>
              </div>
              {/* 右侧内容区域 */}
              <div className="flex flex-col gap-5 justify-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">{drawResult.card.name}</h3>
                  <p className="mt-1 text-sm text-white/60">
                    {drawResult.orientation === 'upright' ? '正位' : '逆位'} ·
                    {drawResult.orientation === 'upright' ? drawResult.card.upright : drawResult.card.reversed}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {drawResult.card.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-base leading-relaxed text-white/80">
                  {drawResult.interpretation}
                </div>
                {/* 按钮区域：稍微向左偏移，视觉上更居中 */}
                <div className="flex justify-center mt-6 -ml-3">
                  <button
                    type="button"
                    onClick={handleDrawAgain}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    再问一个
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default function Home() {
  const [isTarotOpen, setIsTarotOpen] = useState(false);
  const [toast, setToast] = useState({ title: '', message: '' });
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimerRef = useRef(null);
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);

  // 在客户端动态加载 Tailwind CSS CDN 和配置
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 确保 HTML 根元素有 dark 类
    document.documentElement.classList.add('dark');

    // 加载 Tailwind 配置函数
    const loadTailwindConfig = () => {
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
        setIsTailwindLoaded(true);
        return true;
      }
      return false;
    };

    // 检查 Tailwind 是否已经加载
    if (window.tailwind) {
      if (loadTailwindConfig()) {
        return;
      }
    }

    // 检查是否已经在加载中
    if (document.querySelector('script[src*="tailwindcss"]')) {
      // 如果脚本已存在，等待它加载完成
      const checkTailwind = setInterval(() => {
        if (window.tailwind) {
          loadTailwindConfig();
          clearInterval(checkTailwind);
        }
      }, 50);
      return () => clearInterval(checkTailwind);
    }

    // 加载 Tailwind CDN
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    tailwindScript.async = true;
    tailwindScript.onload = () => {
      // 多次尝试加载配置，因为 Tailwind 可能需要一点时间初始化
      let attempts = 0;
      const tryLoadConfig = setInterval(() => {
        attempts++;
        if (loadTailwindConfig() || attempts > 20) {
          clearInterval(tryLoadConfig);
        }
      }, 100);
    };
    document.head.appendChild(tailwindScript);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  }, []);

  const showToast = (title, message) => {
    setToast({ title, message });
    setIsToastVisible(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 3600);
  };

  const handleCloseToast = () => {
    setIsToastVisible(false);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  };

  const handleTarotTrigger = () => {
    setIsTarotOpen(true);
  };

  const handleTarotClose = () => {
    setIsTarotOpen(false);
  };

  const handleFeatureComingSoon = (title) => {
    showToast(title, '该功能正在开发中，敬请期待。');
  };

  const handleFortuneMessage = (title) => {
    showToast(title, '我们会根据你的反馈优先开放此项占卜服务。');
  };

  return (
    <>
      <Head>
        <title>Mystic Insights - Fortune Telling &amp; Horoscope</title>
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
              box-shadow: 0 0 5px 0px rgba(127, 19, 236, 0.4), 0 0 2px 0px rgba(127, 19, 236, 0.2), 0 0 0 1px rgba(127, 19, 236, 0.2);
            }
            50% {
              box-shadow: 0 0 10px 2px rgba(127, 19, 236, 0.6), 0 0 4px 1px rgba(127, 19, 236, 0.4), 0 0 0 1px rgba(127, 19, 236, 0.5);
            }
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease forwards;
          }
          @keyframes flip-in {
            from {
              transform: rotateY(-180deg);
              opacity: 0;
            }
            to {
              transform: rotateY(0deg);
              opacity: 1;
            }
          }
          .animate-flip-in {
            animation: flip-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .perspective {
            perspective: 1200px;
          }
          /* 确保基础样式在 Tailwind 加载前也能显示 */
          body {
            margin: 0;
            font-family: 'Spline Sans', sans-serif;
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
        <div className="font-display bg-background-light dark:bg-background-dark">
          <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
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
                <div className="hidden md:flex flex-1 justify-end gap-8">
                  <div className="flex items-center gap-9">
                    <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                      Home
                    </a>
                    <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                      My Readings
                    </a>
                    <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                      About
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {/* 原按钮缺少交互反馈，导致用户点击无响应，这里统一提示路线计划 */}
                    <button
                      type="button"
                      onClick={() => handleFeatureComingSoon('Sign Up 功能开发中')}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                    >
                      <span className="truncate">Sign Up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeatureComingSoon('Login 功能开发中')}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors"
                    >
                      <span className="truncate">Login</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureComingSoon('移动端菜单开发中')}
                  className="md:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
              </header>
              <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
                <div className="mx-auto max-w-6xl">
                  <section className="mb-16">
                    <div
                      className="relative overflow-hidden flex min-h-[380px] flex-col gap-6 rounded-xl bg-cover bg-center bg-no-repeat items-center justify-center p-4 text-center"
                      data-alt="A mystical, abstract background with swirling purple and blue cosmic nebulae and faint star patterns."
                    >
                      <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfEGBzoDokXgRS6Ba5Wj5HBFKsltQO-dubX9obltWaFOskDIiYL50bM9mCNa1PvetW_ExXEUA7n6J3-cbJWM82pH2jWwEoEjz3gIbHr9pIf55jVLkszkslsFu-Qg_pac6MBGsLT-rLuG2kYFb3md79b-JSYgwQ9lVfZKrtzCU7hq5hc6iD8WrXQYAHyggiWU4M2ZFmkZNocAAaxwXdnY3i9ZSon_4A1RpdUEqvwVEjTQ4D-SDbmBkjEYFVBE5E3aHfz8TvdtQ12d8')] bg-cover bg-center animate-flow [background-size:200%_200%] opacity-80"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(25,16,34,0.4)] to-[rgba(25,16,34,0.7)]"></div>
                      <div className="relative z-10 flex flex-col gap-6 items-center">
                        <div className="flex flex-col gap-2">
                          <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                            探索未知，预见未来
                          </h1>
                          <h2 className="text-white/80 text-base sm:text-lg font-normal leading-normal max-w-2xl mx-auto">
                            Discover profound personal insights and navigate your path with our ancient divination tools.
                          </h2>
                        </div>
                        {/* 原 HTML 通过 data-tarot-trigger + 外部脚本触发弹窗，Next.js 中脚本未运行导致无法开启，这里改为 React 事件 */}
                        <button
                          type="button"
                          onClick={handleTarotTrigger}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-transform hover:scale-105"
                        >
                          <span className="truncate">Start Your Reading</span>
                        </button>
                      </div>
                    </div>
                  </section>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 @container">
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/10 animate-pulse-glow">
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 50% 50%, rgba(127, 19, 236, 0.05), transparent 60%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwx12TiM3tWLpLP8-D2Ly2wUsaLpZpYhUG1cpevrdbr1g6i2tFtTJnavj73O-mPOSrbwwm-Pxd7AUmNue1f-EXNzsra4ucXk9nrANoz1lI7JZMPN2goLWopj8QbrztB12_vKeJkO4KAqPS_VwR3J_Xm4WiwOJi_8EtCjQyrxfktmtM_PUK1zf5JqBNFgs_cqciCoDnYIcWw_djxqaIssq9KG0u9i-4vKyNpA0YtLiMnWXQt1jYGV5rdi1wS2dsFi5b_3CdrIzDtd8')",
                          backgroundSize: '50px 50px, auto',
                        }}
                      ></div>
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-sm font-medium">是否占卜</p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Fortune Telling</p>
                          <p className="text-white/60 text-base font-normal leading-normal">
                            Choose your preferred method of divination to gain clarity and guidance on your path.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 mt-auto">
                          {/* 同样原因，绑定 onClick 以触发 React 弹窗 */}
                          <button
                            type="button"
                            onClick={handleTarotTrigger}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">塔罗占卜 (Tarot)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeatureComingSoon('掷筊占卜 即将上线')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">掷筊占卜 (Moon Blocks)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/10 animate-pulse-glow">
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 50% 50%, rgba(127, 19, 236, 0.05), transparent 60%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwx12TiM3tWLpLP8-D2Ly2wUsaLpZpYhUG1cpevrdbr1g6i2tFtTJnavj73O-mPOSrbwwm-Pxd7AUmNue1f-EXNzsra4ucXk9nrANoz1lI7JZMPN2goLWopj8QbrztB12_vKeJkO4KAqPS_VwR3J_Xm4WiwOJi_8EtCjQyrxfktmtM_PUK1zf5JqBNFgs_cqciCoDnYIcWw_djxqaIssq9KG0u9i-4vKyNpA0YtLiMnWXQt1jYGV5rdi1wS2dsFi5b_3CdrIzDtd8')",
                          backgroundSize: '50px 50px, auto',
                        }}
                      ></div>
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-sm font-medium">运势测算</p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Fortune Calculation</p>
                          <p className="text-white/60 text-base font-normal leading-normal">
                            Uncover astrological insights for your day, month, season, or the entire year ahead.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('每日运势 请求已记录')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">每日运势</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('月度运势 请求已记录')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">月度运势</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('四季牌阵 请求已记录')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">四季牌阵</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('年度运势 请求已记录')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">年度运势</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/10 animate-pulse-glow">
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 50% 50%, rgba(127, 19, 236, 0.05), transparent 60%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwx12TiM3tWLpLP8-D2Ly2wUsaLpZpYhUG1cpevrdbr1g6i2tFtTJnavj73O-mPOSrbwwm-Pxd7AUmNue1f-EXNzsra4ucXk9nrANoz1lI7JZMPN2goLWopj8QbrztB12_vKeJkO4KAqPS_VwR3J_Xm4WiwOJi_8EtCjQyrxfktmtM_PUK1zf5JqBNFgs_cqciCoDnYIcWw_djxqaIssq9KG0u9i-4vKyNpA0YtLiMnWXQt1jYGV5rdi1wS2dsFi5b_3CdrIzDtd8')",
                          backgroundSize: '50px 50px, auto',
                        }}
                      ></div>
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-sm font-medium">主题占卜</p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Themed Readings</p>
                          <p className="text-white/60 text-base font-normal leading-normal">
                            Seek answers and guidance for the most important areas of your life.
                          </p>
                        </div>
                        <div className="flex flex-col gap-4 mt-auto">
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('爱情占卜 请求已记录')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">favorite</span>
                            <span className="truncate">爱情 (Love)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('事业＆学业占卜 请求已记录')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">school</span>
                            <span className="truncate">事业&amp;学业 (Career &amp; Study)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('财富占卜 请求已记录')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">paid</span>
                            <span className="truncate">财富 (Wealth)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <footer className="border-t border-solid border-white/10 mt-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-8 md:px-16 lg:px-24 py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-white/70">
                      <div className="size-5 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-sm">© 2024 Mystic Insights. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                        Terms of Service
                      </a>
                      <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                        Privacy Policy
                      </a>
                      <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                        Contact Us
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
          {/* 原 HTML 依赖外挂脚本通过 #tarot-reading-root 注入组件，这里直接渲染 React 组件以恢复功能 */}
          <TarotReadingModal isOpen={isTarotOpen} onRequestClose={handleTarotClose} />
        </div>
      </div>
      <FeatureToast visible={isToastVisible} title={toast.title} message={toast.message} onClose={handleCloseToast} />
    </>
  );
}
