import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CelticCrossSlots from '../../../../components/fortune/CelticCrossSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';
import { useMembership } from '../../../../hooks/useMembership';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface CelticCrossResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
}

interface ReadingResult {
  overall: string;
  cards: {
    position: number;
    positionTitle: string;
    interpretation: string;
  }[];
  actionAdvice?: string; // 仅有问题时才有
  reminder: string;
}

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_celtic_cross_question';
const RESULT_STORAGE_KEY = 'general_celtic_cross_draw_result';

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

export default function CelticCrossReadingPage() {
  const router = useRouter();
  const [result, setResult] = useState<CelticCrossResult | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 获取会员状态
  const { isMember } = useMembership();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 加载抽牌结果
    const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.cards && parsed.cards.length === 10) {
          setResult(parsed);
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
      router.replace('/reading/general/celtic-cross/question');
      return;
    }

    // 加载问题
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
    if (savedQuestion) {
      setQuestion(savedQuestion);
    }
  }, [router]);

  const generateReading = async () => {
    if (!result || result.cards.length !== 10) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reading/celtic-cross', {
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

  // 自动生成解读（暂时不检查会员状态，方便测试）
  useEffect(() => {
    if (result && result.cards.length === 10 && !reading && !loading && !error) {
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
    }
    
    router.replace('/reading/general/celtic-cross/question');
  };

  // 会员门槛提示
  // 暂时注释掉会员检查，方便测试
  // if (!isMember) {
  //   return (
  //     <>
  //       <Head>
  //         <title>凯尔特十字牌阵 · 解读 | Mystic Insights</title>
  //         <meta name="description" content="查看你的塔罗牌解读结果" />
  //       </Head>

  //       <div className="min-h-screen bg-[#0f0f23] text-white">
  //         {/* 背景装饰 */}
  //         <div className="fixed inset-0 overflow-hidden pointer-events-none">
  //           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
  //           <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
  //         </div>

  //         {/* 顶部导航 */}
  //         <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
  //           <button
  //             onClick={() => router.push('/reading/general/celtic-cross/reveal')}
  //             className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
  //           >
  //             <span className="material-symbols-outlined">arrow_back</span>
  //             <span className="text-sm font-medium">返回</span>
  //           </button>

  //           <div className="flex items-center gap-4">
  //             <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
  //               Mystic Insights
  //             </h2>
  //           </div>

  //           <div className="w-20" />
  //         </header>

  //         {/* 会员提示主内容 */}
  //         <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
  //           <div className="mx-auto max-w-2xl">
  //             <motion.div
  //               initial={{ opacity: 0, y: 20 }}
  //               animate={{ opacity: 1, y: 0 }}
  //               className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 text-center"
  //             >
  //               <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
  //                 <span className="material-symbols-outlined text-amber-400 text-4xl">
  //                   workspace_premium
  //                 </span>
  //               </div>
                
  //               <h1 className="text-3xl font-bold mb-4">需要开通会员</h1>
                
  //               <p className="text-white/70 text-lg leading-relaxed mb-8">
  //                 凯尔特十字牌阵的深度解读是会员专属功能。开通会员后，你将获得由 AI 生成的完整解读，包括整体分析、10张牌逐一解析和行动建议。
  //               </p>

  //               <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
  //                 <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
  //                   <span className="material-symbols-outlined text-primary text-xl">
  //                     check_circle
  //                   </span>
  //                   会员解读包含
  //                 </h3>
  //                 <ul className="space-y-2 text-white/70 text-sm">
  //                   <li className="flex items-start gap-2">
  //                     <span className="text-primary mt-1">•</span>
  //                     <span>整体解读：综合分析 10 张牌的能量趋势与深层含义</span>
  //                   </li>
  //                   <li className="flex items-start gap-2">
  //                     <span className="text-primary mt-1">•</span>
  //                     <span>逐张解析：每张牌在其牌位上的具体含义与启示</span>
  //                   </li>
  //                   <li className="flex items-start gap-2">
  //                     <span className="text-primary mt-1">•</span>
  //                     <span>行动建议：可执行的具体建议与现实提醒（有问题时）</span>
  //                   </li>
  //                   <li className="flex items-start gap-2">
  //                     <span className="text-primary mt-1">•</span>
  //                     <span>问题模式：结合你的问题给出更贴合的解读</span>
  //                   </li>
  //                 </ul>
  //               </div>

  //               <div className="flex flex-col sm:flex-row gap-4">
  //                 <button
  //                   onClick={() => router.push('/reading/general/celtic-cross/reveal')}
  //                   className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/10"
  //                 >
  //                   返回查看牌面
  //                 </button>
  //                 <button
  //                   onClick={() => {
  //                     // TODO: 跳转到会员开通页面
  //                     alert('会员系统即将上线，敬请期待！');
  //                   }}
  //                   className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)]"
  //                   style={{ backgroundColor: '#7f13ec' }}
  //                 >
  //                   <span className="flex items-center justify-center gap-2">
  //                     <span className="material-symbols-outlined text-xl">star</span>
  //                     开通会员
  //                   </span>
  //                 </button>
  //               </div>

  //               <p className="mt-6 text-white/40 text-xs">
  //                 会员系统即将上线，敬请期待
  //               </p>
  //             </motion.div>
  //           </div>
  //         </main>
  //       </div>
  //     </>
  //   );
  // }

  // 错误态
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
                  router.push('/reading/general/celtic-cross/question');
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

  // 正常解读页面
  return (
    <>
      <Head>
        <title>凯尔特十字牌阵 · 解读 | Mystic Insights</title>
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
                CELTIC CROSS SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                凯尔特十字牌阵解读
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
                      {question || '你没有填写具体问题，我们将为你做一次通用解读'}
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

                  <div className="max-w-6xl mx-auto">
                    <CelticCrossSlots
                      cards={result.cards}
                      isAnimating={Array(10).fill(false)}
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
                      <p className="text-white/80 leading-relaxed text-lg">
                        {reading.overall}
                      </p>
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
                          transition={{ delay: idx * 0.05 }}
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
                                    alt={getChineseCardName(cardData.name)}
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
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm mb-2">
                              {cardReading.position}
                            </div>
                            <p className="text-[10px] font-bold text-white/50 text-center uppercase tracking-wider">
                              {cardReading.positionTitle}
                            </p>
                          </div>

                          {/* 解读文本 */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <span
                                className="text-lg font-bold text-primary"
                                style={{ color: '#a855f7' }}
                              >
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
                            <p className="text-white/80 leading-relaxed text-base">
                              {cardReading.interpretation}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* 行动建议（仅有问题时显示） */}
                  {reading.actionAdvice && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 sm:p-8">
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-purple-300">
                        <span className="material-symbols-outlined">lightbulb</span>
                        行动建议
                      </h3>
                      <p className="text-white/80 leading-relaxed text-base">
                        {reading.actionAdvice}
                      </p>
                    </div>
                  )}

                  {/* 底部理性提醒 */}
                  <div className="text-center py-10 space-y-8">
                    <div className="relative inline-block px-8 py-4">
                      <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                      <p className="relative z-10 text-xl font-medium text-purple-200 italic leading-relaxed">
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
