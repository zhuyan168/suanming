import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface HexagramSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

const POSITION_TITLES_ZH = [
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
  'Present | Current Situation',
  'Future | Likely Development',
  'Inner | Emotional & Mental Influence',
  'Outer | Environmental & Social Influence',
  'Action | Your Approach & Response',
  'Guide Card | Overall Summary & Reminder',
];

export default function HexagramSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: HexagramSlotsProps) {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const POSITION_TITLES = isEn ? POSITION_TITLES_EN : POSITION_TITLES_ZH;

  const renderCard = (card: ShuffledTarotCard | null, index: number, positionTitle: string) => (
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
            className="relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-44"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 卡牌容器 */}
            <div
              className="card-wrapper relative w-full h-full rounded-lg overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(127,19,236,0.5)]"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                transform: (forceFlipped || (!isAnimating[index] && card)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            >
              {/* 卡背 */}
              <div
                className="card-back absolute inset-0 rounded-lg overflow-hidden"
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
                className="card-front absolute inset-0 rounded-lg overflow-hidden bg-white"
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
            className="w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-44 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center"
          >
            <div className="text-center text-white/30">
              <div className="text-xl sm:text-2xl mb-1">🎴</div>
              <p className="text-xs">{index + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 牌位标题 - 仅在展示页显示 */}
      {forceFlipped && card && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-center"
        >
          <p className="text-[9px] sm:text-[10px] md:text-xs text-white/60 leading-snug max-w-[80px] sm:max-w-[100px] md:max-w-[130px] lg:max-w-[150px]">
            {positionTitle}
          </p>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="hexagram-slots w-full flex flex-col justify-center items-center py-8 px-4">
      {/* 六芒星布局容器 - 增加尺寸和高度 */}
      <div className="relative w-full max-w-[400px] sm:max-w-[520px] md:max-w-[640px] lg:max-w-[720px] mx-auto" style={{ aspectRatio: '1/1.3', minHeight: '500px' }}>
        {/* 顶部 - 位置1：过去 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          {renderCard(cards[0], 0, POSITION_TITLES[0])}
        </div>
        
        {/* 右上 - 位置2：现在 */}
        <div className="absolute top-[15%] right-[5%] sm:right-[10%] md:right-[12%]">
          {renderCard(cards[1], 1, POSITION_TITLES[1])}
        </div>
        
        {/* 右下 - 位置3：未来 */}
        <div className="absolute bottom-[20%] right-[5%] sm:right-[10%] md:right-[12%]">
          {renderCard(cards[2], 2, POSITION_TITLES[2])}
        </div>
        
        {/* 底部 - 位置4：内在 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          {renderCard(cards[3], 3, POSITION_TITLES[3])}
        </div>
        
        {/* 左下 - 位置5：外在 */}
        <div className="absolute bottom-[20%] left-[5%] sm:left-[10%] md:left-[12%]">
          {renderCard(cards[4], 4, POSITION_TITLES[4])}
        </div>
        
        {/* 左上 - 位置6：行动 */}
        <div className="absolute top-[15%] left-[5%] sm:left-[10%] md:left-[12%]">
          {renderCard(cards[5], 5, POSITION_TITLES[5])}
        </div>
        
        {/* 中心 - 位置7：指引牌 (稍大一点) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {cards[6] ? (
                <motion.div
                  key={`card-${cards[6].id}-6`}
                  initial={isAnimating[6] ? { 
                    scale: 0.8,
                    y: -100,
                  } : { 
                    scale: 1,
                    y: 0,
                  }}
                  animate={isAnimating[6] ? {
                    scale: 1.08,
                    y: -20,
                  } : {
                    scale: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.9 }}
                  transition={isAnimating[6] ? {
                    duration: 0.15,
                    ease: 'easeOut',
                  } : {
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                  className="relative w-20 h-32 sm:w-24 sm:h-40 md:w-28 md:h-44 lg:w-32 lg:h-52"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 中心指引牌特殊光效 */}
                  {forceFlipped && (
                    <div className="absolute inset-0 rounded-lg bg-primary/20 blur-xl animate-pulse" style={{ zIndex: -1 }} />
                  )}
                  
                  <div
                    className="card-wrapper relative w-full h-full rounded-lg overflow-hidden border-2 border-primary shadow-[0_0_30px_rgba(127,19,236,0.8)]"
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px',
                      transform: (forceFlipped || (!isAnimating[6] && cards[6])) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    }}
                  >
                    <div
                      className="card-back absolute inset-0 rounded-lg overflow-hidden"
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
                    
                    <div
                      className="card-front absolute inset-0 rounded-lg overflow-hidden bg-white"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      <img
                        src={cards[6].image}
                        alt={cards[6].name}
                        className={`w-full h-full object-cover ${
                          cards[6].orientation === 'reversed' ? 'rotate-180' : ''
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
                  key="empty-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-20 h-32 sm:w-24 sm:h-40 md:w-28 md:h-44 lg:w-32 lg:h-52 rounded-lg border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5"
                >
                  <div className="text-center text-white/40">
                    <div className="text-2xl sm:text-3xl mb-1">✨</div>
                    <p className="text-xs">{isEn ? 'Guide' : '指引'}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {forceFlipped && cards[6] && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 text-center"
              >
                <p className="text-[9px] sm:text-[10px] md:text-xs text-primary font-semibold leading-snug max-w-[90px] sm:max-w-[120px] md:max-w-[150px] text-center">
                  {POSITION_TITLES[6]}
                </p>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* 六芒星连线（装饰性，仅在展示页显示） */}
        {forceFlipped && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            style={{ zIndex: -1 }}
          >
            {/* 外围六芒星线条 */}
            <line x1="50%" y1="0%" x2="85%" y2="15%" stroke="#7f13ec" strokeWidth="1" />
            <line x1="85%" y1="15%" x2="85%" y2="62%" stroke="#7f13ec" strokeWidth="1" />
            <line x1="85%" y1="62%" x2="50%" y2="77%" stroke="#7f13ec" strokeWidth="1" />
            <line x1="50%" y1="77%" x2="15%" y2="62%" stroke="#7f13ec" strokeWidth="1" />
            <line x1="15%" y1="62%" x2="15%" y2="15%" stroke="#7f13ec" strokeWidth="1" />
            <line x1="15%" y1="15%" x2="50%" y2="0%" stroke="#7f13ec" strokeWidth="1" />
          </svg>
        )}
      </div>

      {/* 抽牌进度提示 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 7 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-base sm:text-lg mt-8 font-medium"
        >
          <p>
            🔮 {cards.filter(c => c !== null).length < 6
              ? (isEn ? 'Keep drawing the outer cards…' : '请继续抽取外围牌位…')
              : (isEn ? 'Last card — draw the central Guide Card…' : '最后，抽取中心的指引牌…')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
