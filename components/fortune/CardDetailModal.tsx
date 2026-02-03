/**
 * 牌面详情弹窗组件
 * 用于展示单张牌的详细信息
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard } from '../../types/annual-fortune';

// 兼容旧数据格式的辅助函数：获取含义文本
const getMeaning = (value: string | { keywords: string[]; meaning: string } | undefined): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.meaning || '';
};

interface CardDetailModalProps {
  card: TarotCard | null;
  monthLabel?: string;  // 例如："一月"、"年度主题"
  onClose: () => void;
}

export default function CardDetailModal({ card, monthLabel, onClose }: CardDetailModalProps) {
  if (!card) return null;

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-md w-full bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-2xl shadow-2xl border border-primary/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined notranslate text-white text-xl">close</span>
          </button>

          {/* 内容区域 */}
          <div className="p-6">
            {/* 月份标签 */}
            {monthLabel && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-sm font-bold">
                  {monthLabel}
                </span>
              </div>
            )}

            {/* 卡牌图片 */}
            <div className="mb-6 flex justify-center">
              <div 
                className={`relative w-48 h-72 rounded-xl overflow-hidden border-2 ${
                  card.isReversed ? 'border-amber-400' : 'border-green-400'
                } shadow-xl`}
              >
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className={`w-full h-full object-cover ${
                    card.isReversed ? 'transform rotate-180' : ''
                  }`}
                  style={{
                    backgroundColor: 'white',
                  }}
                />
              </div>
            </div>

            {/* 卡牌名称 */}
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{card.name}</h2>
              {card.nameEn && (
                <p className="text-white/60 text-sm">{card.nameEn}</p>
              )}
            </div>

            {/* 正逆位标签 */}
            <div className="mb-4 flex justify-center">
              <span 
                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                  card.isReversed 
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                    : 'bg-green-400/20 text-green-300 border border-green-400/30'
                }`}
              >
                {card.isReversed ? '逆位 Reversed' : '正位 Upright'}
              </span>
            </div>

            {/* 关键词 */}
            {card.keywords && card.keywords.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white/70 mb-2">关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {card.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-md bg-white/10 text-white/80 text-sm border border-white/10"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 牌义 */}
            <div className="space-y-3">
              {card.upright && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h3 className="text-sm font-semibold text-green-300 mb-1">正位含义</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{getMeaning(card.upright)}</p>
                </div>
              )}

              {card.reversed && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h3 className="text-sm font-semibold text-amber-300 mb-1">逆位含义</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{getMeaning(card.reversed)}</p>
                </div>
              )}
            </div>

            {/* 卡牌信息 */}
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-white/50 text-xs">
                {card.suit && <span className="mr-2">花色: {card.suit}</span>}
                {card.number && <span>编号: {card.number}</span>}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

