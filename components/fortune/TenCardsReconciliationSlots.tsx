import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface TenCardsReconciliationSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
  slotConfig: Array<{
    id: string;
    name: string;
    meaning: string;
  }>;
}

/**
 * 10张牌复合牌阵布局组件
 * 布局参考王总提供的图片 (X型布局)：
 * 顶层居中: 指引牌 (index 9)
 * 第一排: P1 (index 0, 远左), P6 (index 5, 远右)
 * 第二排: P2 (index 1, 近左), P7 (index 6, 近右)
 * 第三排: P3 (index 2, 居中)
 * 第四排: P8 (index 7, 近左), P4 (index 3, 近右)
 * 第五排: P9 (index 8, 远左), P5 (index 4, 远右)
 */
export default function TenCardsReconciliationSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false,
  slotConfig
}: TenCardsReconciliationSlotsProps) {
  
  // 用于渲染单张卡片的通用函数
  const renderCard = (index: number) => {
    const card = cards[index];
    const config = slotConfig[index];
    const isIndicator = index === 9; // 指引牌
    
    return (
      <div key={index} className="flex flex-col items-center gap-1 sm:gap-2">
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
              className={`relative ${isIndicator ? 'w-16 h-28 sm:w-28 sm:h-48 md:w-36 md:h-60' : 'w-14 h-24 sm:w-24 sm:h-40 md:w-32 md:h-52'}`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className={`card-wrapper relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden border-2 ${isIndicator ? 'border-primary shadow-[0_0_25px_rgba(127,19,236,0.6)]' : 'border-primary/70 shadow-[0_0_15px_rgba(127,19,236,0.4)]'}`}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                  transform: (forceFlipped || (!isAnimating[index] && card)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                {/* 卡背 */}
                <div
                  className="card-back absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden"
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
                  className="card-front absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden bg-white"
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
              className={`${isIndicator ? 'w-16 h-28 sm:w-28 sm:h-48 md:w-36 md:h-60' : 'w-14 h-24 sm:w-24 sm:h-40 md:w-32 md:h-52'} rounded-lg sm:rounded-xl border-2 border-dashed ${isIndicator ? 'border-primary/50 bg-primary/5' : 'border-white/20 bg-white/5'} flex flex-col items-center justify-center p-1 sm:p-2`}
            >
              <div className="text-center">
                <p className={`font-bold ${isIndicator ? 'text-lg sm:text-2xl text-primary/50' : 'text-sm sm:text-base text-white/30'}`}>
                  {isIndicator ? '🌙' : index + 1}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 牌位名称 */}
        <div className="text-center max-w-[80px] sm:max-w-[120px]">
          <p className={`${isIndicator ? 'text-sm sm:text-base text-primary font-bold' : 'text-[10px] sm:text-xs text-white/70 font-medium'} leading-tight px-1`}>
            {config.name}
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="ten-cards-reconciliation-slots w-full flex flex-col items-center py-4 sm:py-8 gap-4 sm:gap-8">
      {/* 顶层: 指引牌 (index 9) */}
      <div className="flex items-center justify-center mb-1 sm:mb-2">
        {renderCard(9)}
      </div>

      {/* 第一排: P1 (index 0), P6 (index 5) - X 顶部远端 */}
      <div className="flex items-center justify-center gap-20 sm:gap-40 md:gap-64">
        {renderCard(0)}
        {renderCard(5)}
      </div>

      {/* 第二排: P2 (index 1), P7 (index 6) - X 顶部近端 */}
      <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16">
        {renderCard(1)}
        {renderCard(6)}
      </div>

      {/* 第三排: P3 (index 2) - 中心点 */}
      <div className="flex items-center justify-center">
        {renderCard(2)}
      </div>

      {/* 第四排: P8 (index 7), P4 (index 3) - X 底部近端 */}
      <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16">
        {renderCard(7)}
        {renderCard(3)}
      </div>

      {/* 第五排: P9 (index 8), P5 (index 4) - X 底部远端 */}
      <div className="flex items-center justify-center gap-20 sm:gap-40 md:gap-64">
        {renderCard(8)}
        {renderCard(4)}
      </div>

      {/* 抽牌进度提示 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 10 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-white/70 text-sm sm:text-base mt-2 font-medium"
        >
          <p>🔮 请继续抽取剩余卡牌（{cards.filter(c => c !== null).length}/10）</p>
        </motion.div>
      )}

      <style jsx>{`
        .card-wrapper {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

