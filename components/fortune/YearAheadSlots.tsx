import React, { useRef, useState, useEffect } from 'react';
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

interface CardPosition {
  id: number;
  x: number;
  y: number;
  label: string;
}

export default function YearAheadSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: YearAheadSlotsProps) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<CardPosition[]>([]);
  
  const monthLabels = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  // 使用极坐标算法计算卡牌位置（以圆环容器为参照系，保证贴合圆弧）
  useEffect(() => {
    const el = orbitRef.current;
    if (!el) return;

    const calculatePositions = () => {
      const rect = el.getBoundingClientRect();
      const orbitWidth = rect.width;
      const orbitHeight = rect.height;
      if (orbitWidth <= 0 || orbitHeight <= 0) return;

      // 中心点（以圆环容器为基准）
      const centerX = orbitWidth / 2;
      const centerY = orbitHeight / 2;

      // 半径：圆环容器宽度的 35%–40%，取中值 38%
      const radius = Math.min(orbitWidth, orbitHeight) * 0.38;

      const newPositions: CardPosition[] = [];

      // 月份卡牌：按你的公式 angle = -90deg + index * (360/12)
      // 为了保持“1月在底部”的既有顺序，这里做 offset 映射（+6 等于旋转 180deg）
      const offset = 6;
      for (let i = 0; i < 12; i++) {
        const angleInDegrees = -90 + (i + offset) * (360 / 12);
        const angleInRadians = (angleInDegrees * Math.PI) / 180;

        const x = centerX + radius * Math.cos(angleInRadians);
        const y = centerY + radius * Math.sin(angleInRadians);

        newPositions.push({
          id: i + 1,
          x,
          y,
          label: monthLabels[i]
        });
      }

      // 第13张牌 - 中心位置（年度主题牌）
      newPositions.push({
        id: 13,
        x: centerX,
        y: centerY,
        label: "年度主题牌"
      });

      setPositions(newPositions);
    };

    calculatePositions();

    // 用 ResizeObserver 监听容器真实尺寸变化（比 window.resize 更可靠）
    const ro = new ResizeObserver(() => calculatePositions());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  return (
    <div className="year-ahead-slots w-full max-w-4xl mx-auto py-8">
      {/* 圆环区域：独立参照系，保证卡牌贴合圆弧；下面文案不再被 absolute 覆盖 */}
      <div
        ref={orbitRef}
        className="relative w-full mx-auto min-h-[750px] sm:min-h-[850px]"
      >
        {positions.length > 0 && cards.map((card, index) => {
          const pos = positions[index];
          if (!pos) return null;

          const isFlipped = forceFlipped || (card && !isAnimating[index]);
          const isCenterCard = index === 12; // 第13张是中心牌

          return (
            <div 
              key={index} 
              className="absolute"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isCenterCard ? 10 : 1, // 中心牌层级更高
              }}
            >
              {/* 说明：定位点必须对齐“卡牌本体中心”，不能把标签算进来，否则会导致上下半径不一致 */}
              <div className="relative flex items-center justify-center">
                {/* 位置标签（绝对定位，不参与几何中心计算） */}
                <div className="absolute -top-6 text-xs text-white/50 uppercase tracking-wider font-bold text-center whitespace-nowrap">
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
                    className={`relative ${
                      isCenterCard
                        ? 'w-28 h-40 sm:w-32 sm:h-48'
                        : 'w-24 h-36 sm:w-28 sm:h-40'
                    }`}
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
                      isCenterCard
                        ? 'w-28 h-40 sm:w-32 sm:h-48'
                        : 'w-24 h-36 sm:w-28 sm:h-40'
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

      </div>

      {/* 抽牌进度提示 */}
      {showLoadingText && cards.filter(c => c !== null).length < 13 && (
        <div className="mt-6 text-center text-white/50 text-sm">
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

