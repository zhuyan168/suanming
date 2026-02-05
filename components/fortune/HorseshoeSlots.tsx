import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface HorseshoeSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

export default function HorseshoeSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: HorseshoeSlotsProps) {
  // 牌位名称
  const positionNames = [
    '过去的影响',          // 1
    '当下的状态',          // 2
    '隐藏的影响',          // 3
    '阻碍与挑战',          // 4 (核心位)
    '潜在的发展',          // 5
    '行动建议',            // 6
    '可能的结果',          // 7
  ];

  // 马蹄铁 U 形布局：左侧竖列(1-3) + 底部中心(4) + 右侧竖列(5-7)
  const positions = [
    { id: 1, top: '0%', left: '15%', x: '-50%' },        // 1. 左上
    { id: 2, top: '28%', left: '15%', x: '-50%' },       // 2. 左中
    { id: 3, top: '56%', left: '15%', x: '-50%' },       // 3. 左下
    { id: 4, top: '80%', left: '50%', x: '-50%' },       // 4. 底部中心
    { id: 5, top: '56%', left: '85%', x: '-50%' },       // 5. 右下
    { id: 6, top: '28%', left: '85%', x: '-50%' },       // 6. 右中
    { id: 7, top: '0%', left: '85%', x: '-50%' },        // 7. 右上
  ];

  return (
    <div className="horseshoe-slots w-full max-w-6xl mx-auto relative py-4 sm:py-8 min-h-[550px] sm:min-h-[850px] md:min-h-[950px]">
      {cards.map((card, index) => {
        const pos = positions[index];
        const isFlipped = forceFlipped || (card && !isAnimating[index]);
        
        return (
          <div 
            key={index} 
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left,
              transform: `translateX(${pos.x})`,
              zIndex: 1,
            }}
          >
            <div className="flex flex-col items-center">
              {/* 牌位名称 */}
              <div className="mb-1.5 sm:mb-3 text-center text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-bold">
                <span>{positionNames[index]}</span>
              </div>

              <AnimatePresence mode="wait">
                {card ? (
                  <motion.div
                    key={`card-${card.id}-${index}`}
                    initial={isAnimating[index] ? { scale: 0.8, y: -100, opacity: 0 } : { scale: 1, y: 0, opacity: 1 }}
                    animate={isAnimating[index] ? { scale: 1.08, y: -20, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-20 h-32 sm:w-28 sm:h-44 md:w-32 md:h-48"
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
                    className="w-20 h-32 sm:w-28 sm:h-44 md:w-32 md:h-48 rounded-lg border border-dashed border-white/20 flex items-center justify-center bg-white/5"
                  >
                    <span className="text-white/20 text-base sm:text-xl font-bold">
                      {index + 1}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      
      {/* Loading text centered at bottom if needed */}
      {showLoadingText && cards.filter(c => c !== null).length < 7 && (
        <div className="absolute -bottom-12 sm:-bottom-20 left-0 right-0 text-center text-white/50 text-xs sm:text-sm">
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
