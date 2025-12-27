/**
 * 年度运势牌阵展示组件
 * 展示中心年度主题牌 + 12个月份牌的环形布局
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard } from '../../types/annual-fortune';
import CardDetailModal from './CardDetailModal';

interface AnnualSpreadViewProps {
  themeCard: TarotCard;
  monthCards: Record<number, TarotCard>;
  showLabels?: boolean;  // 是否显示月份标签
}

const MONTH_LABELS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

export default function AnnualSpreadView({ 
  themeCard, 
  monthCards, 
  showLabels = true 
}: AnnualSpreadViewProps) {
  const [selectedCard, setSelectedCard] = useState<{ card: TarotCard; label: string } | null>(null);

  // 计算月份牌的环形位置（12个点围绕中心）
  const getMonthCardPosition = (month: number) => {
    // month 从 1 到 12
    // 从顶部（12点方向）开始，顺时针排列
    // 调整角度使 1月 在右侧 (3点方向)
    const angle = ((month - 1) / 12) * 360 - 90; // -90 让 1月 从 3点方向开始
    const radian = (angle * Math.PI) / 180;
    
    // 响应式半径
    const radius = 42; // 百分比单位
    
    const x = 50 + radius * Math.cos(radian); // 中心是 50%, 50%
    const y = 50 + radius * Math.sin(radian);
    
    return { x, y };
  };

  const handleCardClick = (card: TarotCard, label: string) => {
    setSelectedCard({ card, label });
  };

  return (
    <>
      <div className="relative w-full max-w-4xl mx-auto" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          {/* 中心年度主题牌 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            onClick={() => handleCardClick(themeCard, '年度主题')}
          >
            <div className="relative">
              {/* 发光圆环背景 */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 -m-4 rounded-full bg-primary/20 blur-xl"
              />
              
              {/* 卡牌 */}
              <div 
                className={`relative w-24 h-36 sm:w-32 sm:h-48 md:w-36 md:h-54 rounded-xl overflow-hidden border-2 ${
                  themeCard.isReversed ? 'border-amber-400' : 'border-primary'
                } shadow-[0_0_30px_rgba(127,19,236,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(127,19,236,0.7)]`}
              >
                <img
                  src={themeCard.imageUrl}
                  alt={themeCard.name}
                  className={`w-full h-full object-cover ${
                    themeCard.isReversed ? 'transform rotate-180' : ''
                  }`}
                  style={{ backgroundColor: 'white' }}
                />
              </div>

              {/* 标签 */}
              {showLabels && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-xs sm:text-sm font-bold shadow-lg">
                    年度主题
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* 12个月份牌 */}
          {Object.entries(monthCards).map(([monthStr, card]) => {
            const month = parseInt(monthStr);
            const { x, y } = getMonthCardPosition(month);
            const delay = 0.3 + month * 0.05;

            return (
              <motion.div
                key={month}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay }}
                className="absolute cursor-pointer group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleCardClick(card, MONTH_LABELS[month - 1])}
              >
                <div className="relative">
                  {/* 卡牌 */}
                  <div 
                    className={`relative w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 rounded-lg overflow-hidden border-2 ${
                      card.isReversed ? 'border-amber-400/50' : 'border-green-400/50'
                    } shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(127,19,236,0.6)]`}
                  >
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className={`w-full h-full object-cover ${
                        card.isReversed ? 'transform rotate-180' : ''
                      }`}
                      style={{ backgroundColor: 'white' }}
                    />
                  </div>

                  {/* 月份标签 */}
                  {showLabels && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                        {MONTH_LABELS[month - 1]}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 卡牌详情弹窗 */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard.card}
          monthLabel={selectedCard.label}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}

