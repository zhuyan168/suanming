import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface SevenCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

export default function SevenCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: SevenCardSlotsProps) {
  // Define positions for the Hexagon + Center layout
  // 1: Top, 2: Top-Left, 3: Top-Right, 4: Bottom-Left, 5: Bottom-Right, 6: Bottom, 7: Center
  // Using a relative grid/absolute positioning approach
  // Container relative. 
  // 3 columns, roughly 4 rows.
  // Let's use absolute positioning percentages for responsiveness.

  const positions = [
    { id: 1, top: '0%', left: '40%', x: '-50%' },       // 1. Top Center (月初状态)
    { id: 2, top: '22%', left: '10%', x: '0%' },        // 2. Top Left (本月爱情/桃花)
    { id: 3, top: '22%', right: '30%', x: '0%' },       // 3. Top Right (本月事业)
    { id: 4, top: '55%', left: '10%', x: '0%' },        // 4. Bottom Left (本月财运)
    { id: 5, top: '55%', right: '30%', x: '0%' },       // 5. Bottom Right (本月人际关系)
    { id: 6, top: '78%', left: '40%', x: '-50%' },      // 6. Bottom Center (月末状态)
    { id: 7, top: '38%', right: '5%', x: '0%' },        // 7. Far Right (本月建议)
  ];

  // Mobile adjustments might be needed. The above is for a roughly square container.
  // We might want a different layout for mobile (stacked or smaller).
  // For now, let's try to make it work with a responsive container.

  return (
    <div className="seven-card-slots w-full max-w-3xl mx-auto relative py-8 min-h-[820px] sm:min-h-[900px]">
       {/* Background decorative element maybe? */}
       
      {cards.map((card, index) => {
        const pos = positions[index];
        const isFlipped = forceFlipped || (card && !isAnimating[index]);
        
        return (
          <div 
            key={index} 
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left ? pos.left : undefined,
              right: pos.right ? pos.right : undefined,
              transform: `translateX(${pos.x})`,
              zIndex: index === 6 ? 10 : 1, // Center card slightly above?
            }}
          >
             <div className="flex flex-col items-center">
               {/* Position Label */}
               <div className="mb-2 text-xs text-white/50 uppercase tracking-wider font-bold">
                 {index === 0 ? "月初状态" : index === 1 ? "本月爱情/桃花" : index === 2 ? "本月事业" : index === 3 ? "本月财运" : index === 4 ? "本月人际关系" : index === 5 ? "月末状态" : index === 6 ? "本月建议" : index + 1}
               </div>

              <AnimatePresence mode="wait">
                {card ? (
                  <motion.div
                    key={`card-${card.id}-${index}`}
                    initial={isAnimating[index] ? { scale: 0.8, y: -100, opacity: 0 } : { scale: 1, y: 0, opacity: 1 }}
                    animate={isAnimating[index] ? { scale: 1.08, y: -20, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-24 h-36"
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
                    key={`empty-${index}`}
                    className="w-24 h-36 rounded-lg border border-dashed border-white/20 flex items-center justify-center bg-white/5"
                  >
                    <span className="text-white/20 text-xl font-bold">{index + 1}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      
      {/* Loading text centered at bottom if needed */}
       {showLoadingText && cards.filter(c => c !== null).length < 7 && (
        <div className="absolute -bottom-12 left-0 right-0 text-center text-white/50 text-sm">
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
