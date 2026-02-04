import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem, { TarotCard } from '../../../../components/fortune/CardItem';
import EmptySlot from '../../../../components/fortune/EmptySlot';
import ScrollBar from '../../../../components/fortune/ScrollBar';
import TwoChoicesSlots from '../../../../components/fortune/TwoChoicesSlots';
import { tarotCards } from '../../../../data/tarotCards';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// Fisher-Yates 洗牌算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 洗牌函数：打乱卡牌顺序并为每张牌分配正逆位
const shuffleCards = (cards: TarotCard[]): ShuffledTarotCard[] => {
  const cardsWithOrientation = cards.map(card => {
    let randomValue: number;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      randomValue = array[0] / (0xFFFFFFFF + 1);
    } else {
      randomValue = Math.random() + (Date.now() % 1000) / 10000;
      randomValue = randomValue % 1;
    }
    return {
      ...card,
      orientation: randomValue >= 0.5 ? 'upright' : 'reversed' as 'upright' | 'reversed',
    };
  });
  
  return shuffleArray(cardsWithOrientation);
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

// 保存结果到 localStorage
const saveResult = (data: TwoChoicesResult) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
};

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

export default function TwoChoicesDrawPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedResult, setSavedResult] = useState<TwoChoicesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollValue, setScrollValue] = useState(0);
  
  // 5张卡槽的状态
  const initialSlots: (ShuffledTarotCard | null)[] = Array(5).fill(null);
  const [selectedCards, setSelectedCards] = useState<(ShuffledTarotCard | null)[]>(initialSlots);
  const [isAnimating, setIsAnimating] = useState<boolean[]>(Array(5).fill(false));
  
  // deck: 实际剩余可抽的牌
  const [deck, setDeck] = useState<ShuffledTarotCard[]>([]);
  // uiSlots: 用于页面卡背渲染的数组
  const [uiSlots, setUiSlots] = useState<(ShuffledTarotCard | null)[]>([]);
  
  // 卡牌容器引用，用于滚动同步
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollValueRef = useRef(scrollValue);

  // 更新 scrollValueRef
  useEffect(() => {
    scrollValueRef.current = scrollValue;
  }, [scrollValue]);

  // 容器滚动处理
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || isScrollingRef.current) return;
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    const value = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
    setScrollValue(value);
  };

  // 初始化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 加载问题和选项
    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
    const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY);
    const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY);
    
    if (savedQuestion) setQuestion(savedQuestion);
    if (savedOptionA) setOptionA(savedOptionA);
    if (savedOptionB) setOptionB(savedOptionB);

    // 尝试加载已保存的结果
    const saved = loadResult();
    if (saved) {
      setSavedResult(saved);
      setHasDrawn(true);
      setSelectedCards(saved.cards);
    } else {
      // 洗牌
      const shuffled = shuffleCards(tarotCards);
      setDeck(shuffled);
      setUiSlots(shuffled);
    }
  }, []);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;

    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 5) return;

    const card = uiSlots[slotIndex];
    if (!card) return;

    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

    const orientation = card.orientation;
    console.log(`🎴 抽到第${emptySlotIndex + 1}张卡牌: ${card.name}, 正逆位: ${orientation === 'upright' ? '正位' : '逆位'}`);
    
    const newSelectedCards = [...selectedCards];
    newSelectedCards[emptySlotIndex] = card;
    setSelectedCards(newSelectedCards);
    
    const newIsAnimating = [...isAnimating];
    newIsAnimating[emptySlotIndex] = true;
    setIsAnimating(newIsAnimating);
    
    setDeck(prev => prev.filter(c => c.id !== card.id));
    setUiSlots(prev => prev.map((c, i) => (i === slotIndex ? null : c)));

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 150));
    newIsAnimating[emptySlotIndex] = false;
    setIsAnimating([...newIsAnimating]);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsLoading(false);

    const updatedCardCount = newSelectedCards.filter(c => c !== null).length;
    // 当抽满5张时保存并跳转
    if (updatedCardCount === 5) {
      const result: TwoChoicesResult = {
        timestamp: Date.now(),
        cards: newSelectedCards as ShuffledTarotCard[],
        question: question || undefined,
        optionA: optionA || undefined,
        optionB: optionB || undefined,
      };
      saveResult(result);
      setSavedResult(result);
      setHasDrawn(true);
      
      // 等待动画完成后跳转
      setTimeout(() => {
        router.push('/reading/general/two-choices/result');
      }, 1000);
    }
  };

  // 滚动条拖动处理
  const handleScrollBarChange = (value: number) => {
    const container = containerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.scrollLeft = (value / 100) * maxScroll;
    setScrollValue(value);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 100);
  };

  const handleBack = () => {
    if (!confirm('确定要返回吗？当前抽牌进度将丢失。')) return;
    router.push('/reading/general/two-choices/question');
  };

  const handleReset = () => {
    if (!confirm('确定要重新开始吗？当前结果将被清空。')) return;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
    
    // 重置状态
    setHasDrawn(false);
    setSavedResult(null);
    setSelectedCards(Array(5).fill(null));
    setIsAnimating(Array(5).fill(false));
    
    // 重新洗牌
    const shuffled = shuffleCards(tarotCards);
    setDeck(shuffled);
    setUiSlots(shuffled);
  };

  return (
    <>
      <Head>
        <title>二选一牌阵 - 抽牌 | Mystic Insights</title>
        <meta name="description" content="从78张塔罗牌中选择5张，探索你的选择指引" />
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
            onClick={handleReset}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">重置</span>
          </button>
        </header>

        {/* 主内容 */}
        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl">
            {/* 标题介绍区域 */}
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                TWO CHOICES SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                {hasDrawn ? '抽牌完成' : '抽取五张塔罗牌'}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                {hasDrawn 
                  ? '牌已经就位，现在让我们看看它们的指引。' 
                  : '静心感受，从下方78张牌中选择5张，探索你的选择指引。'}
              </p>
            </div>

            <AnimatePresence>
              {!hasDrawn && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* 牌堆区域 */}
                  <div className="card-container-wrapper w-full mb-4">
                    <div
                      ref={containerRef}
                      onScroll={handleScroll}
                      className="card-container flex flex-row overflow-x-scroll overflow-y-hidden pb-2 px-2"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                      {uiSlots.map((card, index) => 
                        card ? (
                          <CardItem 
                            key={card.id} 
                            card={card} 
                            index={index} 
                            onClick={drawCard} 
                            isDisabled={isLoading} 
                            isSelected={false} 
                          />
                        ) : (
                          <EmptySlot key={`empty-${index}`} index={index} />
                        )
                      )}
                    </div>
                    <style jsx>{` .card-container::-webkit-scrollbar { display: none; } `}</style>
                  </div>

                  {/* 滚动条 */}
                  <ScrollBar value={scrollValue} onChange={handleScrollBarChange} disabled={isLoading} />

                  <div className="mt-4 sm:mt-8 mb-2 sm:mb-4 text-center text-white/50 text-xs sm:text-sm">
                    <p>已抽牌：{selectedCards.filter(c => c !== null).length} / 5</p>
                  </div>

                  {/* 卡槽区域 */}
                  <TwoChoicesSlots
                    cards={selectedCards}
                    isAnimating={isAnimating}
                    showLoadingText={true}
                    optionA={optionA || 'A'}
                    optionB={optionB || 'B'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
