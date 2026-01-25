import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CareerDevelopmentSevenSlots from '../../../../components/fortune/CareerDevelopmentSevenSlots';

interface ShuffledTarotCard {
  id: number;
  name: string;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
  orientation: 'upright' | 'reversed';
}

interface InterpretationData {
  overview: string;
  cardDetails: {
    slotName: string;
    cardName: string;
    orientation: string;
    interpretation: string;
  }[];
  actionSuggestions: string[];
  realityReminder: string;
}

interface StayOrLeaveResult {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
  interpretation?: InterpretationData;
}

const SLOT_CONFIG = [
  {
    id: "p1",
    name: "你目前的职业状态",
    meaning: "你现在在这份工作中的真实处境、心理状态和整体感受"
  },
  {
    id: "p2",
    name: "这份工作的优势",
    meaning: "这份工作目前能为你带来的支持、资源或正向价值"
  },
  {
    id: "p3",
    name: "这份工作的劣势",
    meaning: "让你感到消耗、受限，或长期可能产生压力的部分"
  },
  {
    id: "p4",
    name: "领导/上司对你的看法",
    meaning: "上级更可能如何看待你的能力、位置与发展潜力"
  },
  {
    id: "p5",
    name: "同事/下属对你的看法",
    meaning: "团队关系中，他人与你相处时的感受与态度"
  },
  {
    id: "p6",
    name: "个人成长进步空间",
    meaning: "如果你愿意投入精力，这份工作能否促进你的成长"
  },
  {
    id: "p7",
    name: "工作未来发展趋势",
    meaning: "在不做极端改变的前提下，这份工作可能的发展方向"
  }
];


export default function StayOrLeaveReading() {
  const router = useRouter();
  const { key } = router.query;
  
  const [result, setResult] = useState<StayOrLeaveResult | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const storageKey = (key as string) || 'career_spread_should_i_stay_v1';
    const rawData = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);

    if (!rawData) {
      setError('没有找到你的抽牌结果，请返回重新抽牌。');
      return;
    }

    try {
      const parsed = JSON.parse(rawData);
      setResult(parsed);
      if (parsed.interpretation) setInterpretation(parsed.interpretation);
    } catch (e) {
      setError('数据解析失败，请尝试重新抽牌。');
    }
  }, [router.isReady, key]);

  const fetchInterpretation = useCallback(async (cards: ShuffledTarotCard[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reading/career-stay-or-leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards, questionTitle: '这份工作是否值得继续做下去？' })
      });

      const data = await response.json();
      if (response.ok) {
        setInterpretation(data);
        if (result) {
          const updated = { ...result, interpretation: data };
          const storageKey = (router.query.key as string) || 'career_spread_should_i_stay_v1';
          localStorage.setItem(storageKey, JSON.stringify(updated));
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } else {
        setError(data.error || '生成解读失败');
      }
    } catch (err) {
      setError('网络异常，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [result, router.query.key]);

  useEffect(() => {
    if (result && !interpretation && !isLoading && !error) {
      fetchInterpretation(result.cards);
    }
  }, [result, interpretation, isLoading, error, fetchInterpretation]);

  if (error && !interpretation) {
    return (
      <div className="dark bg-[#191022] min-h-screen text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-6 text-white/60">{error}</p>
          <button onClick={() => router.push('/themed-readings/career-study/stay-or-leave/draw')} className="px-8 py-3 bg-primary rounded-xl font-bold">返回抽牌页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-[#191022] min-h-screen text-white font-display">
      <Head><title>职业发展全景解读 - Mystic Insights</title></Head>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#191022]/80 backdrop-blur-sm">
        <button onClick={() => router.push('/themed-readings/career-study')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm">返回</span>
        </button>
        <h2 className="text-base sm:text-lg font-bold tracking-widest uppercase">Interpretation</h2>
        <button 
          onClick={() => {
            if (confirm('确定要重新抽牌吗？当前结果将被清空。')) {
              const storageKey = (key as string) || 'career_spread_should_i_stay_v1';
              localStorage.removeItem(storageKey);
              sessionStorage.removeItem(storageKey);
              router.push('/themed-readings/career-study/stay-or-leave/draw');
            }
          }}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          <span className="text-xs font-medium">重新抽牌</span>
        </button>
      </header>

      <main className="px-4 py-8 sm:py-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-4xl font-black mb-4">这份工作是否值得继续做下去？</h1>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_15px_rgba(127,19,236,0.5)]"></div>
        </div>

        {result && (
          <div className="mb-16 bg-white/5 p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>
            <div className="scale-90 sm:scale-100 origin-center transition-transform group-hover:scale-[1.02] duration-500">
              <CareerDevelopmentSevenSlots
                cards={result.cards}
                isAnimating={Array(7).fill(false)}
                showLoadingText={false}
                forceFlipped={true}
                slotConfig={SLOT_CONFIG}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-20">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-16 h-16">
                  <svg className="animate-spin w-full h-full text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
                </div>
                <p className="text-primary/60 font-medium tracking-widest animate-pulse">正在链接灵感，整理你的职业档案...</p>
              </div>
            </motion.div>
          ) : interpretation ? (
            <motion.div key="content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
              
              {/* 整体解读总览 */}
              <section className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full"></div>
                <h3 className="text-primary font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">auto_awesome</span> 现状深度复盘
                </h3>
                <p className="text-white/90 leading-relaxed text-lg">{interpretation.overview}</p>
              </section>

              {/* 深度解读 */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-black tracking-widest">深度解读</h2>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                
                <div className="space-y-6">
                  {interpretation.cardDetails.map((detail, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-8 hover:bg-white/[0.08] transition-all duration-300">
                      <div className="flex-shrink-0 flex flex-col items-center gap-4">
                        <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/20">
                          <img 
                            src={result?.cards[idx].image} 
                            alt={detail.cardName} 
                            className={`w-full h-full object-cover ${detail.orientation === '逆位' ? 'rotate-180' : ''}`}
                          />
                        </div>
                        <span className="text-[10px] text-white/40 font-bold tracking-widest px-3 py-1 bg-white/5 rounded-full uppercase">
                          {detail.slotName}
                        </span>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-bold text-primary">{detail.cardName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${detail.orientation === '逆位' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                            {detail.orientation}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed text-base">{detail.interpretation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 行动建议 */}
              <section className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl">
                <h3 className="text-primary font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">rocket_launch</span> 你可以怎么做
                </h3>
                <ul className="space-y-4">
                  {interpretation.actionSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-4 text-white/80 group">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                      <span className="text-lg">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 现实提醒 */}
              <section className="bg-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden text-center">
                 <h3 className="text-primary/80 font-bold text-lg mb-4">现实提醒</h3>
                 <p className="text-white/70 italic leading-relaxed">“{interpretation.realityReminder}”</p>
              </section>

              {/* 底部按钮组 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 border-t border-white/5">
                <button 
                  onClick={() => router.push('/')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">home</span>
                  <span>返回首页</span>
                </button>
                <button 
                  onClick={() => router.push('/themed-readings/career-study')}
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-primary rounded-xl hover:shadow-[0_0_20px_rgba(127,19,236,0.4)] transition-all text-white font-bold"
                >
                  <span>返回事业&学业占卜</span>
                </button>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .dark { --primary: #7f13ec; }
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');
      `}</style>
    </div>
  );
}
