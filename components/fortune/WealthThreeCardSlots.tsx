import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface WealthThreeCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
  slotConfig: Array<{ id: string; name: string; meaning: string }>;
}

export default function WealthThreeCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false,
  slotConfig
}: WealthThreeCardSlotsProps) {
  
  const renderCard = (index: number) => {
    const card = cards[index];
    const config = slotConfig[index];
    
    return (
      <div key={index} className="flex flex-col items-center gap-4 w-full max-w-[280px]">
        <AnimatePresence mode="wait">
          {card ? (
            <motion.div
              key={`card-${card.id}-${index}`}
              initial={isAnimating[index] ? { scale: 0.8, y: -100 } : { scale: 1, y: 0 }}
              animate={isAnimating[index] ? { scale: 1.08, y: -20 } : { scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              transition={isAnimating[index] ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.3, ease: 'easeOut' }}
              className="relative w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60"
              style={{ perspective: '1000px' }}
            >
              <div
                className="card-wrapper relative w-full h-full rounded-xl border-2 border-primary shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: (forceFlipped || (!isAnimating[index] && card)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                {/* Back */}
                <div
                  className="card-back absolute inset-0 rounded-xl overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden', 
                    transform: 'rotateY(0deg)',
                    zIndex: 2,
                  }}
                >
                  <img src="/assets/card-back.png" alt="Card Back" className="w-full h-full object-cover" />
                </div>
                
                {/* Front */}
                <div
                  className="card-front absolute inset-0 rounded-xl overflow-hidden bg-white"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)',
                    zIndex: 1,
                  }}
                >
                  <div 
                    className="w-full h-full"
                    style={{ 
                      transform: card.orientation === 'reversed' ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      style={{ backgroundColor: 'white', imageRendering: 'crisp-edges' }}
                      loading="eager"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${index}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5"
            >
              <div className="text-center text-white/30">
                <div className="text-2xl mb-1">🎴</div>
                <p className="text-xs">{index + 1}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Position Info */}
        <div className="text-center mt-2 flex flex-col gap-1 px-1">
          <p className="text-primary text-[10px] sm:text-xs md:text-sm font-bold tracking-tight sm:tracking-wider uppercase leading-tight h-8 flex items-center justify-center">
            {config?.name}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="wealth-three-card-slots w-full flex flex-col items-center py-4 sm:py-8">
      {/* 响应式布局：移动端也是三列横向 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 w-full max-w-5xl justify-items-center px-2">
        {renderCard(0)}
        {renderCard(1)}
        {renderCard(2)}
      </div>

      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 3 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white/70 text-base sm:text-lg mt-12 font-medium"
        >
          <p>🔮 请继续抽取剩余卡牌（{cards.filter(c => c !== null).length}/3）</p>
        </motion.div>
      )}

      <style jsx>{`
        .card-wrapper {
          transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
