import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface SixPointedStarSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

// 六芒星牌位标题
const POSITION_TITLES = [
  '过去｜问题的根源',
  '现在｜问题的真实状态',
  '未来｜问题的发展趋势',
  '内在｜情绪与心态的影响',
  '外在｜环境与他人的影响',
  '行动｜你对问题的态度与对策',
  '指引牌｜对整体局势的总结与提醒',
];

const POSITION_TITLES_EN = [
  'Past | Root of the Issue',
  'Present | Real State of the Issue',
  'Future | Where This May Develop',
  'Inner | Emotions and Mindset',
  'Outer | Environment and Other People',
  'Action | Your Attitude and Response',
  'Guide Card | Overall Summary and Reminder',
];

export default function SixPointedStarSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: SixPointedStarSlotsProps) {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const positionTitles = isEn ? POSITION_TITLES_EN : POSITION_TITLES;
  const renderCard = (card: ShuffledTarotCard | null, index: number) => (
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
          className="relative w-20 h-32 sm:w-24 sm:h-36 md:w-28 md:h-44"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 ${
              index === 6 ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]' : 'border-primary shadow-[0_0_30px_rgba(127,19,236,0.6)]'
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
                className={`w-full h-full object-contain ${
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
          className={`w-20 h-32 sm:w-24 sm:h-36 md:w-28 md:h-44 rounded-xl border-2 border-dashed ${
            index === 6 ? 'border-yellow-400/40' : 'border-white/20'
          } flex items-center justify-center`}
        >
          <div className="text-center text-white/30">
            <div className="text-xl sm:text-2xl mb-1">
              {index === 6 ? '⭐' : '🎴'}
            </div>
            <p className="text-xs">{index === 6 ? (isEn ? 'Guide' : '指引') : (isEn ? `Pos ${index + 1}` : `位${index + 1}`)}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="six-pointed-star-slots w-full flex flex-col justify-center items-center py-8">
      {/* 六芒星布局 */}
      <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: '1/1' }}>
        {/* 顶部 - 位置1：过去 */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center">
          {renderCard(cards[0], 0)}
          {forceFlipped && cards[0] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-white/60">{positionTitles[0]}</p>
            </div>
          )}
        </div>

        {/* 右上 - 位置2：现在 */}
        <div className="absolute right-[5%] top-[20%] flex flex-col items-center">
          {renderCard(cards[1], 1)}
          {forceFlipped && cards[1] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-white/60">{positionTitles[1]}</p>
            </div>
          )}
        </div>

        {/* 右下 - 位置3：未来 */}
        <div className="absolute right-[5%] bottom-[20%] flex flex-col items-center">
          {renderCard(cards[2], 2)}
          {forceFlipped && cards[2] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-white/60">{positionTitles[2]}</p>
            </div>
          )}
        </div>

        {/* 底部 - 位置4：内在 */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center">
          {renderCard(cards[3], 3)}
          {forceFlipped && cards[3] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-white/60">{positionTitles[3]}</p>
            </div>
          )}
        </div>

        {/* 左下 - 位置5：外在 */}
        <div className="absolute left-[5%] bottom-[20%] flex flex-col items-center">
          {renderCard(cards[4], 4)}
          {forceFlipped && cards[4] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-white/60">{positionTitles[4]}</p>
            </div>
          )}
        </div>

        {/* 左上 - 位置6：行动 */}
        <div className="absolute left-[5%] top-[20%] flex flex-col items-center">
          {renderCard(cards[5], 5)}
          {forceFlipped && cards[5] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-white/60">{positionTitles[5]}</p>
            </div>
          )}
        </div>

        {/* 中心 - 位置7：指引牌 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          {renderCard(cards[6], 6)}
          {forceFlipped && cards[6] && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-yellow-400/90 font-semibold">{positionTitles[6]}</p>
            </div>
          )}
        </div>
      </div>

      {/* 解析提示文字 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 7 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-base sm:text-lg mt-6 font-medium"
        >
          <p>{isEn
            ? `🔮 Keep drawing the remaining cards...${cards.filter(c => c !== null).length === 6 ? ' The last one is the guide card.' : ''}`
            : `🔮 请继续抽取剩余卡牌…${cards.filter(c => c !== null).length === 6 ? '最后一张是指引牌！' : ''}`}
          </p>
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
