import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import TenCardsReconciliationSlots from '../../../../components/fortune/TenCardsReconciliationSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 结果数据接口
interface ReconciliationResult {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
}

// 深度解读数据接口
interface DeepReading {
  sections: Array<{
    slotKey: string;
    title: string;
    text: string;
  }>;
  summary: {
    title: string;
    text: string;
  };
  actions: Array<{
    text: string;
  }>;
}

// LocalStorage keys
const STORAGE_KEY = 'reconciliation_result';
const DEEP_READING_KEY = 'reconciliation_deep_reading';

// 牌位配置
const SLOT_CONFIG = [
  { id: "p1", name: "这段关系是如何走散的", meaning: "这段关系当初真正分开的原因" },
  { id: "p2", name: "你当前的情绪状态与纠结来源", meaning: "你当前的情绪状态与纠结来源" },
  { id: "p3", name: "前任目前的真实状态", meaning: "TA现在对这段关系的真实立场" },
  { id: "p4", name: "你内心对复合的感受", meaning: "你内心深处对复合的真实想法" },
  { id: "p5", name: "前任内心对复合的感受", meaning: "TA对复合这件事的真实态度" },
  { id: "p6", name: "你们之间最大的阻碍是什么", meaning: "当前最难跨越的核心问题" },
  { id: "p7", name: "对你有利的帮助或转机", meaning: "可能出现的支持或转机" },
  { id: "p8", name: "被你忽略的重要因素", meaning: "被忽略但重要的变量" },
  { id: "p9", name: "你需要做出的选择", meaning: "这段关系对你提出的最终课题" },
  { id: "guide", name: "指引牌", meaning: "这组牌想提醒你的核心问题" }
];

