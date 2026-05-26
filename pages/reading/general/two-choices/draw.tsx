import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem, { TarotCard } from '../../../../components/fortune/CardItem';
import EmptySlot from '../../../../components/fortune/EmptySlot';
import ScrollBar from '../../../../components/fortune/ScrollBar';
import TwoChoicesSlots from '../../../../components/fortune/TwoChoicesSlots';
import { tarotCards } from '../../../../data/tarotCards';
import { useSpreadAccess } from '../../../../hooks/useSpreadAccess';
import { getTwoChoicesT } from '../../../../lib/twoChoicesI18n';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

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

const QUESTION_STORAGE_KEY = 'general_two_choices_question';
const OPTION_A_STORAGE_KEY = 'general_two_choices_option_a';
const OPTION_B_STORAGE_KEY = 'general_two_choices_option_b';
const RESULT_STORAGE_KEY = 'general_two_choices_draw_result';

interface TwoChoicesResult {
  timestamp: number;
  cards: ShuffledTarotCard[];
  question?: string;
  optionA?: string;
  optionB?: string;
}

const saveResult = (data: TwoChoicesResult) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
};

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
  const t = getTwoChoicesT(router.locale);

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'two-choices',
    redirectPath: '/reading/general',
  });

  const [question, setQuestion] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedResult, setSavedResult] = useState<TwoChoicesResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollValue, setScrollValue] = useState(0);
  
  const initialSlots: (ShuffledTarotCard | null)[] = Array(5).fill(null);
  const [selectedCards, setSelectedCards] = useState<(ShuffledTarotCard | null)[]>(initialSlots);
  const [isAnimating, setIsAnimating] = useState<boolean[]>(Array(5).fill(false));
  
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

    const savedQuestion = localStorage.getItem(QUESTION_STORAGE_KEY);
    const savedOptionA = localStorage.getItem(OPTION_A_STORAGE_KEY);
    const savedOptionB = localStorage.getItem(OPTION_B_STORAGE_KEY);
    
    if (savedQuestion) setQuestion(savedQuestion);
    if (savedOptionA) setOptionA(savedOptionA);
    if (savedOptionB) setOptionB(savedOptionB);

    const saved = loadResult();
    if (saved) {
      setSavedResult(saved);
      setHasDrawn(true);
      setSelectedCards(saved.cards);
    } else {
      const shuffled = shuffleCards(tarotCards);
      setDeck(shuffled);
      setUiSlots(shuffled);
    }
  }, [accessLoading, allowed]);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;

    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 5) return;

    const card = uiSlots[slotIndex];
    if (!card) return;

    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

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
      
      setTimeout(() => {
        router.push('/reading/general/two-choices/result');
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
    setTimeout(() => { isScrollingRef.current = false; }, 100);
  };

  const handleBack = () => {
    if (!confirm(t.draw.confirmBack)) return;
    router.push('/reading/general/two-choices/question');
  };

  const handleReset = () => {
    if (!confirm(t.draw.confirmReset)) return;

    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
    
    setHasDrawn(false);
    setSavedResult(null);
    setSelectedCards(Array(5).fill(null));
    setIsAnimating(Array(5).fill(false));
    
    const shuffled = shuffleCards(tarotCards);
    setDeck(shuffled);
    setUiSlots(shuffled);
  };

  if (accessLoading || !allowed) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center">
        <div className="text-white/60">{t.loading}</div>
      </div>
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
              Mystic Insights
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
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                TWO CHOICES SPREAD
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                {hasDrawn ? t.draw.h1Done : t.draw.h1Drawing}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                {hasDrawn ? t.draw.subtitleDone : t.draw.subtitleDrawing}
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

                  <TwoChoicesSlots
                    cards={selectedCards}
                    isAnimating={isAnimating}
                    showLoadingText={true}
                    optionA={optionA || 'A'}
                    optionB={optionB || 'B'}
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
