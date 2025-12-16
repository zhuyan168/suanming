import React, { useEffect, useRef, useState } from 'react';
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

interface CardPosition {
  id: number;
  x: number;
  y: number;
  label: string;
}

export default function ThirteenCardSlots({ 
  cards, 
  isAnimating,
  showLoadingText = false,
  forceFlipped = false
}: ThirteenCardSlotsProps) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<CardPosition[]>([]);

  // 13个卡槽 - Year Ahead Spread 圆形布局（极坐标，保证12张围绕中心成完整环形）
  useEffect(() => {
    const el = orbitRef.current;
    if (!el) return;

    const monthLabels = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));

    const calculatePositions = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;

      const centerX = w / 2;
      const centerY = h / 2;

      // 依据断点与容器宽度估算卡牌尺寸，用于计算“最大可用半径”
      // 移动端：卡牌尺寸随屏幕宽度 clamp 缩放，避免 12 张在小屏幕上互相重叠
      const isMd = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
      const isSm = typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches;

      const monthCardW = isMd ? 112 : isSm ? 112 : clamp(64, w * 0.18, 88);
      const monthCardH = isMd ? 160 : isSm ? 160 : clamp(96, w * 0.27, 132);

      // 中心牌移动端略小，给外圈留空间
      const centerCardW = isMd ? 144 : isSm ? 128 : clamp(80, w * 0.20, 104);
      const centerCardH = isMd ? 208 : isSm ? 192 : clamp(120, w * 0.30, 152);

      const labelSpace = 24; // 标签位于 -top-6，大约占 24px
      const padding = 10;

      // 让点尽量靠外但不溢出容器（同时考虑标签高度）
      const maxRadiusX = w / 2 - monthCardW / 2 - padding;
      const maxRadiusY = h / 2 - monthCardH / 2 - labelSpace - padding;
      let radius = Math.max(0, Math.min(maxRadiusX, maxRadiusY));

      // 保证外圈不会压到中心牌（留一点缝隙）
      const minRadius = centerCardH / 2 + monthCardH / 2 + 18;
      radius = Math.max(radius, minRadius);

      const next: CardPosition[] = [];

      // angle = offset(-90deg) + index * (360/12)
      // 为了让 Jan 在底部（与现有 UI 一致），整体再旋转 180deg => offset +6
      const rotateOffset = 6;
      for (let i = 0; i < 12; i++) {
        const angleDeg = -90 + (i + rotateOffset) * (360 / 12);
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        next.push({ id: i + 1, x, y, label: monthLabels[i] });
      }

      // Theme card at center
      next.push({ id: 13, x: centerX, y: centerY, label: 'THEME' });

      setPositions(next);
    };

    calculatePositions();
    const ro = new ResizeObserver(() => calculatePositions());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="thirteen-card-slots w-full max-w-6xl mx-auto py-8 px-4">
      {/* 仅保留卡牌环形布局：不再绘制任何圆环装饰线 */}
      <div
        ref={orbitRef}
        className="relative w-full mx-auto min-h-[640px] sm:min-h-[780px] md:min-h-[900px]"
      >
        {positions.length > 0 && cards.map((card, index) => {
          const pos = positions[index];
          if (!pos) return null;
        const isFlipped = forceFlipped || (card && !isAnimating[index]);
        const isCenter = index === 12; // 第13张是中心牌
        
        return (
          <div 
            key={index} 
            className="absolute"
            style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: isCenter ? 20 : 10,
            }}
          >
              {/* 标签不参与几何中心计算，避免环形看起来“变形” */}
              <div className="relative flex items-center justify-center">
                <div className={`absolute -top-6 text-xs ${isCenter ? 'text-primary font-extrabold text-sm' : 'text-white/40 font-semibold'} uppercase tracking-wider whitespace-nowrap`}>
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
                      isCenter
                        ? 'w-[clamp(80px,20vw,104px)] h-[clamp(120px,30vw,152px)] sm:w-32 sm:h-48 md:w-36 md:h-52'
                        : 'w-[clamp(64px,18vw,88px)] h-[clamp(96px,27vw,132px)] sm:w-28 sm:h-40 md:w-28 md:h-40'
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
                    className={`${
                      isCenter
                        ? 'w-[clamp(80px,20vw,104px)] h-[clamp(120px,30vw,152px)] sm:w-32 sm:h-48 md:w-36 md:h-52'
                        : 'w-[clamp(64px,18vw,88px)] h-[clamp(96px,27vw,132px)] sm:w-28 sm:h-40 md:w-28 md:h-40'
                    } rounded-lg border-2 border-dashed ${isCenter ? 'border-primary/30 bg-primary/5' : 'border-white/15 bg-white/5'} flex items-center justify-center backdrop-blur-sm`}
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
      </div>
      
      {/* Loading text */}
      {showLoadingText && cards.filter(c => c !== null).length < 13 && (
        <div className="mt-6 text-center text-white/50 text-sm">
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

