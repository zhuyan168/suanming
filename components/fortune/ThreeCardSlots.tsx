import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';


interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface ThreeCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean; // 强制显示卡面（用于结果页面）
}

export default function ThreeCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: ThreeCardSlotsProps) {
  return (
    <div className="three-card-slots w-full flex flex-col justify-center items-center py-8">
      {/* 三张卡牌横向排列 */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
        {cards.map((card, index) => (
          <div key={index} className="flex flex-col items-center">
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
                    // 第一阶段：从上方进入，上浮并放大
                    scale: 1.08,
                    y: -20,
                  } : {
                    // 第二阶段：移动到目标位置
                    scale: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.9 }}
                  transition={isAnimating[index] ? {
                    // 第一阶段：从上方进入并上浮
                    duration: 0.15,
                    ease: 'easeOut',
                  } : {
                    // 第二阶段：移动到目标位置（平滑过渡）
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                  className="relative w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 卡牌容器 - 使用 CSS class 控制翻牌 */}
                  <div
                    className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]`}
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      transform: (forceFlipped || (!isAnimating[index] && card)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    }}
                  >
                    {/* 卡背 - 初始 rotateY(0deg)，翻牌后通过父容器旋转隐藏 */}
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
                          // 如果图片加载失败，显示备用背景
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className += ' bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950';
                          }
                        }}
                      />
                    </div>
                    
                    {/* 卡面 - 初始 rotateY(180deg)，翻牌后通过父容器旋转显示 */}
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
                        }}
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
                  <div className="text-center text-white/30">
                    <div className="text-2xl sm:text-3xl mb-1">🎴</div>
                    <p className="text-xs sm:text-sm">卡位 {index + 1}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* 解析提示文字 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 3 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-base sm:text-lg mt-6 font-medium"
        >
          <p>🔮 请继续抽取剩余卡牌…</p>
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