export default function ReconciliationResultPage() {
  const router = useRouter();
  const [savedResult, setSavedResult] = useState<ReconciliationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDeep, setIsGeneratingDeep] = useState(false);
  const [deepReading, setDeepReading] = useState<DeepReading | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 从 localStorage 读取结果
  const loadResult = (): ReconciliationResult | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load result:', error);
      return null;
    }
  };

  // 缓存深度解读到 localStorage
  const saveDeepReading = (data: DeepReading) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DEEP_READING_KEY, JSON.stringify(data));
  };

  // 从 localStorage 读取深度解读
  const loadDeepReading = (): DeepReading | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(DEEP_READING_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load deep reading:', error);
      return null;
    }
  };

  // 自动生成深度解读的函数
  const generateDeepReading = async (result: ReconciliationResult) => {
    setIsGeneratingDeep(true);
    setError(null);

    try {
      // 准备发送给 API 的数据
      const cardsData = result.cards.map((card, index) => ({
        slotName: SLOT_CONFIG[index].name,
        cardName: card.name,
        isReversed: card.orientation === 'reversed',
        keywords: card.keywords,
      }));

      const response = await fetch('/api/reconciliation-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: cardsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成解读失败');
      }

      const data: DeepReading = await response.json();
      setDeepReading(data);
      saveDeepReading(data);
    } catch (err: any) {
      console.error('Failed to generate deep reading:', err);
      setError(err.message || '生成解读失败，请稍后重试');
    } finally {
      setIsGeneratingDeep(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const result = loadResult();
    if (!result) {
      // 没有结果，返回抽牌页
      router.replace('/themed-readings/love/reconciliation/draw');
      return;
    }

    setSavedResult(result);
    
    // 尝试加载已保存的深度解读
    const savedDeepReading = loadDeepReading();
    if (savedDeepReading) {
      setDeepReading(savedDeepReading);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      generateDeepReading(result);
    }
  }, [router]);

  const handleReturnToList = () => {
    router.push('/themed-readings/love');
  };

  const handleDrawAgain = () => {
    if (confirm('确定要重新抽牌吗？当前结果将被清空。')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DEEP_READING_KEY);
      router.push('/themed-readings/love/reconciliation/draw');
    }
  };

  if (isLoading || !savedResult) {
    return (
      <div className="min-h-screen bg-[#191022] flex items-center justify-center">
        <div className="text-white/60 animate-pulse text-lg tracking-widest font-light">正在开启时空之门...</div>
      </div>
    );
  }

  return (
    <div className="dark">
      <Head>
        <title>复合的可能性 - 解读结果</title>
        <meta name="description" content="深度解读你们的重新联结之路" />
      </Head>

      <div className="font-display bg-[#191022] min-h-screen text-white pb-20">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 py-3 bg-[#191022]/80 backdrop-blur-sm">
          <button onClick={handleReturnToList} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-medium">返回</span>
          </button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Mystic Insights</h2>
          <button onClick={handleDrawAgain} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">重新抽牌</span>
          </button>
        </header>

        <main className="px-4 py-8 max-w-5xl mx-auto">
          {/* 牌阵展示区 */}
          <section className="mb-12">
            <div className="text-center mb-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80 mb-3 block">Reconciliation Potential Spread</span>
              <h1 className="text-3xl sm:text-4xl font-black mb-4">复 合 的 可 能 性</h1>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full shadow-[0_0_15px_#7f13ec]"></div>
            </div>

            <TenCardsReconciliationSlots
              cards={savedResult.cards}
              isAnimating={Array(10).fill(false)}
              showLoadingText={false}
              forceFlipped={true}
              slotConfig={SLOT_CONFIG.map(s => ({ id: s.id, name: s.name, meaning: s.meaning }))}
            />
          </section>

          {/* 解读内容区 */}
          <section className="space-y-8">
            {isGeneratingDeep && !deepReading && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                <p className="text-primary font-medium tracking-widest">正在深度链接潜意识...</p>
                <p className="text-white/40 text-sm mt-2">这通常需要 20-40 秒，请静心等待</p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  onClick={() => generateDeepReading(savedResult)}
                  className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full text-sm transition-colors"
                >
                  重试生成
                </button>
              </div>
            )}

            {deepReading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                {/* 灵魂一问 / 核心总结 */}
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/30 overflow-hidden group">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                  <h3 className="text-primary text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    {deepReading.summary.title === '姐姐的真心话' ? '治愈寄语' : deepReading.summary.title}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold leading-tight italic">
                    「{deepReading.summary.text}」
                  </p>
                </div>

                {/* 各个牌位详细解读 */}
                <div className="space-y-8">
                  {deepReading.sections.map((section) => {
                    // 排除指引牌，因为它在下面有专门的特殊展示
                    if (section.slotKey === 'guide') return null;

                    // 通过 slotKey 找到对应的配置索引，确保牌、文案、位置完全对应
                    const configIndex = SLOT_CONFIG.findIndex(s => s.id === section.slotKey);
                    const card = savedResult.cards[configIndex];
                    const config = SLOT_CONFIG[configIndex];
                    
                    if (!card || !config) return null;

                    return (
                      <motion.div 
                        key={section.slotKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: configIndex * 0.1 }}
                        className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group"
                      >
                        {/* 牌位头部信息 */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="text-primary font-bold text-lg">{configIndex + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                              {config.name}
                            </h4>
                            <p className="text-white/40 text-sm mt-1">
                              {config.meaning}
                            </p>
                          </div>
                        </div>

                        {/* 卡牌与解读内容展示 */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          {/* 左侧：卡牌视觉 */}
                          <div className="flex-shrink-0 mx-auto md:mx-0 text-center">
                            <div className="relative w-28 h-44 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl group-hover:border-primary/50 transition-colors">
                              <img
                                src={card.image}
                                alt={card.name}
                                className="w-full h-full object-cover"
                                style={{
                                  backgroundColor: 'white',
                                  transform: card.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                                }}
                              />
                            </div>
                            <div className="mt-3">
                              <p className="text-white font-bold text-sm">{card.name}</p>
                              <p className={`text-[10px] mt-1 font-medium px-2 py-0.5 rounded-full inline-block ${
                                card.orientation === 'reversed' 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {card.orientation === 'reversed' ? '逆位 Reversed' : '正位 Upright'}
                              </p>
                            </div>
                          </div>

                          {/* 右侧：文字解读 */}
                          <div className="flex-1 w-full">
                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 sm:p-6 group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all">
                              <div className="prose prose-invert max-w-none">
                                <p className="text-white/80 leading-relaxed text-base">
                                  {section.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 指引牌 - 特别显示 */}
                {(() => {
                  const guideSection = deepReading.sections.find(s => s.slotKey === 'guide');
                  const guideCard = savedResult.cards[9];
                  const guideConfig = SLOT_CONFIG[9];

                  if (!guideSection || !guideCard) return null;

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group relative overflow-hidden"
                    >
                      {/* 牌位头部信息 */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_10px_rgba(127,19,236,0.3)]">
                          <span className="material-symbols-outlined text-primary text-2xl">star</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                            {guideConfig.name}
                          </h4>
                          <p className="text-white/40 text-sm mt-1">
                            {guideConfig.meaning}
                          </p>
                        </div>
                      </div>

                      {/* 卡牌与解读内容展示 */}
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* 左侧：卡牌视觉 */}
                        <div className="flex-shrink-0 mx-auto md:mx-0 text-center">
                          <div className="relative w-28 h-44 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl group-hover:border-primary/50 transition-colors bg-white">
                            <img
                              src={guideCard.image}
                              alt={guideCard.name}
                              className="w-full h-full object-cover"
                              style={{
                                transform: guideCard.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                              }}
                            />
                          </div>
                          <div className="mt-3">
                            <p className="text-white font-bold text-sm">{guideCard.name}</p>
                            <p className={`text-[10px] mt-1 font-medium px-2 py-0.5 rounded-full inline-block ${
                              guideCard.orientation === 'reversed' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {guideCard.orientation === 'reversed' ? '逆位 Reversed' : '正位 Upright'}
                            </p>
                          </div>
                        </div>

                        {/* 右侧：文字解读 */}
                        <div className="flex-1 w-full">
                          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 sm:p-6 group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all">
                            <div className="prose prose-invert max-w-none">
                              <p className="text-white/80 leading-relaxed text-base italic">
                                {guideSection.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* 行动建议 */}
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <span className="text-primary">✨</span>
                    接下来的行动建议
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {deepReading.actions.map((action, idx) => (
                      <div key={idx} className="relative p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                        <span className="text-3xl mb-4 opacity-50">0{idx + 1}</span>
                        <p className="text-sm text-white/80">{action.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                  <button 
                    onClick={handleDrawAgain}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-primary transition-all text-sm font-medium tracking-widest"
                  >
                    重新抽牌
                  </button>
                  <button 
                    onClick={handleReturnToList}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-primary text-white hover:bg-primary/80 transition-all text-sm font-bold tracking-widest shadow-[0_0_20px_rgba(127,19,236,0.3)]"
                  >
                    返回爱情占卜
                  </button>
                </div>
                <div className="text-center mt-8">
                  <p className="text-xs sm:text-sm text-white/40 tracking-widest font-light italic">
                    “ 塔罗解读仅供参考，请保持清醒，主宰你的人生 ”
                  </p>
                </div>
              </motion.div>
            )}
          </section>
        </main>
      </div>

      <style jsx global>{`
        .dark { --primary: #7f13ec; }
      `}</style>
    </div>
  );
}

