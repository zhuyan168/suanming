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
    { id: 1, top: '0%', left: '40%', x: '-50%' },       // 1. Top Center (Shifted Left)
    { id: 2, top: '18%', left: '10%', x: '0%' },        // 2. Top Left (Adjusted for taller container)
    { id: 3, top: '18%', right: '30%', x: '0%' },       // 3. Top Right (Inner)
    { id: 4, top: '48%', left: '10%', x: '0%' },        // 4. Bottom Left (Adjusted)
    { id: 5, top: '48%', right: '30%', x: '0%' },       // 5. Bottom Right (Inner)
    { id: 6, top: '68%', left: '40%', x: '-50%' },      // 6. Bottom Center (Adjusted)
    { id: 7, top: '34%', right: '5%', x: '0%' },        // 7. Far Right (Adjusted)
  ];

  // Mobile adjustments might be needed. The above is for a roughly square container.
  // We might want a different layout for mobile (stacked or smaller).
  // For now, let's try to make it work with a responsive container.

  return (
    <div className="seven-card-slots w-full max-w-3xl mx-auto relative py-8 min-h-[700px] sm:min-h-[820px]">
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
                    className="relative w-20 h-32 sm:w-24 sm:h-36 md:w-28 md:h-44" // Smaller cards for 7-spread
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                      <div
                      className={`card-wrapper relative w-full h-full rounded-lg overflow-hidden border border-primary/50 shadow-[0_0_15px_rgba(127,19,236,0.4)] bg-indigo-950`}
                    >
                      {!isFlipped ? (
                        <div className="card-back w-full h-full">
                          <img src="/assets/card-back.png" alt="Back" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="card-front w-full h-full relative bg-gray-900 flex flex-col items-center justify-center p-2 text-center">
                          {/* 图片层 */}
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className={`absolute inset-0 w-full h-full object-cover z-10 ${card.orientation === 'reversed' ? 'rotate-180' : ''}`} 
                            onError={(e) => {
                              console.warn('Image failed to load:', card.image);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {/* 文字层 (Fallback) */}
                          <div className="z-0 flex flex-col items-center justify-center h-full w-full">
                            <span className="text-3xl mb-2">🎴</span>
                            <span className="text-sm font-bold text-white mb-1">{card.name}</span>
                            <span className="text-xs text-white/60 px-2 py-1 rounded bg-white/10">
                              {card.orientation === 'upright' ? '正位' : '逆位'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${index}`}
                    className="w-20 h-32 sm:w-24 sm:h-36 md:w-28 md:h-44 rounded-lg border border-dashed border-white/20 flex items-center justify-center bg-white/5"
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
        <div className="absolute bottom-0 left-0 right-0 text-center text-white/50 text-sm pb-4">
          <p>请继续抽取卡牌...</p>
        </div>
      )}

      <style jsx>{`
        .card-wrapper { transition: transform 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
