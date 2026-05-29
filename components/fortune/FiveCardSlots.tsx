import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface FiveCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
  isEn?: boolean;
}

// 五张卡槽的位置名称和说明
const SLOT_NAMES = [
  '行动力',
  '情感与人际关系',
  '思维与计划',
  '事业与财运',
  '整体运势',
];

const SLOT_NAMES_EN = [
  'Action',
  'Emotion & Relationships',
  'Mind & Planning',
  'Career & Wealth',
  'Overall',
];

const SLOT_LABELS = [
  'Action',
  'Emotion',
  'Thinking',
  'Wealth',
  'Overall',
];

export default function FiveCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false,
  isEn = false,
}: FiveCardSlotsProps) {
  // 五张牌的十字形布局：
  //        [4 财运]
  //  [1 行动] [5 整体] [2 情感]
  //        [3 思维]
  // 布局：第4张在上方，第1、5、2张在中间行，第3张在下方
  
  // 用于渲染单张卡片的通用函数
  const renderCard = (index: number) => {
    const card = cards[index];
    
    return (
      <div key={index} className="flex flex-col items-center gap-3">
        {/* 卡位标签 */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-white/50 uppercase tracking-wider font-bold">
            {SLOT_LABELS[index]}
          </p>
          <p className="text-sm sm:text-base text-white/70 font-medium">
            {isEn ? SLOT_NAMES_EN[index] : SLOT_NAMES[index]}
          </p>
        </div>
        
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
                className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 ${
                  index === 4 ? 'border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.8)]' : 'border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]'
                }`}
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
              className={`w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed ${
                index === 4 ? 'border-yellow-500/30' : 'border-white/20'
              } flex items-center justify-center`}
            >
              <div className="text-center text-white/30">
                <div className="text-2xl sm:text-3xl mb-1">
                  {index === 4 ? '⭐' : '🎴'}
                </div>
                <p className="text-xs sm:text-sm">{index + 1}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  return (
    <div className="five-card-slots w-full flex flex-col justify-center items-center py-8 gap-6">
      {/* 第一行：第4张卡牌（上方 - 财运） */}
      <div className="flex items-center justify-center">
        {renderCard(3)}
      </div>

      {/* 第二行：3张卡牌（左-中-右：行动力-整体运势-情感） */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
        {renderCard(0)}
        {renderCard(4)}
        {renderCard(1)}
      </div>

      {/* 第三行：第3张卡牌（下方 - 思维） */}
      <div className="flex items-center justify-center">
        {renderCard(2)}
      </div>

      {/* 解析提示文字 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 5 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-base sm:text-lg mt-6 font-medium"
        >
          <p>🔮 {isEn
            ? `Keep drawing cards (${cards.filter(c => c !== null).length}/5)`
            : `请继续抽取剩余卡牌（${cards.filter(c => c !== null).length}/5）`}</p>
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

