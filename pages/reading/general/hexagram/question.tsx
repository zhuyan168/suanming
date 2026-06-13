import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_hexagram_question';
const RESULT_STORAGE_KEY = 'general_hexagram_draw_result';

export default function HexagramQuestionPage() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const texts = {
    hint: isEn
      ? 'For a more focused reading, enter your question below. You can also start without a question.'
      : '输入问题后可获得更精准的解读，也可以不输入问题直接开始抽牌',
    hintWithQ: isEn ? 'Question entered' : '已输入问题',
    startBtn: isEn ? 'Start Reading' : '开始抽牌',
    loading: isEn ? 'Loading...' : '加载中...',
    title: isEn ? 'Hexagram Spread — Enter Your Question | FateAura' : '六芒星牌阵 - 问题输入 | FateAura',
    metaDesc: isEn ? 'Enter your question and let the Hexagram Spread map the forces at play.' : '输入你的问题，让六芒星牌阵帮你梳理局势与方向',
    back: isEn ? 'Back' : '返回',
    spreadName: isEn ? 'Hexagram Spread' : '六芒星牌阵',
    subtitle: isEn ? 'Enter your question (optional) and let the spread help you see the full picture.' : '可输入你的问题（可选），让牌阵帮你梳理局势与方向',
    questionLabel: isEn ? 'Your Question (Optional)' : '你的问题（可选）',
    placeholder: isEn ? 'e.g. How is this situation likely to develop? / How should I approach this challenge?' : '例如：目前这个项目的发展局面如何？ / 我该如何应对当前的复杂状况？',
    aboutTitle: isEn ? 'About the Hexagram Spread' : '关于六芒星牌阵',
    aboutDesc: isEn ? 'The Hexagram Spread uses 6 outer cards and 1 central Guide Card to explore a situation from multiple angles.' : '六芒星牌阵由外围6张牌和中心1张指引牌组成，能够从多个维度全面解读复杂局面。',
    pos1: isEn ? 'Past: root of the issue' : '过去：问题的根源',
    pos2: isEn ? 'Present: the true state of things' : '现在：问题的真实状态',
    pos3: isEn ? 'Future: how things may develop' : '未来：问题的发展趋势',
    pos4: isEn ? 'Inner: emotional & mental influence' : '内在：情绪与心态的影响',
    pos5: isEn ? 'Outer: environmental & social influence' : '外在：环境与他人的影响',
    pos6: isEn ? 'Action: your approach & response' : '行动：你对问题的态度与对策',
    guideCardNote: isEn ? '✨ The central Guide Card drawn last offers an overall summary and reminder for the whole spread.' : '✨ 最后抽取的中心指引牌，将为整体局势提供总结与提醒',
    disclaimer: isEn ? '✨ Tarot is a tool for reflection, not a fixed prediction. Let this reading support your clarity, but always trust your own judgment and choices.' : '占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。',
  };
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'hexagram',
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
          router.replace('/reading/general/hexagram/reveal');
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
    }
  };

  const handleStartDraw = () => {
    // 保存问题到 localStorage（即使为空）
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTION_STORAGE_KEY, question.trim());
    }
    // 跳转到抽牌页
    router.push('/reading/general/hexagram/draw');
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
                HEXAGRAM SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                {texts.spreadName}
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
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

            {/* 牌阵说明 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                {texts.aboutTitle}
              </h3>
              <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                <p>{texts.aboutDesc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{texts.pos1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{texts.pos2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{texts.pos3}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{texts.pos4}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{texts.pos5}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{texts.pos6}</span>
                  </div>
                </div>
                <p className="mt-4 text-primary/90">
                  {texts.guideCardNote}
                </p>
              </div>
            </motion.div>

            {/* 底部提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
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
