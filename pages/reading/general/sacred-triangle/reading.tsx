import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
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
  reading?: ReadingResult;
}

interface ReadingResult {
  overall: {
    summary: string;
    priority: string;
  };
  cards: {
    index: number;
    positionMeaning: string;
    role: string;
    interpretation: string;
  }[];
  reminder: string;
}

const STORAGE_KEY = 'general_sacred_triangle_result';

export default function SacredTriangleReadingPage() {
  const router = useRouter();
  const [result, setResult] = useState<SacredTriangleResult | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 加载抽牌结果
    const savedResult = localStorage.getItem(STORAGE_KEY);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.cards && parsed.cards.length === 3) {
          setResult(parsed);
          setQuestion(parsed.question || '');
          // 如果已经有解读结果，直接使用
          if (parsed.reading) {
            setReading(parsed.reading);
          }
        } else {
          setError('抽牌数据不完整，请重新抽牌');
        }
      } catch (e) {
        console.error('Failed to parse saved result:', e);
        setError('加载数据失败，请返回重新抽牌');
      }
    } else {
      // 如果没有结果，跳转回问题输入页
      router.replace('/reading/general/sacred-triangle/question');
      return;
    }
  }, [router]);

  const generateReading = async () => {
    if (!result || result.cards.length !== 3) return;

    setLoading(true);
    setError(null); // 清除之前的错误状态

    try {
      const response = await fetch('/api/reading/sacred-triangle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: result.cards,
          question: question || '',
        }),
      });

      if (!response.ok) {
        throw new Error('生成解读失败，请重试');
      }

      const data = await response.json();
      setReading(data);
      setError(null); // 成功后确保清除错误状态

      // 保存解读结果到 localStorage
      const updatedResult = {
        ...result,
        reading: data,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResult));
    } catch (err: any) {
      console.error('Error generating reading:', err);
      setError(err.message || '出错了，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 自动生成解读
  useEffect(() => {
    if (result && result.cards.length === 3 && !reading && !loading && !error) {
      generateReading();
    }
  }, [result]);

  const handleReturn = () => {
    router.push('/reading/general');
  };

  const handleReset = () => {
    if (!confirm('确定要重新抽牌吗？当前结果将被清空。')) return;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('general_sacred_triangle_question');
    }
    
    router.replace('/reading/general/sacred-triangle/question');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <p className="text-lg mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (error.includes('不完整') || error.includes('加载数据失败')) {
                  router.push('/reading/general/sacred-triangle/question');
                } else {
                  setError(null);
                  generateReading();
                }
              }}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7f13ec' }}
            >
              {error.includes('不完整') || error.includes('加载数据失败') ? '去抽牌' : '重新生成'}
            </button>
            <button
              onClick={handleReturn}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              返回牌阵列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>圣三角牌阵 · 解读 | Mystic Insights</title>
        <meta name="description" content="查看你的塔罗牌解读结果" />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={handleReturn}
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
            onClick={handleReset}
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
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                圣三角牌阵 · 解读
              </h1>
            </motion.div>

            {/* 问题展示区域 */}
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
                    <p className="text-white/60 text-xs font-medium mb-1">你的问题</p>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {question || '你没有写下具体问题，我们将以你当下的能量趋势进行解读'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 卡牌展示区域 */}
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
                    <TriangleThreeCardSlots
                      cards={result.cards}
                      isAnimating={[false, false, false]}
                      showLoadingText={false}
                      forceFlipped={true}
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
                      {loading ? '正在生成解读' : '下滑查看解读内容'}
                    </span>
                    <span className="material-symbols-outlined text-white/20 text-xl">
                      keyboard_double_arrow_down
                    </span>
                  </motion.div>
                </div>
              </motion.section>
            )}

            {/* 解读内容区域 */}
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
                  <h3 className="text-xl font-bold mb-2">正在为你解读牌面...</h3>
                  <p className="text-white/40 max-w-xs mx-auto text-sm">
                    AI 正在根据你的牌阵进行深度分析，请稍候
                  </p>
                </motion.div>
              ) : reading ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 max-w-3xl mx-auto"
                >
                  {/* 整体解读 */}
                  <section className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                    <div className="relative bg-[#1a1028] border border-white/10 rounded-2xl p-6 sm:p-10">
                      <h3 className="text-xl font-bold flex items-center gap-3 mb-6 text-purple-300">
                        <span className="material-symbols-outlined">auto_awesome</span>
                        整体解读
                      </h3>
                      <p className="text-white/80 leading-relaxed text-lg mb-6">
                        {reading.overall.summary}
                      </p>
                      {/* 优先级建议 */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <span className="material-symbols-outlined text-primary text-lg mt-0.5 flex-shrink-0">
                          trending_up
                        </span>
                        <div>
                          <p className="text-primary/80 text-xs font-semibold mb-1 uppercase tracking-wider">优先建议</p>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {reading.overall.priority}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 分牌解读 */}
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
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex flex-col md:flex-row gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
                        >
                          {/* 卡牌图片 */}
                          <div className="w-full md:w-32 flex-shrink-0 flex flex-col items-center">
                            <div className="relative w-24 h-40 mb-3 group overflow-hidden rounded-lg">
                              {cardData?.image ? (
                                <div
                                  className="w-full h-full"
                                  style={{
                                    transform:
                                      cardData.orientation === 'reversed'
                                        ? 'rotate(180deg)'
                                        : 'none',
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
                                  <span className="material-symbols-outlined text-white/20">
                                    image
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-white/50 text-center uppercase tracking-wider">
                              第{cardReading.index}张
                            </p>
                            <p className="text-[9px] text-white/40 text-center mt-1">
                              {cardReading.role}
                            </p>
                          </div>

                          {/* 解读文本 */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span
                                className="text-lg font-bold text-primary"
                                style={{ color: '#a855f7' }}
                              >
                                {cardData?.name}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${
                                  cardData?.orientation === 'reversed'
                                    ? 'border-orange-500/50 text-orange-400'
                                    : 'border-emerald-500/50 text-emerald-400'
                                }`}
                              >
                                {cardData?.orientation === 'reversed' ? '逆位' : '正位'}
                              </span>
                            </div>
                            <p className="text-white/80 leading-relaxed text-base">
                              {cardReading.interpretation}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* 收尾提醒 */}
                  <div className="text-center py-10 space-y-8">
                    <div className="relative inline-block px-8 py-4">
                      <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                      <p className="relative z-10 text-lg font-medium text-purple-200/80 italic leading-relaxed">
                        「{reading.reminder}」
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
                        <span className="material-symbols-outlined text-sm">explore</span>
                        浏览更多牌阵
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
