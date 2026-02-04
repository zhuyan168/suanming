import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import TwoChoicesSlots from '../../../../components/fortune/TwoChoicesSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

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

// LocalStorage Keys
const QUESTION_STORAGE_KEY = 'general_two_choices_question';
const OPTION_A_STORAGE_KEY = 'general_two_choices_option_a';
const OPTION_B_STORAGE_KEY = 'general_two_choices_option_b';
const RESULT_STORAGE_KEY = 'general_two_choices_draw_result';

// 结果数据接口
interface TwoChoicesResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
  optionA?: string;
  optionB?: string;
}

// 从 localStorage 读取结果
const loadResult = (): TwoChoicesResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load two choices result:', error);
    return null;
  }
};

// 牌位名称（按顺序1-5）
const POSITION_NAMES = [
  '我目前所处的状态',
  '选择 A 时我会经历的状态',
  '选择 A 可能带来的发展',
  '选择 B 时我会经历的状态',
  '选择 B 可能带来的发展',
];

export default function TwoChoicesResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<TwoChoicesResult | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 加载抽牌结果
    const saved = loadResult();
    if (!saved) {
      // 如果没有结果，跳转回问题输入页
      router.replace('/reading/general/two-choices/question');
      return;
    }
    
    setResult(saved);

    // 加载问题和选项
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
    const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY);
    const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY);
    
    if (savedQuestion) setQuestion(savedQuestion);
    if (savedOptionA) setOptionA(savedOptionA);
    if (savedOptionB) setOptionB(savedOptionB);
  }, [router]);

  const handleRedraw = () => {
    if (!confirm('确定要重新占卜吗？当前结果将被清空。')) return;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
      localStorage.removeItem(QUESTION_STORAGE_KEY);
      localStorage.removeItem(OPTION_A_STORAGE_KEY);
      localStorage.removeItem(OPTION_B_STORAGE_KEY);
    }
    
    router.push('/reading/general/two-choices/question');
  };

  const handleStartReading = () => {
    router.push('/reading/general/two-choices/reading');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleBackToList = () => {
    router.push('/reading/general');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-white/70">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>二选一牌阵 - 结果展示 | Mystic Insights</title>
        <meta name="description" content="查看你的二选一牌阵占卜结果" />
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
            onClick={handleBackToList}
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
          <div className="mx-auto max-w-7xl">
            {/* 标题区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 sm:mb-12"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                TWO CHOICES SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                二选一牌阵
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                牌已就位，以下是你抽到的塔罗牌
              </p>
            </motion.div>

            {/* 问题和选项展示区域 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 mx-auto max-w-3xl"
            >
              <div className="rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm p-5 space-y-3">
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
                {(optionA || optionB) && (
                  <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                      alt_route
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {optionA && (
                        <div>
                          <p className="text-white/60 text-xs font-medium mb-1 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">A</span>
                            选项 A
                          </p>
                          <p className="text-white/90 text-sm">{optionA}</p>
                        </div>
                      )}
                      {optionB && (
                        <div>
                          <p className="text-white/60 text-xs font-medium mb-1 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold">B</span>
                            选项 B
                          </p>
                          <p className="text-white/90 text-sm">{optionB}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 卡牌展示区域 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <TwoChoicesSlots
                cards={result.cards}
                isAnimating={Array(5).fill(false)}
                showLoadingText={false}
                forceFlipped={true}
                optionA={optionA || 'A'}
                optionB={optionB || 'B'}
              />

              {/* 卡牌信息列表 */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {result.cards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary/20 text-primary'
                      } font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <h3 className="text-white font-semibold text-sm flex-1">
                        {getChineseCardName(card.name)}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-white/50 mb-3 leading-snug">
                      {POSITION_NAMES[index]}
                    </p>
                    
                    <p className="text-white/90 font-medium mb-3 text-sm">
                      {card.orientation === 'upright' ? '正位' : '逆位'}
                    </p>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-white/50 mb-1">关键词</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(card.orientation === 'upright' 
                            ? (typeof card.upright === 'object' ? card.upright.keywords : card.keywords || [])
                            : (typeof card.reversed === 'object' ? card.reversed.keywords : card.keywords || [])
                          ).map((keyword, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-white/10 text-white/70 text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-white/50 mb-1">含义</p>
                        <p className="text-white/70 leading-relaxed text-xs">
                          {card.orientation === 'upright' 
                            ? (typeof card.upright === 'object' ? card.upright.meaning : card.upright)
                            : (typeof card.reversed === 'object' ? card.reversed.meaning : card.reversed)
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 温馨提醒 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="mt-12 mx-auto max-w-3xl"
              >
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm p-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-amber-400 text-2xl mt-0.5">
                      stars
                    </span>
                    <div className="flex-1">
                      <h3 className="text-amber-400 font-bold mb-2 text-lg">温柔提醒</h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        二选一牌阵属于会员解读内容。你可以先根据每张牌的牌位提示，自己感受两条选择带来的状态与走向；如果你希望获得更细致的对比分析与行动建议，可以点击下方「开始解读」解锁 AI 深度解读。
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 操作按钮区域 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="mt-8 space-y-4"
              >
                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartReading}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(127,19,236,0.6)]"
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      开始解读
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-500/50">
                        会员
                      </span>
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToHome}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:bg-white/10"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-xl">home</span>
                      返回首页
                    </span>
                  </motion.button>
                </div>
              </motion.div>

              {/* 底部提示 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="mt-8 flex justify-center"
              >
                <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                  <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse">
                    auto_awesome
                  </span>
                  <p className="relative z-10 text-white/80 text-sm text-center leading-relaxed">
                    占卜仅呈现你当下的能量趋势，但真正能带来改变的，是你的选择与行动。
                  </p>
                  <span className="material-symbols-outlined text-primary/80 text-xl animate-pulse" style={{ animationDelay: '1s' }}>
                    auto_awesome
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}
