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
  /** 访问权限：free 免费（非会员每日限制3次），member 会员专属 */
  access?: 'free' | 'member';
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
    titleZh: '我未来的恋人在哪里？',
    titleEn: 'Where Is My Future Lover?',
    descZh: '看看你可能如何遇见 TA，以及这段缘分会以什么方式靠近。',
    descEn: 'Explore how you may meet them and how this connection may come closer.',
    cardsCount: 6,
    isPaid: false,
    access: 'free',
    icon: '💕',
    badge: 'New',
  },
  {
    id: 'what-they-think',
    spreadType: 'love-what-they-think',
    titleZh: 'TA 是怎么看我的？',
    titleEn: 'How Do They See Me?',
    descZh: '看看对方对你的真实想法、感受，以及短期内可能的态度变化。',
    descEn: 'Explore their thoughts, feelings, and possible short-term direction toward you.',
    cardsCount: 6,
    isPaid: false,
    access: 'free',
    icon: '💭',
  },
  {
    id: 'relationship-development',
    spreadType: 'love-relationship-development',
    titleZh: '我们会在一起吗？',
    titleEn: 'Will We Be Together?',
    descZh: '看看这段关系现在的状态、阻碍，以及接下来可能怎么发展。',
    descEn: 'Look at the current state, obstacles, and possible next direction of this connection.',
    cardsCount: 8,
    isPaid: true,
    access: 'member',
    icon: '🌸',
  },
  
  // 会员牌阵 (1个)
  {
    id: 'reconciliation',
    spreadType: 'love-reconciliation',
    titleZh: '我们还会复合吗？',
    titleEn: 'Will We Get Back Together?',
    descZh: '看看彼此之间还有没有靠近的空间，以及复合需要面对什么。',
    descEn: 'Explore whether there is still room to reconnect and what needs to be faced.',
    cardsCount: 10,
    isPaid: true,
    access: 'member',
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
        titleZh: '我适合往哪个方向发展？',
        titleEn: 'Which Direction Fits Me Best?',
        descZh: '看看你的优势、状态和潜力，找到更适合你的工作、学习或成长方向。',
        descEn: 'Explore your strengths, current energy, and potential path for work, study, or growth.',
        cardsCount: 5,
        isPaid: false,
        access: 'free',
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
        titleZh: '这次面试或考试，我要注意什么？',
        titleEn: 'What Should I Watch For in This Interview or Exam?',
        descZh: '看看重点在哪里、容易忽略什么，以及你可以提前准备的地方。',
        descEn: 'See the key focus, what may be easy to miss, and what you can prepare in advance.',
        cardsCount: 5,
        isPaid: false,
        access: 'free',
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
        titleZh: '这个 Offer 我该接吗？',
        titleEn: 'Should I Take This Offer?',
        descZh: '看看这个机会适不适合你，以及接受之后可能带来的成长、压力和代价。',
        descEn: 'Look at whether this opportunity fits you, and what growth, pressure, or cost may come with it.',
        cardsCount: 6,
        isPaid: true,
        access: 'member',
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
        titleZh: '这份工作，我该留下还是离开？',
        titleEn: 'Should I Stay or Leave This Job?',
        descZh: '看看继续留下的意义、消耗、转机，以及离开前需要想清楚的事。',
        descEn: 'Explore the meaning, exhaustion, turning points, and what to consider before leaving.',
        cardsCount: 7,
        isPaid: true,
        access: 'member',
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
        titleZh: '我现在的财运怎么样？',
        titleEn: 'How Is My Money Luck Right Now?',
        descZh: '看看你当前的金钱状态、影响因素，以及近期可能的财务走向。',
        descEn: 'Look at your current money situation, key influences, and possible near-term financial direction.',
        cardsCount: 3,
        isPaid: false,
        access: 'free',
        icon: '💰',
      },
      {
        id: 'wealth-obstacles',
        spreadType: 'wealth-obstacles',
        titleZh: '是什么挡住了我的财运？',
        titleEn: 'What Is Blocking My Money Flow?',
        descZh: '看看哪些现实因素、习惯或心态正在影响你的收入、机会和财务改善。',
        descEn: 'Explore what practical factors, habits, or mindset may be affecting your income, opportunities, and financial improvement.',
        cardsCount: 5,
        isPaid: true,
        access: 'member',
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

