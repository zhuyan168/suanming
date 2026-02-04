import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import TwoChoicesSlots from '../../../../components/fortune/TwoChoicesSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface TwoChoicesResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
  optionA?: string;
  optionB?: string;
  reading?: ReadingResult;
}

interface CardReading {
  position: number;
  position_name: string;
  card_name_cn: string;
  orientation: string;
  keywords: string[];
  interpretation: string;
}

interface ReadingResult {
  mode: 'general' | 'question';
  overall_reading: string;
  cards: CardReading[];
  choice_comparison: {
    option_a_analysis: string;
    option_b_analysis: string;
    decision_guidance: string;
  };
  rational_reminder: string;
}

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_two_choices_question';
const OPTION_A_STORAGE_KEY = 'general_two_choices_option_a';
const OPTION_B_STORAGE_KEY = 'general_two_choices_option_b';
const RESULT_STORAGE_KEY = 'general_two_choices_draw_result';

// 塔罗牌英文名称到中文名称的映射
const getChineseCardName = (englishName: string): string => {
  const nameMap: { [key: string]: string } = {
    // Major Arcana
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
    
    // Cups - 圣杯
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
    
    // Pentacles - 星币
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
    
    // Swords - 宝剑
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
    
    // Wands - 权杖
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

export default function TwoChoicesReadingPage() {
  const router = useRouter();
  const [result, setResult] = useState<TwoChoicesResult | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 加载抽牌结果
    const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.cards && parsed.cards.length === 5) {
          setResult(parsed);
          
          // 加载问题和选项
          const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
          const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY);
          const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY);
          
          if (savedQuestion) setQuestion(savedQuestion);
          if (savedOptionA) setOptionA(savedOptionA);
          if (savedOptionB) setOptionB(savedOptionB);
          
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
      router.replace('/reading/general/two-choices/question');
      return;
    }
  }, [router]);

  const generateReading = async () => {
    if (!result || result.cards.length !== 5) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reading/two-choices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: result.cards,
          question: question || '',
          optionA: optionA || '',
          optionB: optionB || '',
        }),
      });

      if (!response.ok) {
        throw new Error('生成解读失败，请重试');
      }

      const data = await response.json();
      setReading(data);
      setError(null);

      // 保存解读结果到 localStorage
      const updatedResult = {
        ...result,
        reading: data,
      };
      localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(updatedResult));
    } catch (err: any) {
      console.error('Error generating reading:', err);
      setError(err.message || '出错了，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 自动生成解读
  useEffect(() => {
    if (result && result.cards.length === 5 && !reading && !loading && !error) {
      generateReading();
    }
  }, [result]);

  const handleReturn = () => {
    router.push('/reading/general');
  };

  const handleReset = () => {
    if (!confirm('确定要重新抽牌吗？当前结果将被清空。')) return;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
      localStorage.removeItem(QUESTION_STORAGE_KEY);
      localStorage.removeItem(OPTION_A_STORAGE_KEY);
      localStorage.removeItem(OPTION_B_STORAGE_KEY);
    }
    
    router.replace('/reading/general/two-choices/question');
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
                  router.push('/reading/general/two-choices/question');
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
        <title>二选一牌阵 · 解读 | Mystic Insights</title>
        <meta name="description" content="查看你的二选一牌阵解读结果" />
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
                TWO CHOICES SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                二选一牌阵 · 解读
              </h1>
            </motion.div>

            {/* 问题展示区域（无框） */}
            {question && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 text-center"
              >
                <p className="text-white/60 text-sm mb-2">你的问题</p>
                <p className="text-white/90 text-lg">
                  {question}
                </p>
              </motion.div>
            )}

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
                    <TwoChoicesSlots
                      cards={result.cards}
                      isAnimating={Array(5).fill(false)}
                      showLoadingText={false}
                      forceFlipped={true}
                      optionA={optionA || 'A'}
                      optionB={optionB || 'B'}
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
                      <p className="text-white/80 leading-relaxed text-lg">
                        {reading.overall_reading}
                      </p>
                    </div>
                  </section>

                  {/* 五张牌逐张解读 */}
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
                      const isCurrentState = idx === 0;
                      const isOptionA = idx === 1 || idx === 2;
                      const isOptionB = idx === 3 || idx === 4;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex flex-col md:flex-row gap-6 rounded-2xl p-6 hover:bg-white/8 transition-colors border ${
                            isCurrentState 
                              ? 'bg-yellow-500/5 border-yellow-500/20' 
                              : isOptionA 
                                ? 'bg-blue-500/5 border-blue-500/20' 
                                : 'bg-green-500/5 border-green-500/20'
                          }`}
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
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              isCurrentState 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : isOptionA 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-green-500/20 text-green-400'
                            }`}>
                              {idx + 1}
                            </div>
                            <p className="text-[10px] text-white/40 text-center mt-2 leading-tight">
                              {cardReading.position_name}
                            </p>
                          </div>

                          {/* 解读文本 */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-lg font-bold text-primary" style={{ color: '#a855f7' }}>
                                {getChineseCardName(cardData?.name || '')}
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
                            
                            {/* 关键词 */}
                            <div className="flex flex-wrap gap-2">
                              {cardReading.keywords.map((keyword, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded-lg text-xs ${
                                    isCurrentState 
                                      ? 'bg-yellow-500/10 text-yellow-400/80' 
                                      : isOptionA 
                                        ? 'bg-blue-500/10 text-blue-400/80' 
                                        : 'bg-green-500/10 text-green-400/80'
                                  }`}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            
                            <p className="text-white/80 leading-relaxed text-base">
                              {cardReading.interpretation}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* A/B 对比与选择建议 */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4 px-4">
                      <div className="h-px flex-1 bg-white/10" />
                      <h3 className="text-xl font-black text-white/50 tracking-widest uppercase">
                        Choice Comparison
                      </h3>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* 选项 A 分析 */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold">
                          选项 A
                        </span>
                        {optionA && <span className="text-white/70 text-sm">{optionA}</span>}
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        {reading.choice_comparison.option_a_analysis}
                      </p>
                    </div>

                    {/* 选项 B 分析 */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold">
                          选项 B
                        </span>
                        {optionB && <span className="text-white/70 text-sm">{optionB}</span>}
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        {reading.choice_comparison.option_b_analysis}
                      </p>
                    </div>

                    {/* 选择建议 */}
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-purple-400">
                          psychology
                        </span>
                        <h4 className="text-purple-300 font-bold">选择建议</h4>
                      </div>
                      <p className="text-white/80 leading-relaxed">
                        {reading.choice_comparison.decision_guidance}
                      </p>
                    </div>
                  </section>

                  {/* 理性提醒 */}
                  <div className="text-center py-10 space-y-8">
                    <div className="relative inline-block px-8 py-4">
                      <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                      <p className="relative z-10 text-lg font-medium text-purple-200/80 italic leading-relaxed">
                        「{reading.rational_reminder}」
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
