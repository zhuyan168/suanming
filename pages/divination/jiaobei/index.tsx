import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSpreadAccess } from '../../../hooks/useSpreadAccess';

type ResultType = 'sheng' | 'yin' | 'xiao';

const generateRequestId = (): string => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `jiaobei_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export default function JiaoBeiPage() {
  const router = useRouter();
  const isEn = router.locale !== 'zh';
  const text = isEn
    ? {
        loading: 'Loading...',
        pageTitle: 'Jiaobei Oracle - FateAura',
        backHome: 'Back Home',
        badge: 'Jiaobei Oracle',
        heading: 'Have One Specific Matter and Want to Ask Whether It Is Suitable?',
        intro1:
          'Jiaobei is best for confirming one clear matter, such as whether now is a suitable time to act or whether a specific decision is appropriate.',
        intro2:
          'Ask one matter at a time and make the question specific before casting the two moon blocks.',
        shengTitle: 'Sheng Jiao',
        shengDesc: 'One flat and one round side: agreement, permission, or a suitable sign.',
        xiaoTitle: 'Xiao Jiao',
        xiaoDesc: 'Two round sides: the question may be unclear or the timing is not yet settled. Refine it before asking again.',
        yinTitle: 'Yin Jiao',
        yinDesc: 'Two flat sides: disagreement, not recommended, or not suitable at this time.',
        questionLabel: 'Your question (optional)',
        questionPlaceholder:
          'For example: Is it suitable for me to accept this offer now? Is it appropriate to contact them this week?',
        questionHint: 'Ask one specific matter that can be answered directly',
        usageNote: 'Not suitable for open-ended questions such as “What will my future be like?” or for combining two questions at once. For health, legal, or financial decisions, rely on real information and qualified professional advice.',
        processing: 'The oracle is responding...',
        casting: 'Casting...',
        start: 'Cast Jiaobei',
      }
    : {
        loading: '加载中...',
        pageTitle: '掷筊占卜 - FateAura',
        backHome: '返回首页',
        badge: '掷筊占卜',
        heading: '心里有一件具体的事，想问问是否合适？',
        intro1: '掷筊适合确认一件明确的事情，例如现在是否适合行动，或某个具体决定是否合适。',
        intro2: '请一次只问一件事，并在掷出两块筊杯前，把问题想得具体、清楚一些。',
        shengTitle: '圣筊',
        shengDesc: '一正一反，表示同意、可以或事情较为合适',
        xiaoTitle: '笑筊',
        xiaoDesc: '两反，表示问题还不够清楚，或目前时机未明；可以整理问题后再问',
        yinTitle: '阴筊',
        yinDesc: '两正，表示不同意、不建议，或目前不适合进行',
        questionLabel: '你的问题（可选）',
        questionPlaceholder: '例如：我现在适合接受这个工作机会吗？这周主动联系 TA 合适吗？',
        questionHint: '请一次只问一件可以直接回答的具体事情',
        usageNote: '不适合询问“我的未来会怎样”这类开放式问题，也不要把两个问题放在一起。涉及健康、法律或财务等重要决定时，请以现实信息和专业意见为准。',
        processing: '神明正在回应...',
        casting: '掷筊中...',
        start: '开始掷筊',
      };
  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'divination-jiaobei',
    redirectPath: '/',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [question, setQuestion] = useState('');

  useEffect(() => {
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
      const params = new URLSearchParams({ type: result, rid: generateRequestId() });
      if (question.trim()) {
        params.append('question', question.trim());
      }
      router.push(`/divination/jiaobei/result?${params.toString()}`);
    }, 1500);
  };

  if (accessLoading || !allowed) {
    return (
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#191022' }}>
          <div className="text-white/60">{text.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{text.pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="text-sm font-medium">{text.backHome}</span>
              </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
              <div className="mx-auto max-w-4xl">
                {/* 介绍文字 */}
                <div className="mb-12 text-center">
                  <div className="inline-block mb-4 rounded-full bg-primary/10 border border-primary/30 px-4 py-1.5">
                    <span className="text-primary text-sm font-semibold uppercase tracking-wider">{text.badge}</span>
                  </div>
                  <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em] mb-6">
                    {text.heading}
                  </h1>
                  <div className="max-w-2xl mx-auto space-y-4 text-white/70 text-base leading-relaxed">
                    <p>
                      {text.intro1}
                    </p>
                    <p>
                      {text.intro2}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-2xl mb-2">🌕🌑</div>
                        <div className="font-semibold text-white mb-1">{text.shengTitle}</div>
                        <div className="text-white/60">{text.shengDesc}</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-2xl mb-2">🌑🌑</div>
                        <div className="font-semibold text-white mb-1">{text.xiaoTitle}</div>
                        <div className="text-white/60">{text.xiaoDesc}</div>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-2xl mb-2">🌕🌕</div>
                        <div className="font-semibold text-white mb-1">{text.yinTitle}</div>
                        <div className="text-white/60">{text.yinDesc}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 问题输入区域 */}
                {!isProcessing && (
                  <div className="mb-12 max-w-2xl mx-auto">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                      <label className="block text-sm font-semibold text-white/80 mb-3" htmlFor="jiaobei-question">
                        {text.questionLabel}
                      </label>
                      <textarea
                        id="jiaobei-question"
                        className="w-full rounded-xl border border-white/10 bg-black/30 p-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        rows={3}
                        maxLength={100}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={text.questionPlaceholder}
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                        <span>{text.questionHint}</span>
                        <span>{question.length}/100</span>
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-white/45">{text.usageNote}</p>
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
                        {text.processing}
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
                    <span>{isProcessing ? text.casting : text.start}</span>
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

