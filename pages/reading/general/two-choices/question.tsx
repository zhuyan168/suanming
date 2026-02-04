import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_two_choices_question';
const OPTION_A_STORAGE_KEY = 'general_two_choices_option_a';
const OPTION_B_STORAGE_KEY = 'general_two_choices_option_b';
const RESULT_STORAGE_KEY = 'general_two_choices_draw_result';

export default function TwoChoicesQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [errors, setErrors] = useState({ optionA: '', optionB: '', same: '' });
  const maxChars = 200;
  const maxOptionChars = 50;

  // 检查是否已有抽牌结果，如果有则直接跳转到展示页
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 检查是否已有抽牌结果
    const existingResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (existingResult) {
      try {
        const result = JSON.parse(existingResult);
        // 如果结果有效（包含5张牌），直接跳转到展示页
        if (result.cards && result.cards.length === 5) {
          router.replace('/reading/general/two-choices/result');
          return;
        }
      } catch (error) {
        console.error('Failed to parse existing result:', error);
      }
    }
    
    // 从 localStorage 加载已保存的问题和选项
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
    const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY);
    const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY);
    
    if (savedQuestion) setQuestion(savedQuestion);
    if (savedOptionA) setOptionA(savedOptionA);
    if (savedOptionB) setOptionB(savedOptionB);
  }, [router]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setQuestion(value);
      // 清除错误提示
      setErrors({ optionA: '', optionB: '', same: '' });
    }
  };

  const handleOptionAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxOptionChars) {
      setOptionA(value);
      setErrors({ ...errors, optionA: '', same: '' });
    }
  };

  const handleOptionBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxOptionChars) {
      setOptionB(value);
      setErrors({ ...errors, optionB: '', same: '' });
    }
  };

  const handleStartDraw = () => {
    const trimmedQuestion = question.trim();
    const trimmedOptionA = optionA.trim();
    const trimmedOptionB = optionB.trim();
    
    // 校验规则
    const newErrors = { optionA: '', optionB: '', same: '' };
    
    // 如果问题非空，则必须填写 A 和 B
    if (trimmedQuestion) {
      if (!trimmedOptionA) {
        newErrors.optionA = '请输入选项 A';
      }
      if (!trimmedOptionB) {
        newErrors.optionB = '请输入选项 B';
      }
      
      // 检查 A 和 B 是否相同
      if (trimmedOptionA && trimmedOptionB && trimmedOptionA === trimmedOptionB) {
        newErrors.same = '两个选项需要有所区别';
      }
    }
    
    // 如果有错误，显示并阻止继续
    if (newErrors.optionA || newErrors.optionB || newErrors.same) {
      setErrors(newErrors);
      return;
    }
    
    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTION_STORAGE_KEY, trimmedQuestion);
      localStorage.setItem(OPTION_A_STORAGE_KEY, trimmedOptionA);
      localStorage.setItem(OPTION_B_STORAGE_KEY, trimmedOptionB);
    }
    
    // 跳转到抽牌页
    router.push('/reading/general/two-choices/draw');
  };

  const handleBack = () => {
    router.push('/reading/general');
  };

  return (
    <>
      <Head>
        <title>二选一牌阵 - 问题输入 | Mystic Insights</title>
        <meta
          name="description"
          content="在两个选项之间做选择，获得更清晰的指引"
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
                TWO CHOICES SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                二选一牌阵
              </h1>
              <p className="text-white/70 text-lg">
                帮助你在两个选项之间做选择
              </p>
            </motion.div>

            {/* 输入卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 space-y-6"
            >
              {/* 问题输入框 */}
              <div>
                <label className="block text-white/90 font-semibold mb-3">
                  你的问题（可选）
                </label>
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder="例如：我应该选择哪个工作机会？"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/50">
                    {question.trim() ? '已输入问题' : '输入你的问题后可获得更精准的解读，也可以不输入问题直接开始抽牌'}
                  </span>
                  <span className={`text-xs ${question.length > maxChars * 0.9 ? 'text-primary' : 'text-white/50'}`}>
                    {question.length} / {maxChars}
                  </span>
                </div>
              </div>

              {/* 选项 A */}
              <div>
                <label className="block text-white/90 font-semibold mb-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">A</span>
                    选项 A {question.trim() && <span className="text-red-400 text-sm">*</span>}
                  </span>
                </label>
                <input
                  type="text"
                  value={optionA}
                  onChange={handleOptionAChange}
                  placeholder="例如：去大公司工作"
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.optionA ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all`}
                />
                {errors.optionA && (
                  <p className="text-red-400 text-sm mt-2">{errors.optionA}</p>
                )}
                <div className="flex justify-end mt-2">
                  <span className={`text-xs ${optionA.length > maxOptionChars * 0.9 ? 'text-primary' : 'text-white/50'}`}>
                    {optionA.length} / {maxOptionChars}
                  </span>
                </div>
              </div>

              {/* 选项 B */}
              <div>
                <label className="block text-white/90 font-semibold mb-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold">B</span>
                    选项 B {question.trim() && <span className="text-red-400 text-sm">*</span>}
                  </span>
                </label>
                <input
                  type="text"
                  value={optionB}
                  onChange={handleOptionBChange}
                  placeholder="例如：去创业公司工作"
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.optionB ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all`}
                />
                {errors.optionB && (
                  <p className="text-red-400 text-sm mt-2">{errors.optionB}</p>
                )}
                <div className="flex justify-end mt-2">
                  <span className={`text-xs ${optionB.length > maxOptionChars * 0.9 ? 'text-primary' : 'text-white/50'}`}>
                    {optionB.length} / {maxOptionChars}
                  </span>
                </div>
              </div>

              {/* 选项相同错误提示 */}
              {errors.same && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-xl">error</span>
                    <p className="text-red-400 text-sm">{errors.same}</p>
                  </div>
                </div>
              )}

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
