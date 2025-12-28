/**
 * 主题占卜配置
 * Theme-based Tarot Reading Configuration
 */

export type SpreadTheme = 'love' | 'career' | 'wealth';

export interface SpreadConfig {
  id: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  cardsCount: number;
  isPaid: boolean;
  icon?: string; // emoji or lucide icon name
  badge?: string; // e.g., "Most Popular"
}

export interface ThemeConfig {
  id: SpreadTheme;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  icon: string;
  spreads: SpreadConfig[];
}

/**
 * 爱情主题牌阵配置
 */
export const LOVE_SPREADS: SpreadConfig[] = [
  // 免费牌阵 (2个)
  {
    id: 'love-relationship-snapshot',
    titleZh: '感情现状',
    titleEn: 'Relationship Snapshot',
    descZh: '快速了解你当前的感情状态与能量',
    descEn: 'Quick insight into your current relationship energy',
    cardsCount: 3,
    isPaid: false,
    icon: '💕',
  },
  {
    id: 'love-their-feelings',
    titleZh: '对方想法',
    titleEn: 'Their Feelings Quick Read',
    descZh: '探索对方对你的真实想法与感受',
    descEn: 'Explore what they truly feel about you',
    cardsCount: 3,
    isPaid: false,
    icon: '💭',
  },
  
  // 付费牌阵 (4个)
  {
    id: 'love-relationship-outcome',
    titleZh: '关系走向',
    titleEn: 'Relationship Outcome',
    descZh: '深入了解这段关系的未来发展方向',
    descEn: 'Deep dive into where this relationship is heading',
    cardsCount: 5,
    isPaid: true,
    icon: '🔮',
  },
  {
    id: 'love-reconciliation',
    titleZh: '复合可能',
    titleEn: 'Reconciliation Potential',
    descZh: '评估旧情复燃的可能性与建议',
    descEn: 'Assess the potential for rekindling an old flame',
    cardsCount: 5,
    isPaid: true,
    icon: '🌙',
  },
  {
    id: 'love-deep-connection',
    titleZh: '深层连接',
    titleEn: 'Deep Connection',
    descZh: '揭示你们灵魂层面的连接与课题',
    descEn: 'Reveal your soul-level connection and lessons',
    cardsCount: 6,
    isPaid: true,
    icon: '✨',
  },
  {
    id: 'love-action-guidance',
    titleZh: '行动建议',
    titleEn: 'Action Guidance',
    descZh: '获取具体可行的感情行动方案',
    descEn: 'Get practical advice on your next steps in love',
    cardsCount: 4,
    isPaid: true,
    icon: '🎯',
  },
];

/**
 * 全部主题配置（目前仅实现 Love，其他预留）
 */
export const THEMED_READINGS_CONFIG: Record<SpreadTheme, ThemeConfig> = {
  love: {
    id: 'love',
    titleZh: '爱情',
    titleEn: 'Love',
    descZh: '探索感情的奥秘，找到爱的答案',
    descEn: 'Explore the mysteries of love and find your answers',
    icon: 'favorite',
    spreads: LOVE_SPREADS,
  },
  career: {
    id: 'career',
    titleZh: '事业 & 学业',
    titleEn: 'Career & Study',
    descZh: '洞察职业发展与学习之路',
    descEn: 'Gain insights into your professional and academic journey',
    icon: 'school',
    spreads: [], // TODO: 待实现
  },
  wealth: {
    id: 'wealth',
    titleZh: '财富',
    titleEn: 'Wealth',
    descZh: '了解财运走向，把握财富机遇',
    descEn: 'Understand your financial fortune and opportunities',
    icon: 'paid',
    spreads: [], // TODO: 待实现
  },
};

/**
 * 根据主题获取配置
 */
export function getThemeConfig(theme: SpreadTheme): ThemeConfig | undefined {
  return THEMED_READINGS_CONFIG[theme];
}

/**
 * 根据牌阵ID获取配置
 */
export function getSpreadConfig(theme: SpreadTheme, spreadId: string): SpreadConfig | undefined {
  const themeConfig = getThemeConfig(theme);
  return themeConfig?.spreads.find(spread => spread.id === spreadId);
}

