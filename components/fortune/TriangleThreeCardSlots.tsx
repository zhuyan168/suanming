import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface TriangleThreeCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

export default function TriangleThreeCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: TriangleThreeCardSlotsProps) {
  return (
    <div className="triangle-card-slots w-full flex flex-col justify-center items-center py-8">
      {/* 三角形布局：上方1张，下方2张 */}
      <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-12">
        {/* 第1张卡牌 - 上方居中 */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {cards[0] ? (
                <motion.div
                  key={`card-${cards[0].id}-0`}
                  initial={isAnimating[0] ? { 
                    scale: 0.8,
                    y: -100,
                  } : { 
                    scale: 1,
                    y: 0,
                  }}
                  animate={isAnimating[0] ? {
                    scale: 1.08,
                    y: -20,
                  } : {
                    scale: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.9 }}
                  transition={isAnimating[0] ? {
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
                    className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]`}
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      transform: (forceFlipped || (!isAnimating[0] && cards[0])) ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                        src={cards[0].image}
                        alt={cards[0].name}
                        className={`w-full h-full object-cover ${
                          cards[0].orientation === 'reversed' ? 'rotate-180' : ''
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
                  key={`empty-0`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
                >
                  <div className="text-center text-white/30">
                    <div className="text-2xl sm:text-3xl mb-1">🎴</div>
                    <p className="text-xs sm:text-sm">卡位 1</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 第2、3张卡牌 - 下方左右排列 */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
          {/* 第3张卡牌 - 左下 */}
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {cards[2] ? (
                <motion.div
                  key={`card-${cards[2].id}-2`}
                  initial={isAnimating[2] ? { 
                    scale: 0.8,
                    y: -100,
                  } : { 
                    scale: 1,
                    y: 0,
                  }}
                  animate={isAnimating[2] ? {
                    scale: 1.08,
                    y: -20,
                  } : {
                    scale: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.9 }}
                  transition={isAnimating[2] ? {
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
                    className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]`}
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      transform: (forceFlipped || (!isAnimating[2] && cards[2])) ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                        src={cards[2].image}
                        alt={cards[2].name}
                        className={`w-full h-full object-cover ${
                          cards[2].orientation === 'reversed' ? 'rotate-180' : ''
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
                  key={`empty-2`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
                >
                  <div className="text-center text-white/30">
                    <div className="text-2xl sm:text-3xl mb-1">🎴</div>
                    <p className="text-xs sm:text-sm">卡位 3</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 第2张卡牌 - 右下 */}
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {cards[1] ? (
                <motion.div
                  key={`card-${cards[1].id}-1`}
                  initial={isAnimating[1] ? { 
                    scale: 0.8,
                    y: -100,
                  } : { 
                    scale: 1,
                    y: 0,
                  }}
                  animate={isAnimating[1] ? {
                    scale: 1.08,
                    y: -20,
                  } : {
                    scale: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.9 }}
                  transition={isAnimating[1] ? {
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
                    className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]`}
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      transform: (forceFlipped || (!isAnimating[1] && cards[1])) ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                        src={cards[1].image}
                        alt={cards[1].name}
                        className={`w-full h-full object-cover ${
                          cards[1].orientation === 'reversed' ? 'rotate-180' : ''
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
                  key={`empty-1`}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center"
                >
                  <div className="text-center text-white/30">
                    <div className="text-2xl sm:text-3xl mb-1">🎴</div>
                    <p className="text-xs sm:text-sm">卡位 2</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
    </div>
  );
}
