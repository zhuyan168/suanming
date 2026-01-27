import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import WealthThreeCardSlots from '../../../../components/fortune/WealthThreeCardSlots';

const STORAGE_KEY = 'wealth_current_status_result';

const SLOT_CONFIG = [
  { id: "p1", name: "当前的财运状态", meaning: "你现在整体的金钱状况与能量基调，反映你当下与财富的关系。" },
  { id: "p2", name: "正在影响你财运的因素", meaning: "无论是外在环境、现实条件，还是你的选择与心态，正在对财运产生作用的关键因素。" },
  { id: "p3", name: "近期的财运走向与提醒", meaning: "接下来一段时间财运的整体趋势，以及你需要留意或调整的方向。" }
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
    title: string;
    card_name_zh: string;
    reading: string;
  }[];
  actions: string[];
  closing: string;
}

export default function WealthCurrentStatusReadingPage() {
  const router = useRouter();
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.cards && data.cards.length === 3) {
          setCards(data.cards);
          if (data.reading) {
            setReading(data.reading);
          }
        } else {
          setError('抽牌数据不完整，请重新抽牌');
        }
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        setError('加载数据失败，请返回重新抽牌');
      }
    } else {
      router.push('/themed-readings/wealth/current-wealth-status/draw');
    }
  }, [router]);

  const generateReading = async () => {
    if (!cards || cards.length !== 3) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reading/wealth-current-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: cards,
        }),
      });

      if (!response.ok) {
        throw new Error('生成解读失败，请重试');
      }

      const data = await response.json();
      setReading(data);
      
      // 保存解读结果到 localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...parsed,
          reading: data
        }));
      }
    } catch (err: any) {
      setError(err.message || '出错了，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cards.length === 3 && !reading && !loading && !error) {
      generateReading();
    }
  }, [cards]);

  const handleReturn = () => {
    router.push('/themed-readings/wealth');
  };

  const handleReset = () => {
    if (!confirm('确定要重新抽牌吗？当前结果将被清空。')) return;
    localStorage.removeItem(STORAGE_KEY);
    router.push('/themed-readings/wealth/current-wealth-status/draw');
  };

  if (error) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (error.includes('不完整')) {
                  router.push('/themed-readings/wealth/current-wealth-status/draw');
                } else {
                  generateReading();
                }
              }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7f13ec' }}
            >
              {error.includes('不完整') ? '去抽牌' : '重新生成'}
            </button>
            <button
              onClick={handleReturn}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              返回财富列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-[#191022] min-h-screen text-white font-sans">
      <Head>
        <title>我现在的财运如何？ - 解读结果</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </Head>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#191022]/80 backdrop-blur-sm">
        <button onClick={handleReturn} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-lg font-bold">财运现状解读</h2>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
          <span className="text-sm font-medium">重新抽牌</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 pb-12 sm:pt-8">
        {/* 1. 牌阵展示区 */}
        {cards.length === 3 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80 mb-2 block">Current Wealth Status Reading</span>
              <h1 className="text-2xl sm:text-4xl font-black mb-3 px-4 leading-tight text-white">我现在的财运如何？</h1>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full shadow-[0_0_15px_#7f13ec]"></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] py-4 px-4 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="max-w-4xl mx-auto">
                <WealthThreeCardSlots
                  cards={cards as any}
                  isAnimating={[false, false, false]}
                  showLoadingText={false}
                  forceFlipped={true}
                  slotConfig={SLOT_CONFIG}
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-2">
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">下滑查看解读内容</span>
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
              className="flex flex-col items-center justify-center py-4 text-center"
            >
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7f13ec transparent transparent transparent' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-2">正在整理你的财运线索…</h3>
              <p className="text-white/40 max-w-xs mx-auto text-sm">AI 正在根据你的牌阵进行深度解析，请稍候</p>
            </motion.div>
          ) : reading ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 max-w-3xl mx-auto"
            >
              {/* 2. 总览 */}
              <section className="relative group mt-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-[#1f1629] border border-white/10 rounded-2xl p-6 sm:p-10">
                  <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-purple-300">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    财运总览
                  </h3>
                  <p className="text-white/80 leading-relaxed text-lg italic px-2">
                    {reading.overall}
                  </p>
                </div>
              </section>

              {/* 3. 分牌解读 */}
              <div className="space-y-10">
                <div className="flex items-center gap-4 px-4">
                  <div className="h-px flex-1 bg-white/10"></div>
                  <h3 className="text-xl font-black text-white/50 tracking-widest uppercase">Depth Analysis</h3>
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
                                alt={pos.card_name_zh}
                                className="w-full h-full object-cover shadow-lg border border-white/10"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center border border-dashed border-white/20">
                              <span className="material-symbols-outlined text-white/20">image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-white/50 text-center uppercase tracking-wider">{pos.title}</p>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary" style={{ color: '#a855f7' }}>{pos.card_name_zh}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${cardData?.orientation === 'reversed' ? 'border-orange-500/50 text-orange-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                            {cardData?.orientation === 'reversed' ? '逆位' : '正位'}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed text-base">
                          {pos.reading}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 4. 行动建议 */}
              <section className="space-y-8 pt-4">
                <h3 className="text-2xl font-black text-center flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-primary">lightbulb</span>
                  行动建议
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {reading.actions.map((action, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gradient-to-r from-primary/10 to-transparent border border-white/10 rounded-xl p-5 flex items-start gap-4"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">{i + 1}</span>
                      <p className="text-white/90 text-base py-1">{action}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* 5. 收尾文案 */}
              <div className="text-center py-10 space-y-8">
                <div className="relative inline-block px-8 py-4">
                   <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full"></div>
                   <p className="relative z-10 text-xl font-medium text-purple-200 italic leading-relaxed">
                     「{reading.closing}」
                   </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                    返回首页
                  </button>
                  <button
                    onClick={handleReturn}
                    className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    <span className="material-symbols-outlined text-sm">paid</span>
                    返回财富占卜
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
