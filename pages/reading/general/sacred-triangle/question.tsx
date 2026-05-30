import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getSacredTriangleT } from '../../../../lib/sacredTriangleI18n';

const QUESTION_STORAGE_KEY = 'general_sacred_triangle_question';
const RESULT_STORAGE_KEY = 'general_sacred_triangle_result';

export default function SacredTriangleQuestionPage() {
  const router = useRouter();
  const t = getSacredTriangleT(router.locale);

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'sacred-triangle',
    redirectPath: '/reading/general',
  });

  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (accessLoading || !allowed) return;
    
    const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.cards && parsed.cards.length === 3) {
          router.replace('/reading/general/sacred-triangle/result');
          return;
        }
      } catch (e) {
        localStorage.removeItem(RESULT_STORAGE_KEY);
      }
    }
    
    const saved = localStorage.getItem(QUESTION_STORAGE_KEY);
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTION_STORAGE_KEY, question.trim());
    }
    router.push('/reading/general/sacred-triangle/draw');
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
                SACRED TRIANGLE SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                {t.question.h1}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8"
            >
              <div className="mb-4">
                <label className="block text-white/90 font-semibold mb-3">
                  {t.question.label}
                </label>
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder={t.question.placeholder}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-white/50">
                    {question.trim() ? t.question.hintWithQ : t.question.hintNoQ}
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
