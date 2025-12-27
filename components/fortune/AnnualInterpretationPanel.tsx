/**
 * 年度运势解读面板组件
 * 包含：年度总运、月度运势（Accordion）、全年总结
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnnualInterpretation, TarotCard } from '../../types/annual-fortune';

interface AnnualInterpretationPanelProps {
  interpretation: AnnualInterpretation;
  themeCard: TarotCard;
  monthCards: Record<number, TarotCard>;
}

const MONTH_LABELS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

export default function AnnualInterpretationPanel({
  interpretation,
  themeCard,
  monthCards
}: AnnualInterpretationPanelProps) {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const toggleMonth = (month: number) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  return (
    <div className="space-y-8">
      {/* ========== 1. 年度总运 ========== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 sm:p-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/10 backdrop-blur-sm"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-primary flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl">stars</span>
          年度总运
        </h2>

        {/* 年度关键词 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white/90 mb-3">年度关键词</h3>
          <div className="flex flex-wrap gap-2">
            {interpretation.yearKeywords.map((keyword, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-4 py-2 rounded-full bg-primary/20 text-primary font-medium text-sm sm:text-base border border-primary/30"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </div>

        {/* 年度主线 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white/90 mb-3">年度主线</h3>
          <div className="space-y-2">
            {interpretation.yearOverview.map((text, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-white/80 leading-relaxed text-base"
              >
                • {text}
              </motion.p>
            ))}
          </div>
        </div>

        {/* 需要注意 */}
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-3">需要注意</h3>
          <div className="space-y-2">
            {interpretation.yearWarnings.map((warning, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="material-symbols-outlined text-amber-400 text-xl mt-0.5">warning</span>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base flex-1">
                  {warning}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========== 2. 月度运势（Accordion） ========== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl">calendar_month</span>
          月度运势
        </h2>

        <div className="space-y-3">
          {Object.entries(interpretation.months).map(([monthStr, monthData], index) => {
            const month = parseInt(monthStr);
            const card = monthCards[month];
            const isExpanded = expandedMonth === month;
            const isHighlight = interpretation.highlights.includes(month);
            const isLowlight = interpretation.lowlights.includes(month);

            return (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                className={`rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                  isHighlight 
                    ? 'border-green-400/30 bg-green-500/5'
                    : isLowlight
                    ? 'border-amber-400/30 bg-amber-500/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {/* 月份标题栏（可点击展开/折叠） */}
                <button
                  onClick={() => toggleMonth(month)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* 月份标签 */}
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      isHighlight
                        ? 'bg-green-400/20 text-green-300'
                        : isLowlight
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/10 text-white/70'
                    }`}>
                      {MONTH_LABELS[month - 1]}
                    </span>

                    {/* 关键词预览 */}
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {monthData.keywords.map((keyword, kidx) => (
                        <span
                          key={kidx}
                          className="px-2 py-0.5 text-xs rounded-md bg-white/10 text-white/60"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    {/* 高光/低潮标记 */}
                    {isHighlight && (
                      <span className="text-green-400 text-xs font-medium">✨ 高光</span>
                    )}
                    {isLowlight && (
                      <span className="text-amber-400 text-xs font-medium">⚠️ 低潮</span>
                    )}
                  </div>

                  {/* 展开图标 */}
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="material-symbols-outlined text-white/50"
                  >
                    expand_more
                  </motion.span>
                </button>

                {/* 详细内容（展开时显示） */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-4 space-y-4">
                        {/* 卡牌信息 */}
                        {card && (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                            <div className="w-12 h-18 rounded overflow-hidden border border-white/20">
                              <img
                                src={card.imageUrl}
                                alt={card.name}
                                className={`w-full h-full object-cover ${
                                  card.isReversed ? 'transform rotate-180' : ''
                                }`}
                                style={{ backgroundColor: 'white' }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{card.name}</p>
                              <p className={`text-xs ${
                                card.isReversed ? 'text-amber-400' : 'text-green-400'
                              }`}>
                                {card.isReversed ? '逆位' : '正位'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 重点领域 */}
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2">重点领域</h4>
                          <div className="flex flex-wrap gap-2">
                            {monthData.focusAreas.map((area, aidx) => (
                              <span
                                key={aidx}
                                className="px-3 py-1 rounded-md bg-primary/10 text-primary text-sm border border-primary/20"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 建议 */}
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <h4 className="text-sm font-semibold text-green-300 mb-1">💡 建议</h4>
                          <p className="text-white/80 text-sm leading-relaxed">{monthData.advice}</p>
                        </div>

                        {/* 风险提示（如果有） */}
                        {monthData.risk && (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <h4 className="text-sm font-semibold text-amber-300 mb-1">⚠️ 风险提示</h4>
                            <p className="text-white/80 text-sm leading-relaxed">{monthData.risk}</p>
                          </div>
                        )}

                        {/* 本月注意事项（如果有） */}
                        {monthData.monthlyNote && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <h4 className="text-sm font-semibold text-blue-300 mb-1">📌 本月注意</h4>
                            <p className="text-white/80 text-sm leading-relaxed">{monthData.monthlyNote}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ========== 3. 全年总结 ========== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl">insights</span>
          全年总结
        </h2>

        <div className="space-y-6">
          {/* 高光月份 */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">trending_up</span>
              高光月份
            </h3>
            <div className="flex flex-wrap gap-2">
              {interpretation.highlights.map((month) => (
                <span
                  key={month}
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 font-medium border border-green-500/30"
                >
                  {MONTH_LABELS[month - 1]}
                </span>
              ))}
            </div>
            <p className="mt-2 text-white/60 text-sm">
              这些月份能量积极，适合推进重要计划和做出关键决定
            </p>
          </div>

          {/* 低潮月份 */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">trending_down</span>
              低潮月份
            </h3>
            <div className="flex flex-wrap gap-2">
              {interpretation.lowlights.map((month) => (
                <span
                  key={month}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                >
                  {MONTH_LABELS[month - 1]}
                </span>
              ))}
            </div>
            <p className="mt-2 text-white/60 text-sm">
              这些月份需要更多耐心，专注于基础工作和能量储备
            </p>
          </div>

          {/* 年度行动清单 */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">checklist</span>
              年度行动清单
            </h3>
            <div className="space-y-3">
              {interpretation.actionList.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-white/80 leading-relaxed text-sm sm:text-base flex-1">
                    {action}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

