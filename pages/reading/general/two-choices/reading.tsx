import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import TwoChoicesSlots from '../../../../components/fortune/TwoChoicesSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import { useHistoryBack } from '../../../../hooks/useHistoryBack';
import { getAuthHeaders } from '../../../../lib/apiHeaders';
import { getTwoChoicesT } from '../../../../lib/twoChoicesI18n';
import { getLocalizedKeywords } from '../../../../lib/tarotCardI18n';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface TwoChoicesResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
  optionA?: string;
  optionB?: string;
  reading?: ReadingResult;
}

interface CardReading {
  position: number;
  position_name: string;
  card_name_cn: string;
  orientation: string;
  keywords: string[];
  interpretation: string;
}

interface ReadingResult {
  mode: 'general' | 'question';
  overall_reading: string;
  cards: CardReading[];
  choice_comparison: {
    option_a_analysis: string;
    option_b_analysis: string;
    decision_guidance: string;
  };
  rational_reminder: string;
}

type ErrorType = 'incomplete' | 'load' | 'generate' | 'default' | null;

const QUESTION_STORAGE_KEY = 'general_two_choices_question';
const OPTION_A_STORAGE_KEY = 'general_two_choices_option_a';
const OPTION_B_STORAGE_KEY = 'general_two_choices_option_b';
const RESULT_STORAGE_KEY = 'general_two_choices_draw_result';

const getChineseCardName = (englishName: string): string => {
  const nameMap: { [key: string]: string } = {
    '0. The Fool': '愚者', 'I. The Magician': '魔术师', 'II. The High Priestess': '女祭司',
    'III. The Empress': '皇后', 'IV. The Emperor': '皇帝', 'V. The Hierophant': '教皇',
    'VI. The Lovers': '恋人', 'VII. The Chariot': '战车', 'VIII. Strength': '力量',
    'IX. The Hermit': '隐者', 'X. Wheel of Fortune': '命运之轮', 'XI. Justice': '正义',
    'XII. The Hanged Man': '倒吊人', 'XIII. Death': '死神', 'XIV. Temperance': '节制',
    'XV. The Devil': '恶魔', 'XVI. The Tower': '塔', 'XVII. The Star': '星星',
    'XVIII. The Moon': '月亮', 'XIX. The Sun': '太阳', 'XX. Judgement': '审判',
    'XXI. The World': '世界',
    'Ace of Cups': '圣杯王牌', 'Two of Cups': '圣杯二', 'Three of Cups': '圣杯三',
    'Four of Cups': '圣杯四', 'Five of Cups': '圣杯五', 'Six of Cups': '圣杯六',
    'Seven of Cups': '圣杯七', 'Eight of Cups': '圣杯八', 'Nine of Cups': '圣杯九',
    'Ten of Cups': '圣杯十', 'Page of Cups': '圣杯侍者', 'Knight of Cups': '圣杯骑士',
    'Queen of Cups': '圣杯王后', 'King of Cups': '圣杯国王',
    'Ace of Pentacles': '星币王牌', 'Two of Pentacles': '星币二', 'Three of Pentacles': '星币三',
    'Four of Pentacles': '星币四', 'Five of Pentacles': '星币五', 'Six of Pentacles': '星币六',
    'Seven of Pentacles': '星币七', 'Eight of Pentacles': '星币八', 'Nine of Pentacles': '星币九',
    'Ten of Pentacles': '星币十', 'Page of Pentacles': '星币侍者', 'Knight of Pentacles': '星币骑士',
    'Queen of Pentacles': '星币王后', 'King of Pentacles': '星币国王',
    'Ace of Swords': '宝剑王牌', 'Two of Swords': '宝剑二', 'Three of Swords': '宝剑三',
    'Four of Swords': '宝剑四', 'Five of Swords': '宝剑五', 'Six of Swords': '宝剑六',
    'Seven of Swords': '宝剑七', 'Eight of Swords': '宝剑八', 'Nine of Swords': '宝剑九',
    'Ten of Swords': '宝剑十', 'Page of Swords': '宝剑侍者', 'Knight of Swords': '宝剑骑士',
    'Queen of Swords': '宝剑王后', 'King of Swords': '宝剑国王',
    'Ace of Wands': '权杖王牌', 'Two of Wands': '权杖二', 'Three of Wands': '权杖三',
    'Four of Wands': '权杖四', 'Five of Wands': '权杖五', 'Six of Wands': '权杖六',
    'Seven of Wands': '权杖七', 'Eight of Wands': '权杖八', 'Nine of Wands': '权杖九',
    'Ten of Wands': '权杖十', 'Page of Wands': '权杖侍者', 'Knight of Wands': '权杖骑士',
    'Queen of Wands': '权杖王后', 'King of Wands': '权杖国王',
  };
  return nameMap[englishName] || englishName;
};

