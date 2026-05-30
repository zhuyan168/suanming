import React from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface SixCardSlotsProps {
  cards: (ShuffledTarotCard | null)[];
  isAnimating: boolean[];
  showLoadingText?: boolean;
  forceFlipped?: boolean;
}

// 六张卡槽的位置名称和说明（未来恋人牌阵）
const SLOT_CONFIG = {
  en: [
    { key: 'guide', label: 'Guide Card', subLabel: '', icon: '🌙' },
    { key: 'type', label: '1', subLabel: 'What type of person they are', icon: '💫' },
    { key: 'appeared', label: '2', subLabel: 'Have they appeared yet?', icon: '👁️' },
    { key: 'obstacle', label: '3', subLabel: 'Obstacles in the way', icon: '⚡' },
    { key: 'pattern', label: '4', subLabel: 'Relationship pattern', icon: '💞' },
    { key: 'how_to_meet', label: '5', subLabel: 'How you may meet them', icon: '✨' },
  ],
  zh: [
    { key: 'guide', label: '指引牌', subLabel: '', icon: '🌙' },
    { key: 'type', label: '1', subLabel: '他/她是什么类型', icon: '💫' },
    { key: 'appeared', label: '2', subLabel: '他/她已经出现了吗？', icon: '👁️' },
    { key: 'obstacle', label: '3', subLabel: '遇到的阻力', icon: '⚡' },
    { key: 'pattern', label: '4', subLabel: '相处模式', icon: '💞' },
    { key: 'how_to_meet', label: '5', subLabel: '怎样才能遇到他/她', icon: '✨' },
  ],
};

export default function SixCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: SixCardSlotsProps) {
  const router = useRouter();
  const isEn = router.locale !== 'zh';
  const slotConfig = isEn ? SLOT_CONFIG.en : SLOT_CONFIG.zh;
  
  // 用于渲染单张卡片的通用函数
  const renderCard = (index: number) => {
    const card = cards[index];
    const config = slotConfig[index];
    const isGuideCard = index === 0;
    
    return (
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
              className={`relative ${
                isGuideCard 
                  ? 'w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72' 
                  : 'w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60'
              }`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className={`card-wrapper relative w-full h-full rounded-xl overflow-hidden border-2 ${
                  isGuideCard 
                    ? 'border-primary shadow-[0_0_40px_rgba(127,19,236,0.8)]' 
                    : 'border-primary/70 shadow-[0_0_20px_rgba(127,19,236,0.4)]'
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
              className={`${
                isGuideCard 
                  ? 'w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72' 
                  : 'w-24 h-36 sm:w-32 sm:h-48 md:w-40 md:h-60'
              } rounded-xl border-2 border-dashed ${
                isGuideCard ? 'border-primary/40' : 'border-white/20'
              } flex flex-col items-center justify-center p-2`}
            >
              <div className="text-center">
                {!isGuideCard && (
                  <p className="text-lg sm:text-xl font-bold text-white/50 mb-2">
                    {config.label}
                  </p>
                )}
                <p className={`text-xs sm:text-sm ${
                  isGuideCard ? 'text-primary/70 font-semibold' : 'text-white/60'
                } leading-tight`}>
                  {isGuideCard ? config.label : config.subLabel}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  return (
    <div className="six-card-slots w-full flex flex-col justify-center items-center py-8 gap-6 sm:gap-8">
      {/* 第一行：指引牌（顶部居中） */}
      <div className="flex items-center justify-center mb-4">
        {renderCard(0)}
      </div>

      {/* 第二行：1和2（左右并排） */}
      <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-20">
        {renderCard(1)}
        {renderCard(2)}
      </div>

      {/* 第三行：3和4（左右并排） */}
      <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-20">
        {renderCard(3)}
        {renderCard(4)}
      </div>

      {/* 第四行：5（底部居中） */}
      <div className="flex items-center justify-center mt-4">
        {renderCard(5)}
      </div>

      {/* 抽牌进度提示 */}
      {cards.filter(c => c !== null).length > 0 && cards.filter(c => c !== null).length < 6 && showLoadingText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-white/70 text-base sm:text-lg mt-4 font-medium"
        >
          <p>{isEn ? `🔮 Keep drawing the remaining cards (${cards.filter(c => c !== null).length}/6)` : `🔮 请继续抽取剩余卡牌（${cards.filter(c => c !== null).length}/6）`}</p>
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

