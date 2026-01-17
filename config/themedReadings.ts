/**
 * 主题占卜配置
 * Theme-based Tarot Reading Configuration
 */

export type SpreadTheme = 'love' | 'career-study' | 'wealth';

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
  cards?: Array<{ id: string; name: string; meaning: string }>;
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
    id: 'future-lover',
    titleZh: '未来恋人牌阵',
    titleEn: 'Future Lover Spread',
    descZh: '看看未来恋人的画像与相遇路径',
    descEn: 'Explore your future lover and how to meet them',
    cardsCount: 6,
    isPaid: false,
    icon: '💕',
    badge: 'New',
  },
  {
    id: 'what-they-think',
    titleZh: '对方在想什么',
    titleEn: 'What They Think',
    descZh: '探索对方此刻的真实想法、感受与关系的短期走向',
    descEn: 'Explore their true thoughts, feelings and short-term direction',
    cardsCount: 6,
    isPaid: false,
    icon: '💭',
  },
  {
    id: 'relationship-development',
    titleZh: '这段感情的发展',
    titleEn: 'Relationship Development',
    descZh: '抽取 8 张牌，看看这段关系的真实状态与自然走向',
    descEn: 'Draw 8 cards to see the real state and natural direction of this relationship',
    cardsCount: 8,
    isPaid: true, // 会员功能，但暂时在路由层面绕过拦截
    icon: '🌸',
  },
  
  // 会员牌阵 (1个)
  {
    id: 'reconciliation',
    titleZh: '复合的可能性',
    titleEn: 'Reconciliation Potential',
    descZh: '评估重新靠近的空间与代价，给你更稳的选择',
    descEn: 'Assess the space and cost of getting close again',
    cardsCount: 10,
    isPaid: true,
    icon: '🌙',
    cards: [
      { id: "guide", name: "指引牌", meaning: "这组牌想提醒你的核心问题" },
      { id: "p1", name: "这段关系是如何走散的", meaning: "这段关系当初真正分开的原因" },
      { id: "p2", name: "你现在为什么会卡在这里", meaning: "你当前的情绪状态与纠结来源" },
      { id: "p3", name: "TA目前的真实状态", meaning: "TA现在对这段关系的真实立场" },
      { id: "p4", name: "你对复合的真实感受", meaning: "你内心深处对复合的真实想法" },
      { id: "p5", name: "TA面对复合的感受", meaning: "TA对复合这件事的真实态度" },
      { id: "p6", name: "你们之间最大的阻碍", meaning: "当前最难跨越的核心问题" },
      { id: "p7", name: "对你有利的帮助或转机", meaning: "可能出现的支持或转机" },
      { id: "p8", name: "你还没意识到的关键因素", meaning: "被忽略但重要的变量" },
      { id: "p9", name: "你真正需要做出的选择", meaning: "这段关系对你提出的最终课题" }
    ]
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
  'career-study': {
    id: 'career-study',
    titleZh: '事业 & 学业',
    titleEn: 'Career & Study',
    descZh: '探索方向、准备关键节点、做更清醒的选择',
    descEn: 'Explore directions, prepare for key milestones, and make clearer choices',
    icon: 'school',
    spreads: [
      {
        id: 'skills-direction',
        titleZh: '我应该找什么样的工作 / 学什么技能？',
        titleEn: 'Career Direction & Skills',
        descZh: '理清你的优势与能量倾向，找到更适合你的方向与成长路径。',
        descEn: 'Clarify your strengths and energy tendencies to find a suitable direction.',
        cardsCount: 5,
        isPaid: false,
        icon: '🧭',
        cards: [
          { id: "p1", name: "内心真正渴望的状态", meaning: "我内心真正渴望的工作/发展状态是什么？" },
          { id: "p2", name: "最适合的靠近方向", meaning: "我现在最适合往哪个方向去靠近它？" },
          { id: "p3", name: "核心优势或潜力", meaning: "我目前最能拿得出手的优势或潜力是什么？" },
          { id: "p4", name: "可获得的资源支持", meaning: "我可以从哪里获得支持或资源？" },
          { id: "p5", name: "需要调整或补强", meaning: "我现在最需要调整或补强的地方是什么？" }
        ]
      },
      {
        id: 'interview-tips',
        titleZh: '面试 / 考试关键提醒牌阵',
        titleEn: 'Interview & Exam Tips',
        descZh: '看清优势、风险点与准备重点，把能掌控的部分做到最好。',
        descEn: 'See strengths, risks, and preparation focus to do your best.',
        cardsCount: 4,
        isPaid: false,
        icon: '📝',
      },
      {
        id: 'offer-decision',
        titleZh: '我已经拿到 offer / 录取 / 合作邀请了，要不要接受？',
        titleEn: 'Offer Decision',
        descZh: '在选择分岔口看清代价与机会，帮你做更安心的决定。',
        descEn: 'See costs and opportunities at the crossroads to make a better decision.',
        cardsCount: 6,
        isPaid: true,
        icon: '✉️',
      },
      {
        id: 'stay-or-leave',
        titleZh: '这份工作还值得我继续做下去吗？',
        titleEn: 'Stay or Leave',
        descZh: '评估继续投入的意义、消耗与转机，判断坚持是否仍然值得。',
        descEn: 'Assess the meaning, exhaustion, and opportunities of staying.',
        cardsCount: 5,
        isPaid: true,
        icon: '⚖️',
      },
    ],
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