export default function TwoChoicesReadingPage() {
  const router = useRouter();
  const t = getTwoChoicesT(router.locale);
  const isZh = router.locale === 'zh';

  const { isFromHistory, goBack: goBackToHistory } = useHistoryBack();
  const [result, setResult] = useState<TwoChoicesResult | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.cards && parsed.cards.length === 5) {
          setResult(parsed);
          
          const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
          const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY);
          const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY);
          
          if (savedQuestion) setQuestion(savedQuestion);
          if (savedOptionA) setOptionA(savedOptionA);
          if (savedOptionB) setOptionB(savedOptionB);
          
          if (parsed.reading) {
            setReading(parsed.reading);
          }
        } else {
          setErrorType('incomplete');
          setError(t.reading.errorIncomplete);
        }
      } catch (e) {
        console.error('Failed to parse saved result:', e);
        setErrorType('load');
        setError(t.reading.errorLoad);
      }
    } else {
      router.replace('/reading/general/two-choices/question');
      return;
    }
  }, [router]);

  const generateReading = async () => {
    if (!result || result.cards.length !== 5) return;

    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/reading/two-choices', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cards: result.cards,
          question: question || '',
          optionA: optionA || '',
          optionB: optionB || '',
          locale: isZh ? 'zh' : 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('generate');
      }

      const data = await response.json();
      setReading(data);
      setError(null);
      setErrorType(null);

      const updatedResult = { ...result, reading: data };
      localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(updatedResult));

    } catch (err: any) {
      console.error('Error generating reading:', err);
      if (err.message === 'generate') {
        setErrorType('generate');
        setError(t.reading.errorGenerate);
      } else {
        setErrorType('default');
        setError(t.reading.errorDefault);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && result.cards.length === 5 && !reading && !loading && !error) {
      generateReading();
    }
  }, [result]);

  const handleReturn = () => {
    router.push('/reading/general');
  };

  const handleReset = () => {
    if (!confirm(t.reading.confirmReset)) return;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
      localStorage.removeItem(QUESTION_STORAGE_KEY);
      localStorage.removeItem(OPTION_A_STORAGE_KEY);
      localStorage.removeItem(OPTION_B_STORAGE_KEY);
    }
    router.replace('/reading/general/two-choices/question');
  };

  if (error) {
    const isDataError = errorType === 'incomplete' || errorType === 'load';
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (isDataError) {
                  router.push('/reading/general/two-choices/question');
                } else {
                  setError(null);
                  setErrorType(null);
                  generateReading();
                }
              }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7f13ec' }}
            >
              {isDataError ? t.reading.btnRedraw : t.reading.btnRetry}
            </button>
            <button
              onClick={handleReturn}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              {t.reading.btnBackList}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t.reading.pageTitle}</title>
        <meta name="description" content={t.reading.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={isFromHistory ? goBackToHistory : handleReturn}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">{isFromHistory ? t.backToHistory : t.back}</span>
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              FateAura
            </h2>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">{t.redraw}</span>
          </button>
        </header>

        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                TWO CHOICES SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                {t.reading.h1}
              </h1>
            </motion.div>

            {question && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 text-center"
              >
                <p className="text-white/60 text-sm mb-2">{t.reading.yourQuestion}</p>
                <p className="text-white/90 text-lg">
                  {question}
                </p>
              </motion.div>
            )}

            {result && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <div className="bg-white/5 border border-white/10 rounded-3xl py-6 px-4 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                  <div className="max-w-4xl mx-auto">
                    <TwoChoicesSlots
                      cards={result.cards}
                      isAnimating={Array(5).fill(false)}
                      showLoadingText={false}
                      forceFlipped={true}
                      optionA={optionA || 'A'}
                      optionB={optionB || 'B'}
                      locale={router.locale}
                    />
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {loading ? t.reading.scrollHintLoading : t.reading.scrollHintReady}
                    </span>
                    <span className="material-symbols-outlined text-white/20 text-xl">
                      keyboard_double_arrow_down
                    </span>
                  </motion.div>
                </div>
              </motion.section>
            )}

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div
                      className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: '#7f13ec transparent transparent transparent' }}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.reading.loadingTitle}</h3>
                  <p className="text-white/40 max-w-xs mx-auto text-sm">
                    {t.reading.loadingSubtitle}
                  </p>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 max-w-3xl mx-auto"
                >
                  {/* Overall reading */}
                  <section className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                    <div className="relative bg-[#1a1028] border border-white/10 rounded-2xl p-6 sm:p-10">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-purple-300">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        {t.reading.overallTitle}
                      </h3>
                      <p className="text-white/80 leading-relaxed text-lg">
                        {reading.overall_reading}
                      </p>
                    </div>
                  </section>

                  {/* Per-card analysis */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4 px-4">
                      <div className="h-px flex-1 bg-white/10" />
                      <h3 className="text-xl font-black text-white/50 tracking-widest uppercase">
                        Card Analysis
                      </h3>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {reading.cards.map((cardReading, idx) => {
                      const cardData = result?.cards[idx];
                      const isCurrentState = idx === 0;
                      const isOptionA = idx === 1 || idx === 2;
                      const isOptionB = idx === 3 || idx === 4;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex flex-col md:flex-row gap-6 rounded-2xl p-6 hover:bg-white/8 transition-colors border ${
                            isCurrentState 
                              ? 'bg-yellow-500/5 border-yellow-500/20' 
                              : isOptionA 
                                ? 'bg-blue-500/5 border-blue-500/20' 
                                : 'bg-green-500/5 border-green-500/20'
                          }`}
                        >
                          <div className="w-full md:w-32 flex-shrink-0 flex flex-col items-center">
                            <div className="relative w-24 h-40 mb-3 group overflow-hidden rounded-lg">
                              {cardData?.image ? (
                                <div
                                  className="w-full h-full"
                                  style={{
                                    transform: cardData.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                                  }}
                                >
                                  <img
                                    src={cardData.image}
                                    alt={cardData.name}
                                    className="w-full h-full object-cover shadow-lg border border-white/10"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center border border-dashed border-white/20">
                                  <span className="material-symbols-outlined text-white/20">image</span>
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              isCurrentState 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : isOptionA 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-green-500/20 text-green-400'
                            }`}>
                              {idx + 1}
                            </div>
                            <p className="text-[10px] text-white/40 text-center mt-2 leading-tight">
                              {t.positionNames[idx]}
                            </p>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-lg font-bold text-primary" style={{ color: '#a855f7' }}>
                                {isZh ? getChineseCardName(cardData?.name || '') : (cardData?.name || '')}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${
                                  cardData?.orientation === 'reversed'
                                    ? 'border-orange-500/50 text-orange-400'
                                    : 'border-emerald-500/50 text-emerald-400'
                                }`}
                              >
                                {cardData?.orientation === 'reversed' ? t.reversed : t.upright}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {(cardData ? getLocalizedKeywords(cardData, cardData.orientation, router.locale) : cardReading.keywords).map((keyword, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded-lg text-xs ${
                                    isCurrentState 
                                      ? 'bg-yellow-500/10 text-yellow-400/80' 
                                      : isOptionA 
                                        ? 'bg-blue-500/10 text-blue-400/80' 
                                        : 'bg-green-500/10 text-green-400/80'
                                  }`}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            
                            <p className="text-white/80 leading-relaxed text-base">
                              {cardReading.interpretation}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Choice comparison */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4 px-4">
                      <div className="h-px flex-1 bg-white/10" />
                      <h3 className="text-xl font-black text-white/50 tracking-widest uppercase">
                        {t.reading.choiceComparisonTitle}
                      </h3>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold">
                          {t.reading.optionASection}
                        </span>
                        {optionA && <span className="text-white/70 text-sm">{optionA}</span>}
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        {reading.choice_comparison.option_a_analysis}
                      </p>
                    </div>

                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold">
                          {t.reading.optionBSection}
                        </span>
                        {optionB && <span className="text-white/70 text-sm">{optionB}</span>}
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        {reading.choice_comparison.option_b_analysis}
                      </p>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-purple-400">
                          psychology
                        </span>
                        <h4 className="text-purple-300 font-bold">{t.reading.decisionGuidanceTitle}</h4>
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        {reading.choice_comparison.decision_guidance}
                      </p>
                    </div>
                  </section>

                  {/* Closing reminder */}
                  <div className="text-center py-10 space-y-8">
                    <div className="relative inline-block px-8 py-4">
                      <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                      <p className="relative z-10 text-lg font-medium text-purple-200/80 italic leading-relaxed">
                        「{reading.rational_reminder}」
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                      <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">home</span>
                        {t.reading.backHome}
                      </button>
                      <button
                        onClick={handleReturn}
                        className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#7f13ec' }}
                      >
                        <span className="material-symbols-outlined text-sm">explore</span>
                        {t.reading.browseMore}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
