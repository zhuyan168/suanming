import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getTarotQuestionPolicyText, isRestrictedTarotQuestion } from '../../../../lib/tarotQuestionPolicy';

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_celtic_cross_question';
const RESULT_STORAGE_KEY = 'general_celtic_cross_draw_result';

export default function CelticCrossQuestionPage() {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const policyText = getTarotQuestionPolicyText(router.locale);
  const texts = {
    hint: isEn
      ? 'For a more focused reading, enter your question below. You can also start without a question.'
      : '输入问题后可获得更精准的解读，也可以不输入问题直接开始抽牌',
    startBtn: isEn ? 'Start Reading' : '开始抽牌',
    loading: isEn ? 'Loading...' : '加载中...',
    title: isEn ? 'Celtic Cross Spread — Enter Your Question | FateAura' : '凯尔特十字牌阵 - 问题输入 | FateAura',
    metaDesc: isEn ? 'Enter your question and begin your Celtic Cross Spread deep reading.' : '输入你的问题，开启凯尔特十字牌阵的深度解读',
    back: isEn ? 'Back' : '返回',
    spreadName: isEn ? 'Celtic Cross Spread' : '凯尔特十字牌阵',
    subtitle: isEn ? 'Is this situation too important and complex for a quick reading? The Celtic Cross helps you examine the complete picture.' : '这件事对你很重要，简单分析已经不够了？可以用凯尔特十字看完整局面。',
    questionLabel: isEn ? 'Your Question (Optional)' : '你的问题（可选）',
    placeholder: isEn ? 'e.g. What is my position and direction in this relationship? / What obstacles am I facing in my career right now?' : '例如：我在这段关系中的位置与未来走向是什么？ / 我目前的职业发展遇到了哪些阻碍？',
    aboutTitle: isEn ? 'About the Celtic Cross Spread' : '关于凯尔特十字牌阵',
    aboutPara1: isEn ? 'The ten cards begin with the present situation and its main obstacle, then explore past influences, your available strengths, near-term developments, possible responses, the outside environment, and your deeper hopes and fears before bringing everything together into a possible direction.' : '十张牌会从事情的现状和主要阻碍开始，继续分析过去的影响、你拥有的优势、近期发展、可以采取的应对方式、外部环境，以及你内心真正的期待和担忧，最后整理出整个问题可能的发展走向。',
    aboutPara2: isEn ? 'This is the most comprehensive general spread available. It looks beyond the situation itself to include your attitude, resources, concerns, and outside influences, helping you understand how the different parts connect and what actions may be worth considering.' : '这是通用牌阵中最完整的一种。它不只是分析事情本身，还会把你在这件事里的态度、资源、担忧和外部影响一起考虑，帮助你看见问题之间的联系，并得到更完整的行动参考。',
    aboutNote: isEn ? 'A simple question does not need ten cards. Choose the Three-Card Universal Spread for a quick overview, the Hexagram Spread for several interacting factors, or the Horseshoe Spread for how a situation may develop over time. Choose the Celtic Cross when the issue is important, layered, and requires the fullest possible view.' : '如果问题比较简单，不需要使用十张牌。想快速了解情况，可以选择三张牌万能牌阵；想拆解多个影响因素，可以选择六芒星；想沿着时间看后续发展，可以选择马蹄铁；只有当问题重要、复杂，而且你想看完整全局时，才更适合凯尔特十字。',
    disclaimer: isEn ? '✨ Tarot is a tool for reflection, not a fixed prediction. Let this reading support your clarity, but always trust your own judgment and choices.' : '占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。',
  };
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [questionError, setQuestionError] = useState('');
  const maxChars = 200;

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'celtic-cross',
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
        if (result.cards && result.cards.length === 10 && (result.question ?? '') === saved) {
          router.replace('/reading/general/celtic-cross/reveal');
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

    // 保存问题到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTION_STORAGE_KEY, trimmedQuestion);
    }
    // 跳转到抽牌页
    router.push('/reading/general/celtic-cross/draw');
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
                CELTIC CROSS SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                {texts.spreadName}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
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
                    {texts.hint}
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
                <p>{texts.aboutPara1}</p>
                <p>{texts.aboutPara2}</p>
                <p className="mt-4 text-primary/90">
                  {texts.aboutNote}
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
