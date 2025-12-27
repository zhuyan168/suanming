// 年度运势相关类型定义

/**
 * 塔罗牌基础类型（与 CardItem.tsx 保持一致）
 */
export interface TarotCard {
  id: string;
  name: string;
  nameEn?: string;
  imageUrl: string;
  isReversed: boolean;
  suit?: string;
  number?: string;
  upright?: string;    // 正位含义
  reversed?: string;   // 逆位含义
  keywords?: string[]; // 关键词
}

/**
 * 年度运势抽牌结果
 */
export interface AnnualFortuneReading {
  id: string;
  createdAt: string;
  themeCard: TarotCard;                 // 年度主题牌（中心）
  monthCards: Record<number, TarotCard>; // 1-12 月
  meta?: {
    year: number;
    timezone?: string;
    locale?: string;
  };
}

/**
 * 月度运势解读
 */
export interface MonthInterpretation {
  keywords: string[];      // 1-2 个关键词
  focusAreas: string[];    // 重点领域
  advice: string;          // 一句建议
  risk?: string;           // 风险提示（可选）
  monthlyNote?: string;    // 本月特别注意事项（新增）
}

/**
 * 年度运势完整解读
 */
export interface AnnualInterpretation {
  // 年度总运
  yearKeywords: string[];        // 3-5 个关键词
  yearOverview: string[];        // 年度主线（2-4 句话）
  yearWarnings: string[];        // 需要注意（2-3 条）
  
  // 月度运势（1-12月）
  months: Record<number, MonthInterpretation>;
  
  // 全年总结
  highlights: number[];          // 高光月份（2-3个月份数字）
  lowlights: number[];           // 低潮月份（1-2个月份数字）
  actionList: string[];          // 年度行动清单（3条）
}

/**
 * 页面状态类型
 */
export type PageState = 'loading' | 'error' | 'empty' | 'success';

/**
 * 重点领域枚举
 */
export enum FocusArea {
  Career = '事业',
  Finance = '财务',
  Love = '感情',
  Relationship = '人际',
  Health = '健康',
  Study = '学业',
  Family = '家庭'
}

