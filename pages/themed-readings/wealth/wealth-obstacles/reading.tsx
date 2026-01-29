import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import MoneyBlocksSlots from '../../../../components/fortune/MoneyBlocksSlots';

const STORAGE_KEY = 'wealth_obstacles_result';

const SLOT_CONFIG = [
  { id: "p1", name: "你当前的财务状况", meaning: "你当前的财务状况" },
  { id: "p2", name: "影响你财务的外在因素", meaning: "影响你财务的外在因素" },
  { id: "p3", name: "你对自己财务状况的态度", meaning: "你对自己财务状况的态度" },
  { id: "p4", name: "阻碍你财务改善的原因", meaning: "阻碍你财务改善的原因" },
  { id: "p5", name: "你可以如何突破这一财务阻碍", meaning: "你可以如何突破这一财务阻碍" }
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
          setError('抽牌数据不完整，请重新抽牌');
        }
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        setError('加载数据失败，请返回重新抽牌');
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
      const response = await fetch('/api/reading/wealth-obstacles', {
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
    if (cards.length === 5 && !reading && !loading && !error) {
      generateReading();
    }
  }, [cards]);

  const handleReturn = () => {
    router.push('/themed-readings/wealth');
  };

  const handleReset = () => {
    if (!confirm('确定要重新抽牌吗？当前结果将被清空。')) return;
    localStorage.removeItem(STORAGE_KEY);
    router.replace('/themed-readings/wealth/wealth-obstacles/draw');
  };

  if (error) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center shadow-glow">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (error.includes('不完整')) {
                  router.push('/themed-readings/wealth/wealth-obstacles/draw');
                } else {
                  generateReading();
                }
              }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:scale-[1.02] transition-all shadow-glow"
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
        <title>财富阻碍解读 - Mystic Insights</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </Head>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#191022]/80 backdrop-blur-sm">
        <button onClick={handleReturn} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-lg font-bold">财富阻碍解读</h2>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
          <span className="text-sm font-medium">重新抽牌</span>
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
              <h1 className="text-2xl sm:text-4xl font-black mb-4 px-4 leading-tight text-white">我现在的财富阻碍是什么？</h1>
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
                  slotConfig={SLOT_CONFIG}
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
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
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#7f13ec transparent transparent transparent' }}></div>
                <div className="absolute inset-4 border-4 border-purple-400/20 rounded-full"></div>
                <div className="absolute inset-4 border-4 border-purple-400 border-b-transparent rounded-full animate-spin-slow" style={{ borderColor: 'transparent transparent #a855f7 transparent' }}></div>
              </div>
              <h3 className="text-2xl font-bold mb-3">正在深度洞察你的财富能量…</h3>
              <p className="text-white/40 max-w-sm mx-auto text-base leading-relaxed">
                AI 正在根据你的 5 张牌面进行细致分析，识别潜在阻碍并寻找突破路径，请耐心稍候。
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
                    财富能量总览
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
                                  alt={cardReading.card}
                                  className="w-full h-full object-cover border border-white/10"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center border border-dashed border-white/20">
                                <span className="material-symbols-outlined text-white/20 text-3xl">image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">Position {idx + 1}</span>
                            <p className="text-[11px] font-bold text-primary/80 text-center leading-tight">{cardReading.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex-1 space-y-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-2xl font-black text-white group-hover:text-primary transition-colors duration-300">{cardReading.card}</span>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${cardData?.orientation === 'reversed' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
                              {cardReading.orientation}
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
                    <span className="font-bold">返回首页</span>
                  </button>
                  <button
                    onClick={handleReturn}
                    className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-primary text-white font-bold hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center justify-center gap-3"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    <span className="material-symbols-outlined">paid</span>
                    <span className="font-bold">返回财富主页</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap');
        
        body {
          font-family: 'Noto Sans SC', sans-serif;
          background-color: #191022;
        }

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

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
