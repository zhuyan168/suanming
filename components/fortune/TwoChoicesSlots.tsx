import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface TwoChoicesSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
  optionA?: string;
  optionB?: string;
}

// 五张牌的位置名称（按顺序1-5）
const SLOT_NAMES = [
  '我目前所处的状态',           // 牌1: 底部中心
  '选择 A 时我会经历的状态',     // 牌2: 中部左
  '选择 A 可能带来的发展',       // 牌3: 顶部左
  '选择 B 时我会经历的状态',     // 牌4: 中部右
  '选择 B 可能带来的发展',       // 牌5: 顶部右
];

export default function TwoChoicesSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false,
  optionA = 'A',
  optionB = 'B'
}: TwoChoicesSlotsProps) {
  
  // 用于渲染单张卡片的通用函数
  const renderCard = (index: number, label?: string) => {
    const card = cards[index];
    
    return (
      <div key={index} className="flex flex-col items-center gap-2">
        {/* 卡位标签 */}
        {label && (
          <div className="text-center mb-1">
            <p className="text-xs sm:text-sm text-white/70 font-medium">
              {label}
            </p>
          </div>
        )}
        
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
              className="relative w-20 h-32 sm:w-28 sm:h-42 md:w-32 md:h-48"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 ${
                  index === 0 ? 'border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.6)]' : 'border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]'
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
              className={`w-20 h-32 sm:w-28 sm:h-42 md:w-32 md:h-48 rounded-xl border-2 border-dashed ${
                index === 0 ? 'border-yellow-500/30' : 'border-white/20'
              } flex items-center justify-center`}
            >
              <div className="text-center text-white/30">
                <div className="text-xl sm:text-2xl mb-1">
                  {index === 0 ? '⭐' : '🎴'}
                </div>
                <p className="text-xs">{index + 1}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 卡位说明 - 在卡片下方 */}
        <div className="text-center mt-2 max-w-[120px]">
          <p className="text-xs text-white/50 leading-snug">
            {SLOT_NAMES[index]}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="two-choices-slots w-full flex flex-col justify-center items-center py-6 sm:py-8">
      {/* V形布局 */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* 顶部行：牌3（左上 A发展）和牌5（右上 B发展） */}
        <div className="flex items-start justify-between px-4 sm:px-8 mb-6 sm:mb-8">
          <div className="flex flex-col items-center">
            {renderCard(2)}
          </div>
          <div className="flex flex-col items-center">
            {renderCard(4)}
          </div>
        </div>

        {/* 中间行：牌2（左中 A现状）和牌4（右中 B现状） */}
        <div className="flex items-start justify-between px-8 sm:px-16 md:px-20 mb-6 sm:mb-8">
          {renderCard(1)}
          {renderCard(3)}
        </div>

        {/* 底部：牌1（当前状态） */}
        <div className="flex items-center justify-center">
          {renderCard(0)}
        </div>
      </div>

      {/* 解析提示文字 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 5 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-sm sm:text-base mt-6 font-medium"
        >
          <p>🔮 请继续抽取剩余卡牌（{cards.filter(c => c !== null).length}/5）</p>
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
