/**
 * 主题占卜配置
 * Theme-based Tarot Reading Configuration
 */

export type SpreadTheme = 'love' | 'career-study' | 'wealth';

import type { ReactNode } from 'react';

export interface SpreadConfig {
  id: string;
  /** 统一的 spread_type key，写入数据库时使用此字段 */
  spreadType?: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  cardsCount: number;
  isPaid: boolean;
  icon?: ReactNode; // emoji, text, or icon component
  badge?: string; // e.g., "Most Popular"
  href?: string;
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
    spreadType: 'love-future-lover',
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
    spreadType: 'love-what-they-think',
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
    spreadType: 'love-relationship-development',
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
    spreadType: 'love-reconciliation',
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
        spreadType: 'career-skills-direction',
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
        id: 'interview-exam-key-reminders',
        spreadType: 'career-interview-exam',
        titleZh: '面试 / 考试关键提醒牌阵',
        titleEn: 'Interview & Exam Key Reminders',
        descZh: '看清重点，避开容易忽略的坑，把能掌控的部分做到最好。',
        descEn: 'See key focus areas, avoid pitfalls, and do your best in what you can control.',
        cardsCount: 5,
        isPaid: false,
        icon: '📝',
        cards: [
          { id: "p1", name: "你现在最不确定的地方", meaning: "你现在最不确定的地方" },
          { id: "p2", name: "你现在的优势在哪里", meaning: "你现在的优势在哪里" },
          { id: "p3", name: "事情目前的整体走向", meaning: "事情目前的整体走向" },
          { id: "p4", name: "目前可能影响你的地方", meaning: "目前可能影响你的地方" },
          { id: "p5", name: "接下来你可以主动做什么", meaning: "接下来你可以主动做什么" }
        ]
      },
      {
        id: 'offer-decision',
        spreadType: 'career-offer-decision',
        titleZh: '我已经拿到offer了，要不要接受？',
        titleEn: 'Offer Decision',
        descZh: '在选择分岔口看清代价与机会，帮你做更安心的决定。',
        descEn: 'See costs and opportunities at the crossroads to make a better decision.',
        cardsCount: 6,
        isPaid: true,
        icon: '✉️',
        cards: [
          { id: "p1", name: "这项机会与你的契合程度", meaning: "这项机会与你的契合程度" },
          { id: "p2", name: "接受后可能获得的成长与发展空间", meaning: "接受这项机会后，你可能获得的成长与发展空间" },
          { id: "p3", name: "需要面对的人际关系与协作状态", meaning: "这项机会中你需要面对的人际关系与协作状态" },
          { id: "p4", name: "对方/环境对你的真实期待与态度", meaning: "对方 / 环境对你的真实期待与态度" },
          { id: "p5", name: "需要特别留意的风险与代价", meaning: "接受这项机会后，你需要特别留意的风险与代价" },
          { id: "p6", name: "除了它之外还存在的其他机会", meaning: "除了它之外，你目前还存在的其他机会" }
        ]
      },
      {
        id: 'stay-or-leave',
        spreadType: 'career-stay-or-leave',
        titleZh: '这份工作是否值得继续做下去？',
        titleEn: 'Stay or Leave',
        descZh: '评估继续投入的意义、消耗与转机，判断坚持是否仍然值得。',
        descEn: 'Assess the meaning, exhaustion, and opportunities of staying.',
        cardsCount: 7,
        isPaid: true,
        icon: '⚖️',
        cards: [
          { id: "p1", name: "你现在的职业状态", meaning: "你现在的职业状态" },
          { id: "p2", name: "工作方面的优势", meaning: "工作方面的优势" },
          { id: "p3", name: "工作方面的劣势", meaning: "工作方面的劣势" },
          { id: "p4", name: "领导/上司对自己的看法", meaning: "领导/上司对自己的看法" },
          { id: "p5", name: "同事/下属对自己的看法", meaning: "同事/下属对自己的看法" },
          { id: "p6", name: "个人成长进步空间", meaning: "个人成长进步空间" },
          { id: "p7", name: "工作未来发展趋势", meaning: "工作未来发展趋势" }
        ]
      },
    ],
  },
  wealth: {
    id: 'wealth',
    titleZh: '财富',
    titleEn: 'Wealth',
    descZh: '看清金钱的流动与阻碍，做更踏实的选择',
    descEn: 'See the flow and obstacles of money, make more solid choices',
    icon: 'paid',
    spreads: [
      {
        id: 'current-wealth-status',
        spreadType: 'wealth-current-status',
        titleZh: '我现在的财运如何？',
        titleEn: 'Current Wealth Status',
        descZh: '用三张牌快速看清你当前的财运状态、影响因素与近期走向。',
        descEn: 'Quickly see your current wealth status, influences, and near-term trends with three cards.',
        cardsCount: 3,
        isPaid: false,
        icon: '💰',
      },
      {
        id: 'wealth-obstacles',
        spreadType: 'wealth-obstacles',
        titleZh: '我现在的财富阻碍是什么？',
        titleEn: 'Wealth Obstacles',
        descZh: '从现状、外在影响、你的态度与阻碍点出发，找到财务改善的突破口。',
        descEn: 'Find the breakthrough for financial improvement from current status, external influences, attitude, and obstacles.',
        cardsCount: 5,
        isPaid: true,
        icon: '🚧',
        cards: [
          { id: "p1", name: "你当前的财务状况", meaning: "你当前的财务状况" },
          { id: "p2", name: "影响你财务的外在因素", meaning: "影响你财务的外在因素" },
          { id: "p3", name: "你对自己财务状况的态度", meaning: "你对自己财务状况的态度" },
          { id: "p4", name: "阻碍你财务改善的原因", meaning: "阻碍你财务改善的原因" },
          { id: "p5", name: "你可以如何突破这一财务阻碍", meaning: "你可以如何突破这一财务阻碍" }
        ]
      },
    ],
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

