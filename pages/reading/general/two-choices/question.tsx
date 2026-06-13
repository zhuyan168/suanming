import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getTwoChoicesT } from '../../../../lib/twoChoicesI18n';
import { getTarotQuestionPolicyText, isRestrictedTarotQuestion } from '../../../../lib/tarotQuestionPolicy';

const QUESTION_STORAGE_KEY = 'general_two_choices_question';
const OPTION_A_STORAGE_KEY = 'general_two_choices_option_a';
const OPTION_B_STORAGE_KEY = 'general_two_choices_option_b';
const RESULT_STORAGE_KEY = 'general_two_choices_draw_result';

export default function TwoChoicesQuestionPage() {
  const router = useRouter();
  const t = getTwoChoicesT(router.locale);
  const policyText = getTarotQuestionPolicyText(router.locale);

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'two-choices',
    redirectPath: '/reading/general',
  });

  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [errors, setErrors] = useState({ optionA: '', optionB: '', same: '' });
  const maxChars = 200;
  const maxOptionChars = 50;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (accessLoading || !allowed) return;
    
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY) || '';
    const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY) || '';
    const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY) || '';
    const existingResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (existingResult) {
      try {
        const result = JSON.parse(existingResult);
        if (
          result.cards &&
          result.cards.length === 5 &&
          (result.question ?? '') === savedQuestion &&
          (result.optionA ?? '') === savedOptionA &&
          (result.optionB ?? '') === savedOptionB
        ) {
          router.replace('/reading/general/two-choices/result');
          return;
        }
        localStorage.removeItem(RESULT_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to parse existing result:', error);
        localStorage.removeItem(RESULT_STORAGE_KEY);
      }
    }
    
    if (savedQuestion) setQuestion(savedQuestion);
    if (savedOptionA) setOptionA(savedOptionA);
    if (savedOptionB) setOptionB(savedOptionB);
  }, [router, accessLoading, allowed]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setQuestion(value);
      setQuestionError('');
      setErrors({ optionA: '', optionB: '', same: '' });
    }
  };

  const handleOptionAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxOptionChars) {
      setOptionA(value);
      setQuestionError('');
      setErrors({ ...errors, optionA: '', same: '' });
    }
  };

  const handleOptionBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxOptionChars) {
      setOptionB(value);
      setQuestionError('');
      setErrors({ ...errors, optionB: '', same: '' });
    }
  };

  const handleStartDraw = () => {
    const trimmedQuestion = question.trim();
    const trimmedOptionA = optionA.trim();
    const trimmedOptionB = optionB.trim();
    const policyTarget = [trimmedQuestion, trimmedOptionA, trimmedOptionB].filter(Boolean).join(' ');
    if (policyTarget && isRestrictedTarotQuestion(policyTarget)) {
      setQuestionError(policyText.blocked);
      return;
    }
    
    const newErrors = { optionA: '', optionB: '', same: '' };
    
    if (trimmedQuestion) {
      if (!trimmedOptionA) newErrors.optionA = t.question.optionARequired;
      if (!trimmedOptionB) newErrors.optionB = t.question.optionBRequired;
      if (trimmedOptionA && trimmedOptionB && trimmedOptionA === trimmedOptionB) {
        newErrors.same = t.question.sameOptions;
      }
    }
    
    if (newErrors.optionA || newErrors.optionB || newErrors.same) {
      setErrors(newErrors);
      return;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTION_STORAGE_KEY, trimmedQuestion);
      localStorage.setItem(OPTION_A_STORAGE_KEY, trimmedOptionA);
      localStorage.setItem(OPTION_B_STORAGE_KEY, trimmedOptionB);
    }
    
    router.push('/reading/general/two-choices/draw');
  };

  const handleBack = () => {
    router.push('/reading/general');
  };

  if (accessLoading || !allowed) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-white/60">{t.loading}</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t.question.pageTitle}</title>
        <meta name="description" content={t.question.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">{t.back}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              FateAura
            </h2>
          </div>

          <div className="w-16" />
        </header>

        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-3xl">
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
                {t.question.h1}
              </h1>
              <p className="text-white/70 text-lg">
                {t.question.tagline}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 space-y-6"
            >
              {/* Question */}
              <div>
                <label className="block text-white/90 font-semibold mb-3">
                  {t.question.questionLabel}
                </label>
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder={t.question.questionPlaceholder}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={3}
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
                    {question.trim() ? t.question.hintWithQ : t.question.hintNoQ}
                  </span>
                  <span className={`text-xs ${question.length > maxChars * 0.9 ? 'text-primary' : 'text-white/50'}`}>
                    {question.length} / {maxChars}
                  </span>
                </div>
              </div>

              {/* Option A */}
              <div>
                <label className="block text-white/90 font-semibold mb-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">A</span>
                    {t.question.optionALabel} {question.trim() && <span className="text-red-400 text-sm">*</span>}
                  </span>
                </label>
                <input
                  type="text"
                  value={optionA}
                  onChange={handleOptionAChange}
                  placeholder={t.question.optionAPlaceholder}
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

              {/* Option B */}
              <div>
                <label className="block text-white/90 font-semibold mb-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold">B</span>
                    {t.question.optionBLabel} {question.trim() && <span className="text-red-400 text-sm">*</span>}
                  </span>
                </label>
                <input
                  type="text"
                  value={optionB}
                  onChange={handleOptionBChange}
                  placeholder={t.question.optionBPlaceholder}
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

              {errors.same && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-xl">error</span>
                    <p className="text-red-400 text-sm">{errors.same}</p>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartDraw}
                className="w-full px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)] mt-6"
                style={{ backgroundColor: '#7f13ec' }}
              >
                {t.question.startBtn}
              </motion.button>
            </motion.div>

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
                  {t.footer}
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
