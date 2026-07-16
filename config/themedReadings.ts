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
  /** 列表卡片上展示的价值标签；未配置时保持现有卡片样式 */
  tagsZh?: Array<{ icon: string; label: string }>;
  tagsEn?: Array<{ icon: string; label: string }>;
  /** 列表卡片上展示的核心解读维度 */
  dimensionsZh?: string[];
  dimensionsEn?: string[];
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
    descZh: '还没有明确的对象，但想知道下一段缘分可能怎么靠近？六张牌会看看 TA 可能是什么类型、是否已经出现、相遇的阻力，以及你可以做些什么。',
    descEn: 'No specific person in mind, but curious about your next relationship? This six-card spread explores what they may be like, whether they may already be nearby, what could delay the connection, and what you can do.',
    tagsZh: [
      { icon: 'redeem', label: '免费' },
      { icon: 'favorite', label: '未来缘分' },
      { icon: 'style', label: '6张牌' },
    ],
    tagsEn: [
      { icon: 'redeem', label: 'Free' },
      { icon: 'favorite', label: 'Future Love' },
      { icon: 'style', label: '6 Cards' },
    ],
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
    descZh: '心里已经有一个明确的人，但拿不准 TA 对你是什么感觉？六张牌会对照 TA 说出口的话、真实想法和实际行动，看看这段互动短期内会怎么变化。',
    descEn: 'Have someone specific in mind, but unsure how they feel about you? Six cards compare what they say, think, feel, and actually do, then look at the connection’s short-term direction.',
    tagsZh: [
      { icon: 'redeem', label: '免费' },
      { icon: 'psychology', label: 'TA的心意' },
      { icon: 'style', label: '6张牌' },
    ],
    tagsEn: [
      { icon: 'redeem', label: 'Free' },
      { icon: 'psychology', label: 'Their Feelings' },
      { icon: 'style', label: '6 Cards' },
    ],
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
    descZh: '你们正在接触、暧昧或拉扯，想知道有没有机会真正走到一起？八张牌会对照双方的真实状态和彼此印象，再看这段关系从过去到未来会怎么发展。',
    descEn: 'Talking, dating, or stuck in an unclear connection and wondering if it can become a relationship? Eight cards compare both sides, how you see each other, and where the connection is heading.',
    tagsZh: [
      { icon: 'paid', label: '付费' },
      { icon: 'timeline', label: '关系走向' },
      { icon: 'style', label: '8张牌' },
    ],
    tagsEn: [
      { icon: 'paid', label: 'Paid' },
      { icon: 'timeline', label: 'Relationship Path' },
      { icon: 'style', label: '8 Cards' },
    ],
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
    descZh: '已经分开，却还在犹豫要不要等、要不要重新联系？十张牌会拆开走散的原因、双方对复合的真实态度、最大的阻碍和可能转机，帮你看清下一步选择。',
    descEn: 'Separated, but unsure whether to wait or reach out again? Ten cards examine why you drifted apart, how both sides feel about reconnecting, the main obstacle, possible turning points, and your next choice.',
    tagsZh: [
      { icon: 'paid', label: '付费' },
      { icon: 'heart_broken', label: '复合分析' },
      { icon: 'style', label: '10张牌' },
    ],
    tagsEn: [
      { icon: 'paid', label: 'Paid' },
      { icon: 'heart_broken', label: 'Reconciliation' },
      { icon: 'style', label: '10 Cards' },
    ],
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
        descZh: '选择太多，不知道该学什么、做什么，或者下一步往哪里走？五张牌会从你的真实期待、优势潜力和可用资源出发，帮你缩小方向。',
        descEn: 'Too many choices and unsure what to study, pursue, or do next? Five cards use your real goals, strengths, potential, and available support to help narrow the direction.',
        tagsZh: [
          { icon: 'redeem', label: '免费' },
          { icon: 'explore', label: '方向探索' },
          { icon: 'style', label: '5张牌' },
        ],
        tagsEn: [
          { icon: 'redeem', label: 'Free' },
          { icon: 'explore', label: 'Path Finding' },
          { icon: 'style', label: '5 Cards' },
        ],
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
        descZh: '面试或考试快到了，心里没底，不知道最后该补哪里？五张牌会看看你的优势、目前的盲点和可能影响发挥的因素，再给出可以马上准备的方向。',
        descEn: 'An interview or exam is coming up and you are unsure what to prepare last? Five cards highlight your strengths, blind spots, likely influences, and what you can do now.',
        tagsZh: [
          { icon: 'redeem', label: '免费' },
          { icon: 'fact_check', label: '临场准备' },
          { icon: 'style', label: '5张牌' },
        ],
        tagsEn: [
          { icon: 'redeem', label: 'Free' },
          { icon: 'fact_check', label: 'Final Preparation' },
          { icon: 'style', label: '5 Cards' },
        ],
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
        descZh: 'Offer 已经摆在面前，却拿不准值不值得接？六张牌会评估契合度、成长空间、团队环境和隐藏代价，也会看看你是否还有别的机会。',
        descEn: 'Have an offer in hand but cannot tell whether it is worth taking? Six cards assess fit, growth, team dynamics, hidden costs, and whether other opportunities may still be available.',
        tagsZh: [
          { icon: 'paid', label: '付费' },
          { icon: 'contract', label: '机会评估' },
          { icon: 'style', label: '6张牌' },
        ],
        tagsEn: [
          { icon: 'paid', label: 'Paid' },
          { icon: 'contract', label: 'Offer Review' },
          { icon: 'style', label: '6 Cards' },
        ],
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
        descZh: '这份工作越来越消耗，但又怕离开后后悔？七张牌会梳理你现在的处境、职场关系、优势短板、成长空间和未来趋势，帮你判断问题还能不能改善。',
        descEn: 'This job is draining you, but leaving feels risky? Seven cards review your situation, workplace relationships, strengths, weaknesses, growth space, and likely trend to see what may still improve.',
        tagsZh: [
          { icon: 'paid', label: '付费' },
          { icon: 'balance', label: '职业去留' },
          { icon: 'style', label: '7张牌' },
        ],
        tagsEn: [
          { icon: 'paid', label: 'Paid' },
          { icon: 'balance', label: 'Stay or Leave' },
          { icon: 'style', label: '7 Cards' },
        ],
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
        descZh: '最近总觉得钱不太顺，想先快速看看问题出在哪里？三张牌会看你现在的金钱状态、主要影响因素，以及按目前情况发展下去的近期趋势。',
        descEn: 'Money has felt uncertain lately and you want a quick check-in? Three cards look at your current financial state, the main influence, and the near-term direction if things continue as they are.',
        tagsZh: [
          { icon: 'redeem', label: '免费' },
          { icon: 'monitoring', label: '财务速览' },
          { icon: 'style', label: '3张牌' },
        ],
        tagsEn: [
          { icon: 'redeem', label: 'Free' },
          { icon: 'monitoring', label: 'Money Snapshot' },
          { icon: 'style', label: '3 Cards' },
        ],
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
        descZh: '收入或存款一直难有改善，却说不清到底卡在哪里？五张牌会分开看外在现实、你的金钱态度和真正的核心阻碍，再找到可以开始调整的地方。',
        descEn: 'Income or savings are not improving, but you cannot see what is holding you back? Five cards separate external realities, your money mindset, the core obstacle, and where change can begin.',
        tagsZh: [
          { icon: 'paid', label: '付费' },
          { icon: 'troubleshoot', label: '阻碍诊断' },
          { icon: 'style', label: '5张牌' },
        ],
        tagsEn: [
          { icon: 'paid', label: 'Paid' },
          { icon: 'troubleshoot', label: 'Block Analysis' },
          { icon: 'style', label: '5 Cards' },
        ],
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

