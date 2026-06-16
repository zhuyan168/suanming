import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface SelectedCardSlotProps {
  selectedCard: TarotCard | null;
  isAnimating: boolean;
  orientation?: 'upright' | 'reversed';
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

export default function SelectedCardSlot({ 
  selectedCard, 
  isAnimating,
  orientation = 'upright',
  showLoadingText = false,
  forceFlipped = false
}: SelectedCardSlotProps) {
  const router = useRouter();
  const isEn = router.locale === 'en';

  // 判断是否应该显示翻牌状态（当动画完成且不是动画中时，或强制翻牌）
  // 如果强制翻牌，直接返回 true，否则检查动画状态
  const isFlipped = forceFlipped ? true : (!isAnimating && selectedCard !== null);

  return (
    <div className="selected-card-slot w-full flex flex-col justify-center items-center py-8">
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
              // 第二阶段：移动到目标位置（无弹跳）
              scale: 1,
              y: 0,
            }}
            exit={{ scale: 0.9 }}
            transition={isAnimating ? {
              // 第一阶段：从上方进入并上浮
              duration: 0.15,
              ease: 'easeOut',
            } : {
              // 第二阶段：移动到目标位置（平滑过渡）
              duration: 0.3,
              ease: 'easeOut',
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
                transform: forceFlipped ? 'rotateY(180deg)' : (isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'),
                transition: 'transform 0.3s ease-in-out',
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
              
              {/* 卡面 - 翻牌后通过父容器旋转显示 */}
              <div
                className="card-front absolute inset-0 rounded-xl overflow-hidden bg-white"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className={`w-full h-full object-contain ${
                    orientation === 'reversed' ? 'rotate-180' : ''
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
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
          >
            <div className="text-center text-white/30">
              <div className="text-4xl mb-2">🎴</div>
              <p className="text-sm">{isEn ? 'Select a card' : '选择一张卡牌'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 解析提示文字 */}
      {selectedCard && !isAnimating && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-lg mt-8 font-medium"
        >
          <p>{isEn ? '🔮 Reading today\'s tarot energy…' : '🔮 正在解析今日塔罗能量…'}</p>
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

