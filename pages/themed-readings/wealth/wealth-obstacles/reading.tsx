import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import MoneyBlocksSlots from '../../../../components/fortune/MoneyBlocksSlots';
import { useHistoryBack } from '../../../../hooks/useHistoryBack';
import { getAuthHeaders } from '../../../../lib/apiHeaders';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getReadingUiText } from '../../../../lib/readingUiText';

const STORAGE_KEY = 'wealth_obstacles_result';

const SLOT_CONFIG = [
  { id: "p1", name: "你当前的财务状况", meaning: "你当前的财务状况" },
  { id: "p2", name: "影响你财务的外在因素", meaning: "影响你财务的外在因素" },
  { id: "p3", name: "你对自己财务状况的态度", meaning: "你对自己财务状况的态度" },
  { id: "p4", name: "阻碍你财务改善的原因", meaning: "阻碍你财务改善的原因" },
  { id: "p5", name: "你可以如何突破这一财务阻碍", meaning: "你可以如何突破这一财务阻碍" }
];

const SLOT_CONFIG_EN = [
  { id: "p1", name: "Current Finances", meaning: "Your current financial state." },
  { id: "p2", name: "External Influence", meaning: "Outside factors affecting your money situation." },
  { id: "p3", name: "Your Attitude", meaning: "How your mindset is shaping your finances." },
  { id: "p4", name: "Main Block", meaning: "The core reason your finances feel blocked." },
  { id: "p5", name: "Breakthrough Path", meaning: "How you can start moving through this block." }
];

interface TarotCard {
  id: number;
  name: string;
  image: string;
  orientation: 'upright' | 'reversed';
  upright: string;
  reversed: string;
  keywords: string[];
}

interface ReadingResult {
  overall: string;
  cards: {
    position: number;
    title: string;
    card: string;
    orientation: string;
    reading: string;
  }[];
  disclaimer: string;
}

