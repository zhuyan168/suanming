import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface SlotConfig {
  id: string;
  name: string;
  meaning: string;
}

interface CareerDevelopmentSevenSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
  slotConfig: SlotConfig[];
}

export default function CareerDevelopmentSevenSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false,
  slotConfig
}: CareerDevelopmentSevenSlotsProps) {
  // 7张牌布局（参考图示）：
  // 上排3张: 2-1-3 (左中右)
  // 中间1张: 6 (正中)
  // 下排3张: 4-7-5 (左中右)
  // 
  // 按照抽牌顺序编号：1,2,3,4,5,6,7
  // 位置映射（数组索引对应抽牌顺序）：
  const positions = [
    { index: 0, number: 1, label: slotConfig[0]?.name || '牌位1' }, // #1 顶部中间
    { index: 1, number: 2, label: slotConfig[1]?.name || '牌位2' }, // #2 顶部左侧
    { index: 2, number: 3, label: slotConfig[2]?.name || '牌位3' }, // #3 顶部右侧
    { index: 3, number: 4, label: slotConfig[3]?.name || '牌位4' }, // #4 底部左侧
    { index: 4, number: 5, label: slotConfig[4]?.name || '牌位5' }, // #5 底部右侧
    { index: 5, number: 6, label: slotConfig[5]?.name || '牌位6' }, // #6 正中间
    { index: 6, number: 7, label: slotConfig[6]?.name || '牌位7' }, // #7 底部中间
  ];

  return (
    <div className="career-development-seven-slots w-full max-w-5xl mx-auto py-8">
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* 上排 - 3张牌：左(#2)、中(#1)、右(#3) */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 items-center justify-items-center max-w-sm sm:max-w-md mx-auto">
          <CardSlot
            key={positions[1].index}
            card={cards[positions[1].index]}
            isAnimating={isAnimating[positions[1].index]}
            isFlipped={forceFlipped || (cards[positions[1].index] && !isAnimating[positions[1].index])}
            label={positions[1].label}
            number={positions[1].number}
          />
          <CardSlot
            key={positions[0].index}
            card={cards[positions[0].index]}
            isAnimating={isAnimating[positions[0].index]}
            isFlipped={forceFlipped || (cards[positions[0].index] && !isAnimating[positions[0].index])}
            label={positions[0].label}
            number={positions[0].number}
          />
          <CardSlot
            key={positions[2].index}
            card={cards[positions[2].index]}
            isAnimating={isAnimating[positions[2].index]}
            isFlipped={forceFlipped || (cards[positions[2].index] && !isAnimating[positions[2].index])}
            label={positions[2].label}
            number={positions[2].number}
          />
        </div>

        {/* 中间 - 1张牌：中(#6) */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 items-center justify-items-center max-w-sm sm:max-w-md mx-auto">
          <div />
          <CardSlot
            key={positions[5].index}
            card={cards[positions[5].index]}
            isAnimating={isAnimating[positions[5].index]}
            isFlipped={forceFlipped || (cards[positions[5].index] && !isAnimating[positions[5].index])}
            label={positions[5].label}
            number={positions[5].number}
          />
          <div />
        </div>

        {/* 下排 - 3张牌：左(#4)、中(#7)、右(#5)，4和5略微上移 */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 items-start justify-items-center max-w-sm sm:max-w-md mx-auto">
          <div className="-mt-16 sm:-mt-20">
            <CardSlot
              key={positions[3].index}
              card={cards[positions[3].index]}
              isAnimating={isAnimating[positions[3].index]}
              isFlipped={forceFlipped || (cards[positions[3].index] && !isAnimating[positions[3].index])}
              label={positions[3].label}
              number={positions[3].number}
            />
          </div>
          <CardSlot
            key={positions[6].index}
            card={cards[positions[6].index]}
            isAnimating={isAnimating[positions[6].index]}
            isFlipped={forceFlipped || (cards[positions[6].index] && !isAnimating[positions[6].index])}
            label={positions[6].label}
            number={positions[6].number}
          />
          <div className="-mt-16 sm:-mt-20">
            <CardSlot
              key={positions[4].index}
              card={cards[positions[4].index]}
              isAnimating={isAnimating[positions[4].index]}
              isFlipped={forceFlipped || (cards[positions[4].index] && !isAnimating[positions[4].index])}
              label={positions[4].label}
              number={positions[4].number}
            />
          </div>
        </div>
      </div>

      {showLoadingText && cards.filter(c => c !== null).length < 7 && (
        <div className="text-center text-white/50 text-sm mt-8">
          <p>请继续抽取卡牌...</p>
        </div>
      )}

      <style jsx>{`
        .card-wrapper { 
          transition: transform 0.3s ease-in-out;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .card-front img,
        .card-back img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
}

interface CardSlotProps {
  card: ShuffledTarotCard | null;
  isAnimating: boolean;
  isFlipped: boolean;
  label: string;
  number: number;
}

function CardSlot({ card, isAnimating, isFlipped, label, number }: CardSlotProps) {
  return (
    <div className="flex flex-col items-center w-full">
      {/* 牌位标签 */}
      <div className="mb-3 text-center px-2 min-h-[2.5rem] flex items-center justify-center">
        <p className="text-xs sm:text-sm text-white/60 font-medium leading-tight">
          {label}
        </p>
      </div>

      {/* 卡牌 */}
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div
            key={`card-${card.id}`}
            initial={isAnimating ? { scale: 0.8, y: -100, opacity: 0 } : { scale: 1, y: 0, opacity: 1 }}
            animate={isAnimating ? { scale: 1.08, y: -20, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-24 h-36 sm:w-28 sm:h-40"
            style={{ 
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)'
            }}
          >
            <div
              className="card-wrapper relative w-full h-full rounded-lg overflow-hidden border border-primary/50 shadow-[0_0_15px_rgba(127,19,236,0.4)]"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)'
              }}
            >
              {!isFlipped ? (
                <div 
                  className="card-back w-full h-full"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)'
                  }}
                >
                  <img 
                    src="/assets/card-back.png" 
                    alt="Back" 
                    className="w-full h-full object-cover"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)',
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="card-front w-full h-full relative bg-white"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)'
                  }}
                >
                  <img 
                    src={card.image} 
                    alt={card.name} 
                    className={`w-full h-full object-cover ${card.orientation === 'reversed' ? 'rotate-180' : ''}`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: card.orientation === 'reversed' ? 'translateZ(0) rotate(180deg)' : 'translateZ(0)',
                      WebkitTransform: card.orientation === 'reversed' ? 'translateZ(0) rotate(180deg)' : 'translateZ(0)',
                      imageRendering: '-webkit-optimize-contrast',
                      backgroundColor: 'white'
                    }}
                    onError={(e) => {
                      console.warn('Image failed to load:', card.image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="w-24 h-36 sm:w-28 sm:h-40 rounded-lg border border-dashed border-white/20 flex items-center justify-center bg-white/5"
          >
            <span className="text-white/30 text-3xl font-bold">{number}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
