import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getTarotQuestionPolicyText, isRestrictedTarotQuestion } from '../../../../lib/tarotQuestionPolicy';

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_horseshoe_question';
const RESULT_STORAGE_KEY = 'general_horseshoe_draw_result';

export default function HorseshoeQuestionPage() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const policyText = getTarotQuestionPolicyText(router.locale);
  const texts = {
    hint: isEn
      ? 'For a more focused reading, enter your question below. You can also start without a question.'
      : '输入你的问题后可获得更精准的解读，也可以不输入问题直接开始抽牌',
    hintWithQ: isEn ? 'Question entered' : '已输入问题',
    startBtn: isEn ? 'Start Reading' : '开始抽牌',
    loading: isEn ? 'Loading...' : '加载中...',
    title: isEn ? 'Horseshoe Spread — Enter Your Question | FateAura' : '马蹄铁牌阵 - 问题输入 | FateAura',
    metaDesc: isEn ? 'Enter your question for a focused Horseshoe Spread reading.' : '输入你的问题，获得更精准的塔罗占卜解读',
    back: isEn ? 'Back' : '返回',
    spreadName: isEn ? 'Horseshoe Spread' : '马蹄铁牌阵',
    subtitle: isEn ? 'Want to understand how a situation reached this point and where it may go next? This spread is designed for that journey.' : '想知道一件事为什么会走到现在，以及接下来可能怎么发展？可以选这个牌阵。',
    questionLabel: isEn ? 'Your Question (Optional)' : '你的问题（可选）',
    placeholder: isEn ? 'e.g. If nothing changes, how might this situation unfold?' : '例如：如果我什么都不改变，事情接下来可能会怎么发展？',
    aboutTitle: isEn ? 'About the Horseshoe Spread' : '关于马蹄铁牌阵',
    aboutPara1: isEn
      ? 'The seven cards follow the development of the situation through past influences, the present state, hidden factors, the main obstacle, potential developments, practical guidance, and a possible outcome.'
      : '七张牌会沿着事情的发展过程，依次分析过去的影响、现在的状态、还没注意到的因素、主要阻碍、潜在变化、行动建议和可能的结果。',
    aboutPara2: isEn
      ? 'Unlike a free three-card reading that gives a quick overview, this spread follows the situation from its background through its possible next stage. It helps reveal unseen influences, the obstacle that matters most, and what action may improve the direction.'
      : '相比免费三张牌，它不只是简单告诉你目前怎么样，而是把一件事从起因、现状一直梳理到后续发展。你会看到真正影响走向的隐藏因素、需要跨过的障碍，以及现在采取什么行动更有帮助。',
    choiceHint: isEn
      ? 'Choose the Hexagram Spread when you want to examine inner thoughts and outside influences from several angles. Choose the Horseshoe Spread when you care more about how the situation has developed and where it may be heading.'
      : '如果你更想分析自己的想法、外部环境等多个因素，六芒星牌阵更合适；如果你更关心事情一路怎么发展、接下来会走向哪里，马蹄铁牌阵更适合。',
    disclaimer: isEn ? '✨ Tarot is a tool for reflection, not a fixed prediction. Let this reading support your clarity, but always trust your own judgment and choices.' : '占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。',
  };
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [questionError, setQuestionError] = useState('');
  const maxChars = 200;

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'horseshoe',
    redirectPath: '/reading/general',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (accessLoading || !allowed) return;
    
    const saved = localStorage.getItem(QUESTION_STORAGE_KEY) || '';
    const existingResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (existingResult) {
      try {
        const result = JSON.parse(existingResult);
        if (result.cards && result.cards.length === 7 && (result.question ?? '') === saved) {
          router.replace('/reading/general/horseshoe/reveal');
          return;
        }
        localStorage.removeItem(RESULT_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to parse existing result:', error);
        localStorage.removeItem(RESULT_STORAGE_KEY);
      }
    }
    
    if (saved) {
      setQuestion(saved);
      setCharCount(saved.length);
    }
  }, [router, accessLoading, allowed]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setQuestion(value);
      setCharCount(value.length);
      setQuestionError('');
    }
  };

  const handleStartDraw = () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion && isRestrictedTarotQuestion(trimmedQuestion)) {
      setQuestionError(policyText.blocked);
      return;
    }

    // 保存问题到 localStorage（即使为空）
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTION_STORAGE_KEY, trimmedQuestion);
    }
    // 跳转到抽牌页
    router.push('/reading/general/horseshoe/draw');
  };

  const handleBack = () => {
    router.push('/reading/general');
  };

  if (accessLoading || !allowed) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-white/60">{texts.loading}</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">{texts.back}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              FateAura
            </h2>
          </div>

          <div className="w-16" /> {/* 占位保持居中 */}
        </header>

        {/* 主内容 */}
        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-3xl">
            {/* 标题区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                HORSESHOE SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                {texts.spreadName}
              </h1>
              <p className="text-white/70 text-base max-w-xl mx-auto">
                {texts.subtitle}
              </p>
            </motion.div>

            {/* 输入卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8"
            >
              {/* 输入框 */}
              <div className="mb-4">
                <label className="block text-white/90 font-semibold mb-3">
                  {texts.questionLabel}
                </label>
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder={texts.placeholder}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={4}
                />
                <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
                  {policyText.notice}
                </p>
                {questionError && (
                  <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {questionError}
                  </p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/50">
                    {question.trim() ? texts.hintWithQ : texts.hint}
                  </span>
                  <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-primary' : 'text-white/50'}`}>
                    {charCount} / {maxChars}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartDraw}
                className="w-full px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)] mt-6"
                style={{ backgroundColor: '#7f13ec' }}
              >
                {texts.startBtn}
              </motion.button>
            </motion.div>

            {/* 牌阵简介 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                {/* 标题 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">
                    info
                  </span>
                  <h3 className="text-white font-semibold text-lg">
                    {texts.aboutTitle}
                  </h3>
                </div>
                
                {/* 内容 */}
                <div className="text-white/70 text-sm leading-relaxed space-y-3">
                  <p style={{ whiteSpace: 'pre-line' }}>{texts.aboutPara1}</p>
                  <p style={{ whiteSpace: 'pre-line' }}>{texts.aboutPara2}</p>
                  <p className="text-white/55">{texts.choiceHint}</p>
                </div>
              </div>
            </motion.div>

            {/* 底部提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex justify-center"
            >
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">
                  auto_awesome
                </span>
                <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                  {texts.disclaimer}
                </p>
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1s' }}>
                  auto_awesome
                </span>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
