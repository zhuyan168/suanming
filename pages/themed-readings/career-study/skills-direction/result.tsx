import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import ShootingForwardSlots from '../../../../components/fortune/ShootingForwardSlots';

const STORAGE_KEY = 'skills_direction_result';

const SLOT_CONFIG = [
  { id: "p1", name: "内心真正渴望的状态", meaning: "我内心真正渴望的工作/发展状态是什么？" },
  { id: "p2", name: "最适合的靠近方向", meaning: "我现在最适合往哪个方向去靠近它？" },
  { id: "p3", name: "核心优势或潜力", meaning: "我目前最能拿得出手的优势或潜力是什么？" },
  { id: "p4", name: "可获得的资源支持", meaning: "我可以从哪里获得支持或资源？" },
  { id: "p5", name: "需要调整或补强", meaning: "我现在最需要调整或补强的地方是什么？" }
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
  title: string;
  warm_opening: string;
  overall: string;
  positions: {
    position: string;
    card: string;
    reading: string;
  }[];
  action_plan: {
    fit_directions: string[];
    next_7_days: string[];
    next_30_days: string[];
    avoid: string[];
  };
  closing: string;
}

export default function SkillsDirectionResult() {
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
        setCards(data.cards);
        if (data.reading) {
          setReading(data.reading);
        }
      } catch (e) {
        console.error('Failed to parse saved data:', e);
        setError('加载数据失败，请返回重新抽牌');
      }
    } else {
      router.push('/themed-readings/career-study/skills-direction/draw');
    }
  }, [router]);

  const generateReading = async () => {
    if (!cards || cards.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reading/career-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: cards,
          question: '我应该找什么样的工作？',
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
    if (cards.length > 0 && !reading && !loading && !error) {
      generateReading();
    }
  }, [cards]);

  const handleReturn = () => {
    router.push('/themed-readings/career-study');
  };

  const handleReset = () => {
    if (!confirm('确定要重新抽牌吗？当前结果将被清空。')) return;
    localStorage.removeItem(STORAGE_KEY);
    router.push('/themed-readings/career-study/skills-direction/draw');
  };

  if (error) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={generateReading}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7f13ec' }}
            >
              重新生成
            </button>
            <button
              onClick={handleReturn}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-[#191022] min-h-screen text-white font-sans">
      <Head>
        <title>职业解读 - 我应该找什么样的工作？/学什么技能？</title>
      </Head>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#191022]/80 backdrop-blur-sm">
        <button onClick={handleReturn} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-lg font-bold">职业方向解读</h2>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
          <span className="text-sm font-medium">重新抽牌</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 pb-12 sm:pt-8">
        {/* 1. 顶层牌阵展示区 */}
        {cards.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 sm:mb-20"
          >
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80 mb-3 block">Career & Study Spread</span>
              <h1 className="text-3xl sm:text-4xl font-black mb-4 px-4 leading-tight">我应该找什么样的工作 / 学什么技能？</h1>
              <div className="h-1 w-16 bg-primary mx-auto rounded-full shadow-[0_0_15px_#7f13ec]"></div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] py-10 sm:py-16 px-4 relative overflow-hidden">
              {/* 背景装饰光晕 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
              
              <ShootingForwardSlots
                cards={cards}
                isAnimating={Array(5).fill(false)}
                showLoadingText={false}
                forceFlipped={true}
                slotConfig={SLOT_CONFIG}
              />
            </div>
            
            <div className="flex justify-center mt-8">
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">下滑查看解读</span>
                <span className="material-symbols-outlined text-white/20 text-2xl">keyboard_double_arrow_down</span>
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
              <h3 className="text-xl font-bold mb-2">正在洞察职业天机...</h3>
              <p className="text-white/40 max-w-xs mx-auto text-sm">AI 正在根据你的牌阵进行深度解析，请稍候</p>
            </motion.div>
          ) : reading ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 max-w-3xl mx-auto"
            >
              {/* 2. AI 核心总结 (类似图2的一句话总结) */}
              <div className="text-center space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-2">
                  <span className="text-sm font-bold text-purple-300">✨ AI 核心洞察</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white px-4">
                  {reading.title}
                </h2>
                <p className="text-white/70 text-lg italic font-medium px-6">
                  「{reading.warm_opening}」
                </p>
              </div>

              {/* 3. 整体解读 */}
              <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-[#1f1629] border border-white/10 rounded-2xl p-6 sm:p-10">
                  <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-purple-300">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    整体局面解读
                  </h3>
                  <p className="text-white/80 leading-relaxed text-lg whitespace-pre-line">
                    {reading.overall}
                  </p>
                </div>
              </section>

              {/* 4. 五张牌深度解析区 */}
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
                                alt={pos.card}
                                className="w-full h-full object-cover shadow-lg border border-white/10"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center border border-dashed border-white/20">
                              <span className="material-symbols-outlined text-white/20">image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white/50 text-center uppercase tracking-wider">{pos.position}</p>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary" style={{ color: '#a855f7' }}>{pos.card}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${cardData?.orientation === 'reversed' ? 'border-orange-500/50 text-orange-400' : 'border-emerald-500/50 text-emerald-400'}`}>
                            {cardData?.orientation === 'reversed' ? '逆位' : '正位'}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed">
                          {pos.reading}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 行动建议区 */}
              <section className="space-y-8 pt-8">
                <h3 className="text-2xl font-black text-center">行动指引</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 适合的方向 */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-white/10 rounded-2xl p-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-400">explore</span>
                      适合的工作方向
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {reading.action_plan.fit_directions.map((dir, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm border border-purple-500/30">
                          {dir}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 避坑指南 */}
                  <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-white/10 rounded-2xl p-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-400">warning</span>
                      避坑指南
                    </h4>
                    <ul className="space-y-2">
                      {reading.action_plan.avoid.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <span className="text-orange-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 阶段动作 */}
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-400">calendar_today</span>
                      接下来 7 天可以做的事
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reading.action_plan.next_7_days.map((action, i) => (
                        <li key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl text-sm text-white/80">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400">event_note</span>
                      接下来 30 天可以做的事
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reading.action_plan.next_30_days.map((action, i) => (
                        <li key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl text-sm text-white/80">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* 收尾文案 */}
              <div className="text-center py-8 space-y-6">
                <p className="text-xl font-medium text-white/90 italic">「{reading.closing}」</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => router.push('/')}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                    返回首页
                  </button>
                  <button
                    onClick={handleReturn}
                    className="w-full sm:w-auto px-10 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    style={{ backgroundColor: '#7f13ec' }}
        >
                    返回事业&学业占卜
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
