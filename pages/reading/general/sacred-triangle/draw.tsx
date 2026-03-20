import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem, { TarotCard } from '../../../../components/fortune/CardItem';
import EmptySlot from '../../../../components/fortune/EmptySlot';
import ScrollBar from '../../../../components/fortune/ScrollBar';
import TriangleThreeCardSlots from '../../../../components/fortune/TriangleThreeCardSlots';
import { tarotCards } from '../../../../data/tarotCards';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';

// 使用从 data/tarotCards.ts 导入的完整78张塔罗牌数据

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
  positionMeaning: string;
}

// 牌位含义定义（内部使用，不展示给用户）
const POSITION_MEANINGS = {
  0: '过去/问题/现状',
  1: '现在/原因/阻碍',
  2: '未来/建议/方向'
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

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
      positionMeaning: ''
    };
  });
  
  return shuffleArray(cardsWithOrientation);
};

const generateSessionId = (): string => {
  return `sacred-triangle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const STORAGE_KEY = 'general_sacred_triangle_result';

interface SacredTriangleResult {
  sessionId: string;
  timestamp: number;
  question: string;
  cards: ShuffledTarotCard[];
}

const saveSacredTriangleResult = (data: SacredTriangleResult) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

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

export default function SacredTriangleDraw() {
  const router = useRouter();
  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'sacred-triangle',
    redirectPath: '/reading/general',
  });

  const [sessionId, setSessionId] = useState<string>('');
  
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedResult, setSavedResult] = useState<SacredTriangleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(true);
  const [scrollValue, setScrollValue] = useState(0);
  
  const initialSlots: (ShuffledTarotCard | null)[] = Array(3).fill(null);
  const [selectedCards, setSelectedCards] = useState<(ShuffledTarotCard | null)[]>(initialSlots);
  const [isAnimating, setIsAnimating] = useState<boolean[]>(Array(3).fill(false));
  
  const [deck, setDeck] = useState<ShuffledTarotCard[]>([]);
  const [uiSlots, setUiSlots] = useState<(ShuffledTarotCard | null)[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollValueRef = useRef(scrollValue);

  useEffect(() => {
    scrollValueRef.current = scrollValue;
  }, [scrollValue]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || isScrollingRef.current) return;
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    const value = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
    setScrollValue(value);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (accessLoading || !allowed) return;

    const saved = loadSacredTriangleResult();
    if (saved) {
      if (saved.cards && saved.cards.length === 3) {
        router.replace('/reading/general/sacred-triangle/result');
        return;
      }
      
      setSavedResult(saved);
      setHasDrawn(true);
      setSessionId(saved.sessionId);
      setSelectedCards(saved.cards);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      const shuffled = shuffleCards(tarotCards);
      setDeck(shuffled);
      setUiSlots(shuffled);
    }
  }, [router, accessLoading, allowed]);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;

    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 3) return;

    const card = uiSlots[slotIndex];
    if (!card) return;

    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

    // 为卡牌添加牌位含义
    const cardWithPosition = {
      ...card,
      positionMeaning: POSITION_MEANINGS[emptySlotIndex as keyof typeof POSITION_MEANINGS]
    };

    const orientation = card.orientation;
    console.log(`🎴 抽到第${emptySlotIndex + 1}张卡牌: ${card.name}, 正逆位: ${orientation === 'upright' ? '正位' : '逆位'}, 牌位: ${cardWithPosition.positionMeaning}`);
    
    const newSelectedCards = [...selectedCards];
    newSelectedCards[emptySlotIndex] = cardWithPosition;
    setSelectedCards(newSelectedCards);
    
    const newIsAnimating = [...isAnimating];
    newIsAnimating[emptySlotIndex] = true;
    setIsAnimating(newIsAnimating);
    
    setDeck(prev => prev.filter(c => c.id !== card.id));
    setUiSlots(prev => prev.map((c, i) => (i === slotIndex ? null : c)));

    setIsLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 150));
    newIsAnimating[emptySlotIndex] = false;
    setIsAnimating([...newIsAnimating]);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsLoading(false);

    const updatedCardCount = newSelectedCards.filter(c => c !== null).length;
    if (updatedCardCount === 3) {
      const question = localStorage.getItem('general_sacred_triangle_question') || '';
      const result: SacredTriangleResult = {
        sessionId,
        timestamp: Date.now(),
        question: question,
        cards: newSelectedCards as ShuffledTarotCard[],
      };
      saveSacredTriangleResult(result);
      setSavedResult(result);
      setHasDrawn(true);
      
      // 自动跳转到展示页
      setTimeout(() => {
        router.push('/reading/general/sacred-triangle/result');
      }, 1000);
    }
  };

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

  const handleReturnToList = () => {
    router.push('/reading/general');
  };

  const handleReset = () => {
    if (typeof window === 'undefined') return;
    if (!confirm('确定要重新开始吗？当前结果将被清空。')) return;

    localStorage.removeItem(STORAGE_KEY);
    
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setHasDrawn(false);
    setSavedResult(null);
    setSelectedCards(Array(3).fill(null));
    setIsAnimating(Array(3).fill(false));
    
    const shuffled = shuffleCards(tarotCards);
    setDeck(shuffled);
    setUiSlots(shuffled);
  };

  if (accessLoading || !allowed) {
    return (
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#191022' }}>
          <div className="text-white/60">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>圣三角牌阵 - 抽牌 | Mystic Insights</title>
        <meta name="description" content="从过去、现在到未来，帮助你梳理脉络与下一步方向" />
      </Head>

      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white" style={{ backgroundColor: '#191022' }}>
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm" style={{ backgroundColor: 'rgba(25, 16, 34, 0.8)' }}>
            <button
              onClick={handleReturnToList}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">返回</span>
            </button>
            
            <div className="flex items-center gap-4 text-white">
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Mystic Insights</h2>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span className="text-sm font-medium hidden sm:inline">重置</span>
            </button>
          </header>

          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-12">
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">Sacred Triangle Spread</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  {hasDrawn ? '圣三角牌阵已完成' : '抽取三张塔罗牌'}
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  {hasDrawn 
                    ? '你已完成抽牌，即将进入展示页面。' 
                    : '静心感受，从下方78张牌中选择3张，探索从过去到未来的指引。'}
                </p>
              </div>

              <AnimatePresence>
                {showCards && !hasDrawn && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {error && (
                      <div className="mb-8 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-center">
                        {error}
                      </div>
                    )}
                    
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

                    <ScrollBar value={scrollValue} onChange={handleScrollBarChange} disabled={isLoading} />

                    <div className="mt-4 sm:mt-8 mb-2 sm:mb-4 text-center text-white/50 text-xs sm:text-sm">
                      <p>已抽牌：{selectedCards.filter(c => c !== null).length} / 3</p>
                    </div>

                    <TriangleThreeCardSlots
                      cards={selectedCards}
                      isAnimating={isAnimating}
                      showLoadingText={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
