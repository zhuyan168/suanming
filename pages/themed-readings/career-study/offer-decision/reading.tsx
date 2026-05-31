import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import TwoRowsThreeColsSlots from '../../../../components/fortune/TwoRowsThreeColsSlots';
import { useHistoryBack } from '../../../../hooks/useHistoryBack';
import { getAuthHeaders } from '../../../../lib/apiHeaders';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getReadingUiText } from '../../../../lib/readingUiText';

const STORAGE_KEY = 'offer_decision_result';

const SLOT_CONFIG = [
  { position: 1, title: "这项机会与你的契合程度", meaning: "这项机会与你的契合程度" },
  { position: 2, title: "接受后可能获得的成长与发展空间", meaning: "接受这项机会后，你可能获得的成长与发展空间" },
  { position: 3, title: "需要面对的人际关系与协作状态", meaning: "这项机会中你需要面对的人际关系与协作状态" },
  { position: 4, title: "对方/环境对你的真实期待与态度", meaning: "对方 / 环境对你的真实期待与态度" },
  { position: 5, title: "需要特别留意的风险与代价", meaning: "接受这项机会后，你需要特别留意的风险与代价" },
  { position: 6, title: "除了它之外还存在的其他机会", meaning: "除了它之外，你目前还存在的其他机会" }
];

const SLOT_CONFIG_EN = [
  { position: 1, title: "How well this opportunity fits you", meaning: "How well this opportunity fits your current needs, values, and direction" },
  { position: 2, title: "Growth and development potential", meaning: "The growth, learning, or future space this opportunity may bring" },
  { position: 3, title: "Relationships and collaboration", meaning: "The people, teamwork, and collaboration dynamics involved" },
  { position: 4, title: "Their real expectations", meaning: "What the company, team, or environment may truly expect from you" },
  { position: 5, title: "Risks and costs to notice", meaning: "The hidden risks, tradeoffs, or costs that deserve attention" },
  { position: 6, title: "Other opportunities around you", meaning: "Other possibilities or alternatives that may still exist beyond this offer" }
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
  positions: {
    position: string;
    card: string;
    reading: string;
  }[];
}

