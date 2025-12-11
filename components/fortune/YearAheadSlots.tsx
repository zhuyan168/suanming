import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface YearAheadSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

export default function YearAheadSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: YearAheadSlotsProps) {
  // 13个卡槽位置 - 圆环布局
  // 1-12: 月份卡槽（围成圆环）
  // 13: 年度主题牌（中心位置）
  // 使用绝对定位，以百分比形式布局
  
  const monthLabels = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  const positions = [
    // 月份卡槽 - 围成圆环（按照Year Ahead Spread的顺序：从底部开始，顺时针）
    { id: 1, top: '78%', left: '50%', x: '-50%', label: monthLabels[0] },      // 1月 - 底部
    { id: 2, top: '71%', left: '22%', x: '0%', label: monthLabels[1] },        // 2月 - 左下
    { id: 3, top: '58%', left: '12%', x: '0%', label: monthLabels[2] },        // 3月 - 左下
    { id: 4, top: '41%', left: '8%', x: '0%', label: monthLabels[3] },         // 4月 - 左侧
    { id: 5, top: '25%', left: '12%', x: '0%', label: monthLabels[4] },        // 5月 - 左上
    { id: 6, top: '12%', left: '22%', x: '0%', label: monthLabels[5] },        // 6月 - 左上
    { id: 7, top: '5%', left: '50%', x: '-50%', label: monthLabels[6] },       // 7月 - 顶部
    { id: 8, top: '12%', right: '22%', x: '0%', label: monthLabels[7] },       // 8月 - 右上
    { id: 9, top: '25%', right: '12%', x: '0%', label: monthLabels[8] },       // 9月 - 右上
    { id: 10, top: '41%', right: '8%', x: '0%', label: monthLabels[9] },       // 10月 - 右侧
    { id: 11, top: '58%', right: '12%', x: '0%', label: monthLabels[10] },     // 11月 - 右下
    { id: 12, top: '71%', right: '22%', x: '0%', label: monthLabels[11] },     // 12月 - 右下
    { id: 13, top: '41.5%', left: '50%', x: '-50%', label: "年度主题牌" },     // 13 - 中心
  ];

  return (
    <div className="year-ahead-slots w-full max-w-4xl mx-auto relative py-8 min-h-[700px] sm:min-h-[800px]">
      {/* 圆环装饰线 */}
      <div className="absolute top-[41.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-dashed border-white/10 rounded-full pointer-events-none" />
      
      {cards.map((card, index) => {
        const pos = positions[index];
        const isFlipped = forceFlipped || (card && !isAnimating[index]);
        const isCenterCard = index === 12; // 第13张是中心牌
        
        return (
          <div 
            key={index} 
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left ? pos.left : undefined,
              right: pos.right ? pos.right : undefined,
              transform: `translateX(${pos.x})`,
              zIndex: isCenterCard ? 10 : 1, // 中心牌层级更高
            }}
          >
            <div className="flex flex-col items-center">
              {/* 位置标签 */}
              <div className="mb-2 text-xs text-white/50 uppercase tracking-wider font-bold text-center">
                {pos.label}
              </div>

              <AnimatePresence mode="wait">
                {card ? (
                  <motion.div
                    key={`card-${card.id}-${index}`}
                    initial={isAnimating[index] ? { scale: 0.8, y: -100, opacity: 0 } : { scale: 1, y: 0, opacity: 1 }}
                    animate={isAnimating[index] ? { scale: 1.08, y: -20, opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative ${isCenterCard ? 'w-28 h-42' : 'w-20 h-32 sm:w-24 sm:h-36'}`}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)'
                    }}
                  >
                    <div
                      className={`card-wrapper relative w-full h-full rounded-lg overflow-hidden border shadow-[0_0_15px_rgba(127,19,236,0.4)] ${
                        isCenterCard ? 'border-primary/70' : 'border-primary/50'
                      }`}
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
                    className={`rounded-lg border border-dashed border-white/20 flex items-center justify-center bg-white/5 ${
                      isCenterCard ? 'w-28 h-42' : 'w-20 h-32 sm:w-24 sm:h-36'
                    }`}
                  >
                    <span className="text-white/20 text-xl font-bold">{index + 1}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      
      {/* 抽牌进度提示 */}
      {showLoadingText && cards.filter(c => c !== null).length < 13 && (
        <div className="absolute -bottom-12 left-0 right-0 text-center text-white/50 text-sm">
          <p>请继续抽取卡牌... ({cards.filter(c => c !== null).length}/13)</p>
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

