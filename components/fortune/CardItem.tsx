import React from 'react';
import { motion } from 'framer-motion';

export interface TarotCard {
  id: number;
  name: string;
  image: string;
  upright: {
    keywords: string[];
    meaning: string;
  };
  reversed: {
    keywords: string[];
    meaning: string;
  };
  // 保留旧的字段以兼容
  keywords?: string[];
}

interface CardItemProps {
  card: TarotCard;
  index: number;
  onClick: (index: number) => void;
  isDisabled: boolean;
  isSelected: boolean;
}

export default function CardItem({ card, index, onClick, isDisabled, isSelected }: CardItemProps) {
  // 计算重叠偏移量，让卡牌看起来像折叠堆叠
  // 每张卡牌重叠一半宽度：
  // - 移动端: w-24 = 96px, 重叠 48px
  // - sm: w-28 = 112px, 重叠 56px  
  // - md: w-32 = 128px, 重叠 64px
  // z-index: 前面的卡牌（index小）层级更高，后面的卡牌（index大）层级更低
  // 这样前面的卡牌会遮挡后面的卡牌，形成堆叠效果
  const zIndex = isSelected ? 1000 : 200 - index; // 选中卡牌最高，其他按顺序递减（前面的卡牌层级更高）
  
  return (
    <motion.button
      onClick={() => !isDisabled && onClick(index)}
      disabled={isDisabled}
      animate={isSelected ? { y: -8, scale: 1.05 } : { y: 0, scale: 1 }}
      whileHover={!isDisabled && !isSelected ? { y: -8, scale: 1.05, zIndex: 999 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative flex-shrink-0 w-24 h-36 sm:w-28 sm:h-42 md:w-32 md:h-48
        rounded-lg overflow-hidden border-2 transition-all duration-300
        ${index === 0 ? '' : '-ml-12 sm:-ml-14 md:-ml-16'} 
        ${isSelected 
          ? 'border-primary shadow-[0_0_20px_rgba(127,19,236,0.6)]' 
          : 'border-white/20 hover:border-primary/50'
        }
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        zIndex: zIndex,
        boxShadow: isSelected 
          ? '0 0 20px rgba(127, 19, 236, 0.6), 0 8px 16px rgba(0, 0, 0, 0.3)' 
          : '0 2px 4px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* 卡背图 - 使用图片 */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
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
      
      {/* 选中时的光晕效果 */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </motion.button>
  );
}