export default function OfferDecisionReading() {
  const router = useRouter();
  const texts = getReadingUiText(router.locale);
  const isEn = router.locale !== 'zh';
  const slotConfig = isEn ? SLOT_CONFIG_EN : SLOT_CONFIG;
  const pageText = {
    title: isEn ? 'Offer Decision Reading | FateAura' : '我已经拿到 offer 了，要不要接受？ - 解读 | FateAura',
    metaDesc: isEn ? 'Clarify what this opportunity may bring without letting tarot make the decision for you.' : '帮助你看清这项机会的真实面貌，而不是替你做决定',
    noCardsTitle: isEn ? 'No Cards Drawn Yet' : '你还没有完成抽牌',
    noCardsDesc: isEn ? 'Please finish drawing your cards before viewing the reading.' : '请先完成抽牌，才能查看解读结果',
    goDraw: isEn ? 'Go to Draw Page' : '前往抽牌页',
    backList: isEn ? 'Back to List' : '返回列表页',
    header: isEn ? 'Offer Decision Reading' : 'Offer 决策解读',
    h1: isEn ? 'Should I Accept This Offer?' : '我已经拿到 offer 了，要不要接受？',
    intro: isEn
      ? 'This reading helps you understand the likely influence of this opportunity, without replacing your own decision.'
      : '这份解读将围绕你所抽到的牌，帮助你理解这项机会可能带来的影响，而不是替你做出决定。',
    scrollHint: isEn ? 'Scroll down to view your reading' : '下滑查看解读',
    overallTitle: isEn ? 'Overall Reading' : '整体解读总览',
    deepTitle: isEn ? 'Deep Reading' : '深度解读',
    disclaimer: isEn
      ? 'Tarot reflects the energy and possible direction around this opportunity. Please treat this reading as a reference, not the only basis for your decision.'
      : '占卜仅呈现你当下所处的能量状态与可能的倾向，未来仍取决于你的判断、选择与持续的行动。请将解读作为参考，而非唯一依据。',
    backHome: isEn ? 'Back Home' : '返回首页',
    backCareer: isEn ? 'Back to Career & Study' : '返回事业&学业占卜',
    upright: isEn ? 'Upright' : '正位',
    reversed: isEn ? 'Reversed' : '逆位',
  };
  const { isFromHistory, goBack: goBackToHistory } = useHistoryBack();

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'career-offer-decision',
    redirectPath: '/themed-readings/career-study',
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
        setCards(data.cards);
        if (data.reading) {
          setReading(data.reading);
        }
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        setError(texts.errorLoad);
      }
    } else {
        setError(pageText.noCardsTitle);
    }
  }, []);

  const generateReading = async () => {
    if (!cards || cards.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/reading/offer-decision', {
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
    if (cards.length > 0 && !reading && !loading && !error) {
      generateReading();
    }
  }, [cards]);

  const handleReturnToList = () => {
    router.push('/themed-readings/career-study');
  };

  const handleReturnToDraw = () => {
    router.push('/themed-readings/career-study/offer-decision/draw');
  };

  const handleReset = () => {
    if (!confirm(texts.confirmReset)) return;
    localStorage.removeItem(STORAGE_KEY);
    router.push('/themed-readings/career-study/offer-decision/draw');
  };

  if (accessLoading || !allowed) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex items-center justify-center">
        <div className="text-white/60">{texts.loadingTitle}</div>
      </div>
    );
  }

  // 错误兜底页面
  if (error && !cards.length) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4">
        <Head>
          <title>{pageText.title}</title>
        </Head>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-yellow-400 mb-4 text-4xl">💭</div>
          <p className="text-lg mb-2 font-bold">{pageText.noCardsTitle}</p>
          <p className="text-white/60 text-sm mb-6">{pageText.noCardsDesc}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReturnToDraw}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7f13ec' }}
            >
              {pageText.goDraw}
            </button>
            <button
              onClick={handleReturnToList}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              {pageText.backList}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // API 错误处理页面
  if (error && cards.length > 0) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4">
        <Head>
          <title>{pageText.title}</title>
        </Head>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={generateReading}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7f13ec' }}
            >
              {texts.btnRetry}
            </button>
            <button
              onClick={handleReturnToList}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              {pageText.backList}
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
        <meta name="description" content={pageText.metaDesc} />
      </Head>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#191022]/80 backdrop-blur-sm">
        <button onClick={isFromHistory ? goBackToHistory : handleReturnToList} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm">{isFromHistory ? texts.backToHistory : texts.back}</span>
        </button>
        <h2 className="text-lg font-bold">{pageText.header}</h2>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
          <span className="text-sm font-medium">{texts.btnDrawAgain}</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 pb-12 sm:pt-8">
        {/* 1. 顶层牌阵展示区 */}
        {cards.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="text-center mb-3 sm:mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80 mb-1 block">Offer Decision Reading</span>
              <h1 className="text-2xl sm:text-3xl font-black mb-2 px-4 leading-tight">
                {pageText.h1}
              </h1>
              <p className="text-white/50 text-sm max-w-2xl mx-auto px-4 mt-3">
                {pageText.intro}
              </p>
              <div className="h-1 w-16 bg-primary mx-auto rounded-full shadow-[0_0_15px_#7f13ec] mt-3"></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] py-3 sm:py-4 px-3 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
              
              <div className="max-w-4xl mx-auto">
                <TwoRowsThreeColsSlots
                  cards={cards}
                  isAnimating={Array(6).fill(false)}
                  showLoadingText={false}
                  forceFlipped={true}
                  slotConfig={slotConfig}
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-3">
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
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7f13ec transparent transparent transparent' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-2">{texts.loadingTitle}</h3>
              <p className="text-white/40 max-w-xs mx-auto text-sm">{texts.loadingSubtitle}</p>
            </motion.div>
          ) : reading ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 max-w-3xl mx-auto"
            >
              {/* 2. 整体解读总览 */}
              <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-[#1f1629] border border-white/10 rounded-2xl p-6 sm:p-10">
                  <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-purple-300">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    {pageText.overallTitle}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                    {reading.overall}
                  </p>
                </div>
              </section>

              {/* 3. 六个牌位深度解析区 */}
              <div className="space-y-10">
                <div className="flex items-center gap-4 px-4">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <h3 className="text-xl font-black text-white/50 tracking-widest uppercase">{pageText.deepTitle}</h3>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
                {reading.positions.map((pos, idx) => {
                  const cardData = cards[idx];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex flex-col md:flex-row gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
                    >
                      <div className="w-full md:w-32 flex-shrink-0 flex flex-col items-center">
                        <div className="relative w-24 h-40 mb-3 group overflow-hidden rounded-lg">
                          {cardData?.image ? (
                            <div 
                              className="w-full h-full"
                              style={{ transform: cardData.orientation === 'reversed' ? 'rotate(180deg)' : 'none' }}
                            >
                              <img
                                src={cardData.image}
                                alt={isEn ? (cardData?.name || pos.card) : pos.card}
                                className="w-full h-full object-cover shadow-lg border border-white/10"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center border border-dashed border-white/20">
                              <span className="material-symbols-outlined text-white/20">image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white/50 text-center uppercase tracking-wider">{isEn ? (slotConfig[idx]?.title || pos.position) : pos.position}</p>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-lg font-bold text-primary" style={{ color: '#a855f7' }}>{isEn ? (cardData?.name || pos.card) : pos.card}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${cardData?.orientation === 'reversed' ? 'border-orange-500/50 text-orange-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                            {cardData?.orientation === 'reversed' ? pageText.reversed : pageText.upright}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                          {pos.reading}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 4. 底部理性提醒 */}
              <div className="border-t border-white/10 pt-10 pb-8 space-y-6">
                <div className="bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 text-center">
                  <div className="inline-block p-3 rounded-full bg-purple-500/10 mb-4">
                    <span className="material-symbols-outlined text-purple-400 text-2xl">psychology</span>
                  </div>
                  <p className="text-white/70 leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
                    {pageText.disclaimer}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                    {pageText.backHome}
                  </button>
                  <button
                    onClick={handleReturnToList}
                    className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    {pageText.backCareer}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap');
        
        :root {
          --primary: #7f13ec;
        }
        
        body {
          font-family: 'Noto Sans SC', sans-serif;
          background-color: #191022;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
