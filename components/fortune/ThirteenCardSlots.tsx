import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface ThirteenCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

export default function ThirteenCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: ThirteenCardSlotsProps) {
  // 13个卡槽的位置 - Year Ahead Spread 圆环布局
  // 按照截图：从底部的1月（Querent位置）开始，顺时针排列12个月，中心为年度主题牌
  // 使用百分比定位实现圆环效果
  const positions = [
    { id: 1, top: '88%', left: '50%', x: '-50%', label: 'Jan' },        // 1月 - 底部（Querent）
    { id: 2, top: '78%', left: '28%', x: '-50%', label: 'Feb' },        // 2月 - 左下偏下
    { id: 3, top: '64%', left: '15%', x: '-50%', label: 'Mar' },        // 3月 - 左下
    { id: 4, top: '48%', left: '8%', x: '-50%', label: 'Apr' },         // 4月 - 左侧
    { id: 5, top: '32%', left: '15%', x: '-50%', label: 'May' },        // 5月 - 左上
    { id: 6, top: '18%', left: '28%', x: '-50%', label: 'Jun' },        // 6月 - 上方偏左
    { id: 7, top: '12%', left: '50%', x: '-50%', label: 'Jul' },        // 7月 - 顶部
    { id: 8, top: '18%', right: '28%', x: '50%', label: 'Aug' },        // 8月 - 上方偏右
    { id: 9, top: '32%', right: '15%', x: '50%', label: 'Sep' },        // 9月 - 右上
    { id: 10, top: '48%', right: '8%', x: '50%', label: 'Oct' },        // 10月 - 右侧
    { id: 11, top: '64%', right: '15%', x: '50%', label: 'Nov' },       // 11月 - 右下
    { id: 12, top: '78%', right: '28%', x: '50%', label: 'Dec' },       // 12月 - 右下偏下
    { id: 13, top: '50%', left: '50%', x: '-50%', y: '-50%', label: 'Theme' }, // 13 - 中心年度主题牌
  ];

  return (
    <div className="thirteen-card-slots w-full max-w-6xl mx-auto relative py-8 px-4 min-h-[700px] sm:min-h-[900px] md:min-h-[1100px]">
      {/* 背景装饰圆环 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[80%] rounded-full border border-white/10 border-dashed"></div>
        <div className="absolute w-[60%] h-[60%] rounded-full border border-white/5 border-dashed"></div>
      </div>
      
      {/* Querent 标签 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white/40 text-sm font-semibold tracking-wider">
        Querent
      </div>
      
      {cards.map((card, index) => {
        const pos = positions[index];
        const isFlipped = forceFlipped || (card && !isAnimating[index]);
        const isCenter = index === 12; // 第13张是中心牌
        
        return (
          <div 
            key={index} 
            className="absolute"
            style={{
              top: pos.top,
              left: pos.left ? pos.left : undefined,
              right: pos.right ? pos.right : undefined,
              transform: `translateX(${pos.x})${pos.y ? ` translateY(${pos.y})` : ''}`,
              zIndex: isCenter ? 20 : 10,
            }}
          >
            <div className="flex flex-col items-center">
              {/* 位置标签 */}
              <div className={`mb-2 text-xs ${isCenter ? 'text-primary font-extrabold text-sm' : 'text-white/40 font-semibold'} uppercase tracking-wider`}>
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
                    className={`relative ${isCenter ? 'w-32 h-48 sm:w-36 sm:h-54' : 'w-20 h-30 sm:w-24 sm:h-36'}`}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)'
                    }}
                  >
                    <div
                      className={`card-wrapper relative w-full h-full rounded-lg overflow-hidden border ${isCenter ? 'border-primary shadow-[0_0_20px_rgba(127,19,236,0.6)]' : 'border-primary/50 shadow-[0_0_15px_rgba(127,19,236,0.4)]'}`}
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
                    className={`${isCenter ? 'w-32 h-48 sm:w-36 sm:h-54' : 'w-20 h-30 sm:w-24 sm:h-36'} rounded-lg border-2 border-dashed ${isCenter ? 'border-primary/30 bg-primary/5' : 'border-white/15 bg-white/5'} flex items-center justify-center backdrop-blur-sm`}
                  >
                    <span className={`${isCenter ? 'text-primary/40 text-2xl' : 'text-white/20 text-base'} font-bold`}>
                      {index + 1}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
      
      {/* Loading text */}
      {showLoadingText && cards.filter(c => c !== null).length < 13 && (
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

