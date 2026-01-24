import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface TwoRowsThreeColsSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
  slotConfig: Array<{
    position: number;
    title: string;
    meaning: string;
  }>;
}

/**
 * 2行3列布局的卡槽组件
 * 用于「对方在想什么」等固定6张牌的牌阵
 */
export default function TwoRowsThreeColsSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false,
  slotConfig
}: TwoRowsThreeColsSlotsProps) {
  
  // 用于渲染单张卡片的通用函数
  const renderCard = (index: number) => {
    const card = cards[index];
    const config = slotConfig[index];
    
    return (
      <div key={index} className="flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          {card ? (
            <motion.div
              key={`card-${card.id}-${index}`}
              initial={isAnimating[index] ? { 
                scale: 0.8,
                y: -100,
              } : { 
                scale: 1,
                y: 0,
              }}
              animate={isAnimating[index] ? {
                scale: 1.08,
                y: -20,
              } : {
                scale: 1,
                y: 0,
              }}
              exit={{ scale: 0.9 }}
              transition={isAnimating[index] ? {
                duration: 0.15,
                ease: 'easeOut',
              } : {
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="relative w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 border-primary/70 shadow-[0_0_20px_rgba(127,19,236,0.4)]"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                  transform: (forceFlipped || (!isAnimating[index] && card)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                {/* 卡背 */}
                <div
                  className="card-back absolute inset-0 rounded-xl overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}
                >
                  <img
                    src="/assets/card-back.png"
                    alt="Card Back"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                      }
                    }}
                  />
                </div>
                
                {/* 卡面 */}
                <div
                  className="card-front absolute inset-0 rounded-xl overflow-hidden bg-white"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.name}
                    className={`w-full h-full object-cover ${
                      card.orientation === 'reversed' ? 'rotate-180' : ''
                    }`}
                    style={{
                      backgroundColor: 'white',
                      imageRendering: 'crisp-edges',
                      WebkitFontSmoothing: 'antialiased',
                    }}
                    loading="eager"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${index}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
            >
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/40">
                {config.position}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 卡牌位置说明文字 */}
        <div className="text-center w-24 sm:w-32 md:w-40">
          <p className="text-xs sm:text-sm text-white/70 leading-tight">
            {config.title}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="two-rows-three-cols-slots w-full flex flex-col justify-center items-center py-8 gap-8 sm:gap-10 md:gap-12">
      {/* 第一行: 第1/2/3张 */}
      <div className="flex items-start justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20">
        {renderCard(0)}
        {renderCard(1)}
        {renderCard(2)}
      </div>

      {/* 第二行: 第4/5/6张 */}
      <div className="flex items-start justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20">
        {renderCard(3)}
        {renderCard(4)}
        {renderCard(5)}
      </div>

      {/* 抽牌进度提示 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 6 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-base sm:text-lg mt-4 font-medium"
        >
          <p>🔮 请继续抽取剩余卡牌（{cards.filter(c => c !== null).length}/6）</p>
        </motion.div>
      )}

      {/* 翻牌动画 CSS */}
      <style jsx>{`
        .card-wrapper {
          transition: transform 0.3s ease-in-out;
        }
        
        .card-wrapper.flipped {
          transform: rotateY(180deg);
        }
        
        .card-back {
          transition: transform 0s;
        }
        
        .card-front {
          transition: transform 0s;
        }
      `}</style>
    </div>
  );
}