export default function WealthObstaclesReadingPage() {
  const router = useRouter();
  const texts = getReadingUiText(router.locale);
  const isEn = router.locale !== 'zh';
  const slotConfig = isEn ? SLOT_CONFIG_EN : SLOT_CONFIG;
  const pageText = {
    title: isEn ? 'Wealth Obstacles Reading | FateAura' : '财富阻碍解读 - FateAura',
    header: isEn ? 'Wealth Obstacles Reading' : '财富阻碍解读',
    h1: isEn ? 'What Is Blocking My Wealth Right Now?' : '我现在的财富阻碍是什么？',
    scrollHint: isEn ? 'Scroll down to view your reading' : '下滑查看解读内容',
    loadingTitle: isEn ? 'Reading your wealth energy in depth...' : '正在深度洞察你的财富能量...',
    overallTitle: isEn ? 'Wealth Energy Overview' : '财富能量总览',
    position: isEn ? 'Position' : '牌位',
    backHome: isEn ? 'Back Home' : '返回首页',
    backWealth: isEn ? 'Back to Wealth Readings' : '返回财富主页',
    upright: isEn ? 'Upright' : '正位',
    reversed: isEn ? 'Reversed' : '逆位',
  };
  const { isFromHistory, goBack: goBackToHistory } = useHistoryBack();

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'wealth-obstacles',
    redirectPath: '/themed-readings/wealth',
  });

  const [cards, setCards] = useState<TarotCard[]>([]);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.cards && data.cards.length === 5) {
          setCards(data.cards);
          if (data.reading) {
            setReading(data.reading);
          }
        } else {
          setError(texts.errorIncomplete);
        }
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        setError(texts.errorLoad);
      }
    } else {
      router.push('/themed-readings/wealth/wealth-obstacles/draw');
    }
  }, [router]);

  const generateReading = async () => {
    if (!cards || cards.length !== 5) return;
    
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/reading/wealth-obstacles', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cards: cards,
          locale: isEn ? 'en' : 'zh',
        }),
      });

      if (!response.ok) {
        throw new Error(texts.errorGenerateRetry);
      }

      const data = await response.json();
      setReading(data);
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...parsed,
          reading: data
        }));
      }

    } catch (err: any) {
      setError(err.message || texts.errorGenerateRetry);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cards.length === 5 && !reading && !loading && !error) {
      generateReading();
    }
  }, [cards]);

  const handleReturn = () => {
    router.push('/themed-readings/wealth');
  };

  const handleReset = () => {
    if (!confirm(texts.confirmReset)) return;
    localStorage.removeItem(STORAGE_KEY);
    router.replace('/themed-readings/wealth/wealth-obstacles/draw');
  };

  if (accessLoading || !allowed) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex items-center justify-center">
        <div className="text-white/60">{texts.loadingTitle}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center shadow-glow">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (error.includes('不完整') || error.includes('incomplete')) {
                  router.push('/themed-readings/wealth/wealth-obstacles/draw');
                } else {
                  generateReading();
                }
              }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:scale-[1.02] transition-all shadow-glow"
              style={{ backgroundColor: '#7f13ec' }}
            >
              {(error.includes('不完整') || error.includes('incomplete')) ? texts.btnDrawAgain : texts.btnRetry}
            </button>
            <button
              onClick={handleReturn}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              {texts.btnBackList}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-[#191022] min-h-screen text-white font-sans">
      <Head>
        <title>{pageText.title}</title>
      </Head>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#191022]/80 backdrop-blur-sm">
        <button onClick={isFromHistory ? goBackToHistory : handleReturn} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm">{isFromHistory ? texts.backToHistory : texts.back}</span>
        </button>
        <h2 className="text-lg font-bold">{pageText.header}</h2>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
          <span className="text-sm font-medium">{texts.btnDrawAgain}</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 pb-20 sm:pt-8">
        {/* 1. 牌阵展示区 */}
        {cards.length === 5 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80 mb-2 block">Wealth Obstacles Reading</span>
              <h1 className="text-2xl sm:text-4xl font-black mb-4 px-4 leading-tight text-white">{pageText.h1}</h1>
              <div className="h-1 w-24 bg-primary mx-auto rounded-full shadow-[0_0_15px_#7f13ec]"></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] py-6 px-4 relative overflow-hidden shadow-glow-sm">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
              
              <div className="max-w-4xl mx-auto">
                <MoneyBlocksSlots
                  cards={cards as any}
                  isAnimating={[false, false, false, false, false]}
                  showLoadingText={false}
                  forceFlipped={true}
                  slotConfig={slotConfig}
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{pageText.scrollHint}</span>
                <span className="material-symbols-outlined text-white/20 text-xl">keyboard_double_arrow_down</span>
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
              <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7f13ec transparent transparent transparent' }}></div>
                <div className="absolute inset-4 border-4 border-purple-400/20 rounded-full"></div>
                <div className="absolute inset-4 border-4 border-purple-400 border-b-transparent rounded-full animate-spin-slow" style={{ borderColor: 'transparent transparent #a855f7 transparent' }}></div>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {pageText.loadingTitle}
              </h3>
              <p className="text-white/40 max-w-sm mx-auto text-base leading-relaxed">
                {router.locale === 'en'
                  ? 'AI is carefully analyzing your 5 cards to identify hidden blocks and find breakthrough paths. Please wait a moment.'
                  : 'AI 正在根据你的 5 张牌面进行细致分析，识别潜在阻碍并寻找突破路径，请耐心稍候。'}
              </p>
            </motion.div>
          ) : reading ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16 max-w-4xl mx-auto"
            >
              {/* 2. 总览 */}
              <section className="relative group mt-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-[#1f1629] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-glow-sm">
                  <h3 className="text-2xl font-bold flex items-center gap-3 mb-8 text-purple-300">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                    {pageText.overallTitle}
                  </h3>
                  <div className="text-white/90 leading-relaxed text-xl px-2 space-y-4">
                    {reading.overall.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. 分牌解读 */}
              <div className="space-y-12">
                <div className="flex items-center gap-6 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                  <h3 className="text-xl font-black text-white/40 tracking-[0.3em] uppercase">Detailed Analysis</h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {reading.cards.map((cardReading, idx) => {
                    const cardData = cards[idx];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-col md:flex-row gap-8 bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/8 transition-all hover:border-primary/30 group"
                      >
                        <div className="w-full md:w-40 flex-shrink-0 flex flex-col items-center">
                          <div className="relative w-32 h-52 mb-4 group-hover:scale-105 transition-transform duration-500 overflow-hidden rounded-xl shadow-2xl">
                            {cardData?.image ? (
                              <div 
                                className="w-full h-full"
                                style={{ transform: cardData.orientation === 'reversed' ? 'rotate(180deg)' : 'none' }}
                              >
                                <img
                                  src={cardData.image}
                                  alt={isEn ? (cardData?.name || cardReading.card) : cardReading.card}
                                  className="w-full h-full object-contain border border-white/10"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center border border-dashed border-white/20">
                                <span className="material-symbols-outlined text-white/20 text-3xl">image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">{pageText.position} {idx + 1}</span>
                            <p className="text-[11px] font-bold text-primary/80 text-center leading-tight">{isEn ? (slotConfig[idx]?.name || cardReading.title) : cardReading.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-2xl font-black text-white group-hover:text-primary transition-colors duration-300">{isEn ? (cardData?.name || cardReading.card) : cardReading.card}</span>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${cardData?.orientation === 'reversed' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
                              {cardData?.orientation === 'reversed' ? pageText.reversed : pageText.upright}
                            </span>
                          </div>
                          <div className="text-white/80 leading-relaxed text-lg space-y-4">
                            {cardReading.reading.split('\n').map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 4. 理性提醒 */}
              <div className="pt-10 pb-16">
                <div className="relative max-w-3xl mx-auto flex justify-center">
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 shadow-glow-sm backdrop-blur-sm">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                    <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">auto_awesome</span>
                    <p className="relative z-10 text-white/80 text-sm sm:text-base text-center leading-relaxed">
                      {reading.disclaimer}
                    </p>
                    <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1.5s' }}>auto_awesome</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-16">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-bold">{pageText.backHome}</span>
                  </button>
                  <button
                    onClick={handleReturn}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center justify-center gap-3"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    <span className="material-symbols-outlined">paid</span>
                    <span className="font-bold">{pageText.backWealth}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .shadow-glow {
          box-shadow: 0 0 20px rgba(127, 19, 236, 0.3);
        }

        .shadow-glow-sm {
          box-shadow: 0 0 15px rgba(127, 19, 236, 0.15);
        }
      `}</style>
    </div>
  );
}
