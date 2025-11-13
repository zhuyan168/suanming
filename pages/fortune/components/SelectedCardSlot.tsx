import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface SelectedCardSlotProps {
  selectedCard: TarotCard | null;
  isAnimating: boolean;
  orientation?: 'upright' | 'reversed';
}

export default function SelectedCardSlot({ 
  selectedCard, 
  isAnimating,
  orientation = 'upright' 
}: SelectedCardSlotProps) {
  // 判断是否应该显示翻牌状态（当动画完成且不是动画中时）
  const isFlipped = !isAnimating && selectedCard !== null;

  return (
    <div className="selected-card-slot w-full flex justify-center items-center min-h-[200px] sm:min-h-[240px] md:min-h-[300px] py-8">
      <AnimatePresence mode="wait">
        {selectedCard ? (
          <motion.div
            key={selectedCard.id}
            initial={isAnimating ? { 
              scale: 0.8,
              y: -100,
            } : { 
              scale: 1,
              y: 0,
            }}
            animate={isAnimating ? {
              // 第一阶段：从上方进入，上浮并放大
              scale: 1.08,
              y: -20,
            } : {
              // 第二阶段：移动到目标位置并落地弹跳
              scale: [1.08, 1, 1.05, 1],
              y: [-20, 0, -8, 0],
            }}
            exit={{ scale: 0.9 }}
            transition={isAnimating ? {
              // 第一阶段：从上方进入并上浮
              duration: 0.3,
              ease: 'easeOut',
            } : {
              // 第二阶段：移动到目标位置并弹跳
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
              times: [0, 0.5, 0.75, 1],
            }}
            className="relative w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 卡牌容器 - 使用 CSS class 控制翻牌 */}
            <div
              className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)] ${isFlipped ? 'flipped' : ''}`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
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
                className="card-front absolute inset-0 rounded-xl overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className={`w-full h-full object-cover ${
                    orientation === 'reversed' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
          >
            <div className="text-center text-white/30">
              <div className="text-4xl mb-2">🎴</div>
              <p className="text-sm">选择一张卡牌</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 翻牌动画 CSS */}
      <style jsx>{`
        .card-wrapper {
          transition: transform 0.8s ease-in-out;
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

