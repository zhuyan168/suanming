import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ThreeCardSlots from '../../../../components/fortune/ThreeCardSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import { getThreeCardT } from '../../../../lib/threeCardI18n';
import { getLocalizedKeywords, getLocalizedMeaning } from '../../../../lib/tarotCardI18n';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// English card name → Chinese name mapping (used for zh locale only)
const getChineseCardName = (englishName: string): string => {
  const nameMap: { [key: string]: string } = {
    '0. The Fool': '愚者',
    'I. The Magician': '魔术师',
    'II. The High Priestess': '女祭司',
    'III. The Empress': '皇后',
    'IV. The Emperor': '皇帝',
    'V. The Hierophant': '教皇',
    'VI. The Lovers': '恋人',
    'VII. The Chariot': '战车',
    'VIII. Strength': '力量',
    'IX. The Hermit': '隐者',
    'X. Wheel of Fortune': '命运之轮',
    'XI. Justice': '正义',
    'XII. The Hanged Man': '倒吊人',
    'XIII. Death': '死神',
    'XIV. Temperance': '节制',
    'XV. The Devil': '恶魔',
    'XVI. The Tower': '塔',
    'XVII. The Star': '星星',
    'XVIII. The Moon': '月亮',
    'XIX. The Sun': '太阳',
    'XX. Judgement': '审判',
    'XXI. The World': '世界',
    'Ace of Cups': '圣杯王牌',
    'Two of Cups': '圣杯二',
    'Three of Cups': '圣杯三',
    'Four of Cups': '圣杯四',
    'Five of Cups': '圣杯五',
    'Six of Cups': '圣杯六',
    'Seven of Cups': '圣杯七',
    'Eight of Cups': '圣杯八',
    'Nine of Cups': '圣杯九',
    'Ten of Cups': '圣杯十',
    'Page of Cups': '圣杯侍者',
    'Knight of Cups': '圣杯骑士',
    'Queen of Cups': '圣杯王后',
    'King of Cups': '圣杯国王',
    'Ace of Pentacles': '星币王牌',
    'Two of Pentacles': '星币二',
    'Three of Pentacles': '星币三',
    'Four of Pentacles': '星币四',
    'Five of Pentacles': '星币五',
    'Six of Pentacles': '星币六',
    'Seven of Pentacles': '星币七',
    'Eight of Pentacles': '星币八',
    'Nine of Pentacles': '星币九',
    'Ten of Pentacles': '星币十',
    'Page of Pentacles': '星币侍者',
    'Knight of Pentacles': '星币骑士',
    'Queen of Pentacles': '星币王后',
    'King of Pentacles': '星币国王',
    'Ace of Swords': '宝剑王牌',
    'Two of Swords': '宝剑二',
    'Three of Swords': '宝剑三',
    'Four of Swords': '宝剑四',
    'Five of Swords': '宝剑五',
    'Six of Swords': '宝剑六',
    'Seven of Swords': '宝剑七',
    'Eight of Swords': '宝剑八',
    'Nine of Swords': '宝剑九',
    'Ten of Swords': '宝剑十',
    'Page of Swords': '宝剑侍者',
    'Knight of Swords': '宝剑骑士',
    'Queen of Swords': '宝剑王后',
    'King of Swords': '宝剑国王',
    'Ace of Wands': '权杖王牌',
    'Two of Wands': '权杖二',
    'Three of Wands': '权杖三',
    'Four of Wands': '权杖四',
    'Five of Wands': '权杖五',
    'Six of Wands': '权杖六',
    'Seven of Wands': '权杖七',
    'Eight of Wands': '权杖八',
    'Nine of Wands': '权杖九',
    'Ten of Wands': '权杖十',
    'Page of Wands': '权杖侍者',
    'Knight of Wands': '权杖骑士',
    'Queen of Wands': '权杖王后',
    'King of Wands': '权杖国王',
  };
  
  return nameMap[englishName] || englishName;
};

const QUESTION_STORAGE_KEY = 'general_three_card_question';
const RESULT_STORAGE_KEY = 'general_three_card_draw_result';

interface ThreeCardResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
}

const loadResult = (): ThreeCardResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load three card result:', error);
    return null;
  }
};

export default function ThreeCardRevealPage() {
  const router = useRouter();
  const t = getThreeCardT(router.locale);
  const isZh = router.locale === 'zh';

  const [result, setResult] = useState<ThreeCardResult | null>(null);
  const [question, setQuestion] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = loadResult();
    if (!saved) {
      router.replace('/reading/general/three-card-universal/question');
      return;
    }
    
    setResult(saved);

    setQuestion(saved.question ?? localStorage.getItem(QUESTION_STORAGE_KEY) ?? '');
  }, [router]);

  const handleRedraw = () => {
    if (!confirm(t.reveal.confirmRedraw)) return;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
      localStorage.removeItem(QUESTION_STORAGE_KEY);
    }
    
    router.push('/reading/general/three-card-universal/question');
  };

  const handleStartInterpretation = () => {
    router.push('/reading/general/three-card-universal/reading');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleBackToList = () => {
    router.push('/reading/general');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-white/70">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t.reveal.pageTitle}</title>
        <meta name="description" content={t.reveal.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={handleBackToList}
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

          <button
            onClick={handleRedraw}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">{t.redraw}</span>
          </button>
        </header>

        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                THREE-CARD UNIVERSAL SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                {t.reveal.h1}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                {t.reveal.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 mx-auto max-w-3xl"
            >
              <div className="rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm p-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                    psychology
                  </span>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs font-medium mb-1">{t.yourQuestion}</p>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {question || t.noQuestion}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <ThreeCardSlots
                cards={result.cards}
                isAnimating={Array(3).fill(false)}
                showLoadingText={false}
                forceFlipped={true}
                locale={router.locale}
              />

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.cards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-white font-semibold flex-1">
                        {isZh ? getChineseCardName(card.name) : card.name}
                      </h3>
                    </div>
                    
                    <p className="text-white/90 font-medium mb-2">
                      {card.orientation === 'upright' ? t.upright : t.reversed}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-white/50 mb-1">{t.reveal.keywords}</p>
                        <div className="flex flex-wrap gap-2">
                          {getLocalizedKeywords(card, card.orientation, router.locale).map((keyword, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-white/50 mb-1">{t.reveal.meaning}</p>
                        <p className="text-white/70 leading-relaxed">
                          {getLocalizedMeaning(card, card.orientation, router.locale)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-12 space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartInterpretation}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)]"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      {t.reveal.startReadingBtn}
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToHome}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/10"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">home</span>
                      {t.reveal.backHome}
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
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
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
