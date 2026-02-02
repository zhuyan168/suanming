import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import TriangleThreeCardSlots from '../../../../components/fortune/TriangleThreeCardSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
  positionMeaning: string;
}

interface SacredTriangleResult {
  sessionId: string;
  timestamp: number;
  question: string;
  cards: ShuffledTarotCard[];
}

const STORAGE_KEY = 'general_sacred_triangle_result';

const loadSacredTriangleResult = (): SacredTriangleResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load sacred triangle result:', error);
    return null;
  }
};

export default function SacredTriangleResult() {
  const router = useRouter();
  const [result, setResult] = useState<SacredTriangleResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = loadSacredTriangleResult();
    if (!saved) {
      router.push('/reading/general/sacred-triangle/question');
      return;
    }

    setResult(saved);
    setIsLoading(false);
  }, [router]);

  const handleStartInterpretation = () => {
    alert('解读功能即将上线，敬请期待！');
  };

  const handleRedraw = () => {
    if (!confirm('确定要重新占卜吗？当前结果将被清空。')) return;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('general_sacred_triangle_question');
    }
    router.push('/reading/general/sacred-triangle/question');
  };

  const handleBack = () => {
    router.push('/reading/general');
  };

  if (isLoading || !result) {
    return (
      <div className="min-h-screen bg-[#191022] flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  const displayQuestion = result.question.trim() 
    ? result.question 
    : '你没有写下具体问题，我们将以你当下的能量趋势进行解读';

  return (
    <>
      <Head>
        <title>圣三角牌阵 - 抽牌结果 | Mystic Insights</title>
        <meta name="description" content="查看你的圣三角牌阵抽牌结果" />
      </Head>

      <div className="min-h-screen bg-[#191022] text-white">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#191022]/80 backdrop-blur-sm">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">返回</span>
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Mystic Insights
            </h2>
          </div>

          <button
            onClick={handleRedraw}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">重新占卜</span>
          </button>
        </header>

        {/* 主内容 */}
        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-5xl">
            {/* 标题区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                SACRED TRIANGLE SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-6">
                圣三角牌阵
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                从过去、现在到未来的指引
              </p>
            </motion.div>

            {/* 问题显示卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">
                  psychology
                </span>
                <div className="flex-1">
                  <h3 className="text-white/90 font-semibold mb-2">你的问题</h3>
                  <p className={`${result.question.trim() ? 'text-white' : 'text-white/60 italic'} text-base leading-relaxed`}>
                    {displayQuestion}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 卡牌展示 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <TriangleThreeCardSlots
                cards={result.cards}
                isAnimating={[false, false, false]}
                showLoadingText={false}
                forceFlipped={true}
              />
            </motion.div>

            {/* 卡牌信息展示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {result.cards.map((card, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-bold text-lg">卡位 {index + 1}</span>
                  </div>
                  <h4 className="text-white font-semibold mb-1 text-sm">{card.name}</h4>
                  <p className="text-white/60 text-xs mb-2">
                    {card.orientation === 'upright' ? '正位' : '逆位'}
                  </p>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {card.orientation === 'upright' ? card.upright : card.reversed}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartInterpretation}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)]"
                style={{ backgroundColor: '#7f13ec' }}
              >
                开始解读
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedraw}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg transition-all duration-300 hover:border-white/40 hover:bg-white/5"
              >
                重新占卜
              </motion.button>
            </motion.div>

            {/* 底部提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-8 flex justify-center"
            >
              <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">
                  auto_awesome
                </span>
                <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                  占卜结果已保存，你可以随时返回查看或重新占卜
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
