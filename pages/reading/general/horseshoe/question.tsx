import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_horseshoe_question';
const RESULT_STORAGE_KEY = 'general_horseshoe_draw_result';

export default function HorseshoeQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  // 检查是否已有抽牌结果，如果有则直接跳转到展示页
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 检查是否已有抽牌结果
    const existingResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (existingResult) {
      try {
        const result = JSON.parse(existingResult);
        // 如果结果有效（包含7张牌），直接跳转到展示页
        if (result.cards && result.cards.length === 7) {
          router.replace('/reading/general/horseshoe/reveal');
          return;
        }
      } catch (error) {
        console.error('Failed to parse existing result:', error);
      }
    }
    
    // 从 localStorage 加载已保存的问题
    const saved = localStorage.getItem(QUESTION_STORAGE_KEY);
    if (saved) {
      setQuestion(saved);
      setCharCount(saved.length);
    }
  }, [router]);

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
    router.push('/reading/general/horseshoe/draw');
  };

  const handleBack = () => {
    router.push('/reading/general');
  };

  return (
    <>
      <Head>
        <title>马蹄铁牌阵 - 问题输入 | Mystic Insights</title>
        <meta
          name="description"
          content="输入你的问题，获得更精准的塔罗占卜解读"
        />
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
            <span className="text-sm font-medium">返回</span>
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Mystic Insights
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
                马蹄铁牌阵
              </h1>
              <p className="text-white/70 text-base max-w-xl mx-auto">
                梳理事件的来龙去脉与发展轨迹，找到关键转折点
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
                  你的问题（可选）
                </label>
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder="例如：如果我什么都不改变，事情接下来可能会怎么发展？"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/50">
                    {question.trim() ? '已输入问题' : '输入你的问题后可获得更精准的解读，也可以不输入问题直接开始抽牌'}
                  </span>
                  <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-primary' : 'text-white/50'}`}>
                    {charCount} / {maxChars}
                  </span>
                </div>
              </div>

              {/* 开始抽牌按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartDraw}
                className="w-full px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)] mt-6"
                style={{ backgroundColor: '#7f13ec' }}
              >
                开始抽牌
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
                    关于马蹄铁牌阵
                  </h3>
                </div>
                
                {/* 内容 */}
                <div className="text-white/70 text-sm leading-relaxed space-y-3">
                  <p>
                    马蹄铁牌阵适合用来梳理一件正在发展的事情。<br />
                    它不会只给你一个结论，而是帮助你看清事情是如何一步步走到现在的、当前真正起作用的因素是什么，以及在不做改变的情况下，事情可能会朝哪个方向继续发展。
                  </p>
                  <p>
                    如果你感到局势复杂、线索交织，却又说不清问题出在哪里，<br />
                    马蹄铁牌阵可以帮你把过程拆解开来，让你更清楚自己正站在什么位置。
                  </p>
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
                  占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。
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
