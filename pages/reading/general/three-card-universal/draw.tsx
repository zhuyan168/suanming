import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem, { TarotCard } from '../../../../components/fortune/CardItem';
import EmptySlot from '../../../../components/fortune/EmptySlot';
import ScrollBar from '../../../../components/fortune/ScrollBar';
import ThreeCardSlots from '../../../../components/fortune/ThreeCardSlots';
import SpreadAccessStatus from '../../../../components/fortune/SpreadAccessStatus';
import { tarotCards } from '../../../../data/tarotCards';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getThreeCardT } from '../../../../lib/threeCardI18n';


interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// Fisher-Yates shuffle
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
    };
  });
  
  return shuffleArray(cardsWithOrientation);
};

const QUESTION_STORAGE_KEY = 'general_three_card_question';
const RESULT_STORAGE_KEY = 'general_three_card_draw_result';

interface ThreeCardResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
}

const saveResult = (data: ThreeCardResult) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
};

const loadResult = (): ThreeCardResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load three card result:', error);
    return null;
  }
};

export default function ThreeCardDrawPage() {
  const router = useRouter();
  const t = getThreeCardT(router.locale);

  const { loading: accessLoading, allowed, reason: accessReason, retry: retryAccess } = useSpreadAccess({
    spreadKey: 'three-card-general',
    redirectPath: '/reading/general',
  });

  const [question, setQuestion] = useState<string>('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedResult, setSavedResult] = useState<ThreeCardResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY) || '';
    if (savedQuestion) {
      setQuestion(savedQuestion);
    }

    const saved = loadResult();
    if (saved && (saved.question ?? '') === savedQuestion) {
      setSavedResult(saved);
      setHasDrawn(true);
      setSelectedCards(saved.cards);
    } else {
      if (saved) {
        localStorage.removeItem(RESULT_STORAGE_KEY);
      }
      const shuffled = shuffleCards(tarotCards);
      setDeck(shuffled);
      setUiSlots(shuffled);
    }
  }, [accessLoading, allowed]);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;

    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 3) return;

    const card = uiSlots[slotIndex];
    if (!card) return;

    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

    const orientation = card.orientation;
    
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
    if (updatedCardCount === 3) {
      const result: ThreeCardResult = {
        timestamp: Date.now(),
        cards: newSelectedCards as ShuffledTarotCard[],
        question: question || undefined,
      };
      saveResult(result);
      setSavedResult(result);
      setHasDrawn(true);
      
      setTimeout(() => {
        router.push('/reading/general/three-card-universal/reveal');
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

  const handleBack = () => {
    if (!confirm(t.draw.confirmBack)) return;
    router.push('/reading/general/three-card-universal/question');
  };

  const handleReset = () => {
    if (!confirm(t.draw.confirmReset)) return;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
    
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
      <SpreadAccessStatus
        loading={accessLoading}
        failed={!accessLoading && !allowed && !accessReason}
        retry={retryAccess}
        locale={router.locale}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{t.draw.pageTitle}</title>
        <meta name="description" content={t.draw.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-[#0f0f23]/80 backdrop-blur-sm">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">{t.back}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              FateAura
            </h2>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">{t.reset}</span>
          </button>
        </header>

        <main className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                THREE-CARD UNIVERSAL SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                {hasDrawn ? t.draw.h1Done : t.draw.h1Drawing}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                {hasDrawn ? t.draw.subtitleDone : t.draw.subtitleDrawing}
              </p>
            </div>

            {question && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 mx-auto max-w-3xl"
              >
                <div className="rounded-2xl border border-primary/30 bg-primary/10 backdrop-blur-sm p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                      psychology
                    </span>
                    <div className="flex-1">
                      <p className="text-white/60 text-xs font-medium mb-1">{t.yourQuestion}</p>
                      <p className="text-white/90 text-sm leading-relaxed">{question}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {!hasDrawn && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
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
                    <p>{t.draw.cardCount(selectedCards.filter(c => c !== null).length)}</p>
                  </div>

                  <ThreeCardSlots
                    cards={selectedCards}
                    isAnimating={isAnimating}
                    showLoadingText={true}
                    locale={router.locale}
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
