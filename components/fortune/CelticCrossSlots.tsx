import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';


interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface CelticCrossSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean; // 强制显示卡面（用于结果页面）
}

// 牌位名称
const POSITION_NAMES = [
  '现状',     // 1
  '阻碍',     // 2
  '重点',     // 3
  '过去',     // 4
  '优势',     // 5
  '近期',     // 6
  '应对',     // 7
  '提醒',     // 8
  '期待恐惧', // 9
  '走向',     // 10
];

// 单张卡牌渲染组件
function CardSlot({
  card,
  index,
  isAnimating,
  forceFlipped,
  isHorizontal = false,
  size = 'normal',
  hideLabel = false,
  hideNumber = false,
}: {
  card: ShuffledTarotCard | null;
  index: number;
  isAnimating: boolean;
  forceFlipped: boolean;
  isHorizontal?: boolean;
  size?: 'small' | 'normal';
  hideLabel?: boolean;
  hideNumber?: boolean;
}) {
  const sizeClasses = size === 'small' 
    ? 'w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28'
    : 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36';

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div
            key={`card-${card.id}-${index}`}
            initial={isAnimating ? { 
              scale: 0.8,
              y: -100,
              rotate: isHorizontal ? 90 : 0,
            } : { 
              scale: 1,
              y: 0,
              rotate: isHorizontal ? 90 : 0,
            }}
            animate={isAnimating ? {
              scale: 1.08,
              y: -20,
              rotate: isHorizontal ? 90 : 0,
            } : {
              scale: 1,
              y: 0,
              rotate: isHorizontal ? 90 : 0,
            }}
            exit={{ scale: 0.9, rotate: isHorizontal ? 90 : 0 }}
            transition={isAnimating ? {
              duration: 0.15,
              ease: 'easeOut',
            } : {
              duration: 0.3,
              ease: 'easeOut',
            }}
            className={`relative ${sizeClasses}`}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 卡牌容器 */}
            <div
              className="card-wrapper relative w-full h-full rounded-lg overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(127,19,236,0.4)]"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                transform: (forceFlipped || (!isAnimating && card)) ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
            
            {/* 牌位编号标签 */}
            {!hideNumber && (
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg z-10">
                {index + 1}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`empty-${index}`}
            initial={{ scale: 0.9, rotate: isHorizontal ? 90 : 0 }}
            animate={{ scale: 1, rotate: isHorizontal ? 90 : 0 }}
            exit={{ scale: 0.9, rotate: isHorizontal ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className={`${sizeClasses} rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center`}
          >
            <div className="text-center text-white/30">
              <div className="text-lg mb-0.5">🎴</div>
              <p className="text-[10px]">{index + 1}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 牌位名称 */}
      {!hideLabel && (
        <p className={`text-white/50 text-[10px] sm:text-xs text-center ${isHorizontal ? 'mt-6 sm:mt-8 md:mt-10' : 'mt-1'}`}>
          {POSITION_NAMES[index]}
        </p>
      )}
    </div>
  );
}

export default function CelticCrossSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: CelticCrossSlotsProps) {
  return (
    <div className="celtic-cross-slots w-full flex flex-col justify-center items-center py-4 sm:py-8">
      <div className="flex flex-row gap-4 sm:gap-8 md:gap-12 items-center justify-center">
        {/* 左侧：中心十字布局 (1-6) */}
        <div className="relative flex items-center justify-center">
          {/* 使用 grid 实现十字布局 */}
          <div className="grid grid-cols-3 gap-x-10 gap-y-1 sm:gap-x-14 sm:gap-y-2 md:gap-x-20 md:gap-y-2">
            {/* 第一行：空 - 5优势 - 空 */}
            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36" /> {/* 占位 */}
            <CardSlot
              card={cards[4]}
              index={4}
              isAnimating={isAnimating[4]}
              forceFlipped={forceFlipped}
            />
            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36" /> {/* 占位 */}
            
            {/* 第二行：4过去 - 1现状+2阻碍 - 6近期 */}
            <CardSlot
              card={cards[3]}
              index={3}
              isAnimating={isAnimating[3]}
              forceFlipped={forceFlipped}
            />
            
            {/* 中心位置：牌1和牌2叠加 */}
            <div className="relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 flex items-center justify-center">
              {/* 牌1：现状（竖向） */}
              <div className="absolute inset-0 flex flex-col items-center z-10">
                <CardSlot
                  card={cards[0]}
                  index={0}
                  isAnimating={isAnimating[0]}
                  forceFlipped={forceFlipped}
                />
              </div>
              
              {/* 牌2：阻碍（横向，压在牌1的中下部） */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20" style={{ top: '35%' }}>
                <CardSlot
                  card={cards[1]}
                  index={1}
                  isAnimating={isAnimating[1]}
                  forceFlipped={forceFlipped}
                  isHorizontal={true}
                  hideLabel={true}
                />
              </div>
              
              {/* 牌2的标签：阻碍（竖向，在左侧） */}
              <div 
                className="absolute z-30 text-white/50 text-[10px] sm:text-xs"
                style={{ 
                  left: '-2.5rem',
                  top: '70%',
                  transform: 'translateY(-50%)',
                  writingMode: 'vertical-rl',
                  letterSpacing: '0.3em',
                }}
              >
                阻碍
              </div>
            </div>
            
            <CardSlot
              card={cards[5]}
              index={5}
              isAnimating={isAnimating[5]}
              forceFlipped={forceFlipped}
            />
            
            {/* 第三行：空 - 3重点 - 空 */}
            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36" /> {/* 占位 */}
            <CardSlot
              card={cards[2]}
              index={2}
              isAnimating={isAnimating[2]}
              forceFlipped={forceFlipped}
            />
            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36" /> {/* 占位 */}
          </div>
        </div>
        
        {/* 右侧：命运之杖 (7-10)，从下到上 */}
        <div className="flex flex-col-reverse gap-1 sm:gap-2">
          {/* Card 7 (最下) */}
          <CardSlot
            card={cards[6]}
            index={6}
            isAnimating={isAnimating[6]}
            forceFlipped={forceFlipped}
            size="small"
          />
          {/* Card 8 */}
          <CardSlot
            card={cards[7]}
            index={7}
            isAnimating={isAnimating[7]}
            forceFlipped={forceFlipped}
            size="small"
          />
          {/* Card 9 */}
          <CardSlot
            card={cards[8]}
            index={8}
            isAnimating={isAnimating[8]}
            forceFlipped={forceFlipped}
            size="small"
          />
          {/* Card 10 (最上) */}
          <CardSlot
            card={cards[9]}
            index={9}
            isAnimating={isAnimating[9]}
            forceFlipped={forceFlipped}
            size="small"
          />
        </div>
      </div>

      {/* 解析提示文字 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 10 && showLoadingText && (
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
