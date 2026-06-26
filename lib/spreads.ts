/**
 * 统一牌阵配置注册表
 *
 * 所有牌阵 / 占卜类型在此集中定义，使用稳定的英文 key（spread_type）。
 * - 数据库 reading_history.spread_type 只存 key
 * - 前端展示时通过 getSpreadByKey / getSpreadName 映射为中文名
 * - 路径、牌数等元数据也在此统一维护
 */

export type SpreadCategory =
  | 'general'
  | 'love'
  | 'career'
  | 'wealth'
  | 'fortune'
  | 'divination';

export type SpreadAccess = 'free' | 'member';

export interface SpreadMeta {
  key: string;
  name: string;
  nameEn: string;
  category: SpreadCategory;
  path: string;
  cardCount: number;
  isPaid: boolean;
  access: SpreadAccess;
  icon: string;
  /** 现有 config / data 文件中使用的 id（可能与 key 不同） */
  legacyId?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// 全量牌阵清单
// ---------------------------------------------------------------------------

export const SPREAD_LIST: SpreadMeta[] = [
  // ==================== 通用牌阵 ====================
  {
    key: 'three-card-general',
    name: '三张牌万能牌阵',
    nameEn: 'Three-Card Universal',
    category: 'general',
    path: '/reading/general/three-card-universal/question',
    cardCount: 3,
    isPaid: false,
    access: 'free',
    icon: '🔮',
    legacyId: 'three-card-universal',
    description: '适合还在犹豫、想先弄清自己现状的问题',
  },
  {
    key: 'sacred-triangle',
    name: '圣三角牌阵',
    nameEn: 'Sacred Triangle',
    category: 'general',
    path: '/reading/general/sacred-triangle/question',
    cardCount: 3,
    isPaid: false,
    access: 'free',
    icon: '🔺',
    description: '适合已经开始行动、需要判断下一步的问题',
  },
  {
    key: 'two-choices',
    name: '二选一牌阵',
    nameEn: 'Two Choices Spread',
    category: 'general',
    path: '/reading/general/two-choices/question',
    cardCount: 5,
    isPaid: false,
    access: 'free',
    icon: '🔀',
    description: '当你在 A / B 之间犹豫时，帮你看清差异与更合适的选择',
  },
  {
    key: 'hexagram',
    name: '六芒星牌阵',
    nameEn: 'Hexagram Spread',
    category: 'general',
    path: '/reading/general/hexagram/question',
    cardCount: 7,
    isPaid: false,
    access: 'member',
    icon: '🔯',
    legacyId: 'six-pointed-star',
    description: '适合复杂局面与多因素交织的问题，给出更全面的洞察',
  },
  {
    key: 'horseshoe',
    name: '马蹄铁牌阵',
    nameEn: 'Horseshoe Spread',
    category: 'general',
    path: '/reading/general/horseshoe/question',
    cardCount: 7,
    isPaid: false,
    access: 'member',
    icon: '🧲',
    description: '梳理事件的来龙去脉与发展轨迹，找到关键转折点',
  },
  {
    key: 'celtic-cross',
    name: '凯尔特十字牌阵',
    nameEn: 'Celtic Cross',
    category: 'general',
    path: '/reading/general/celtic-cross/question',
    cardCount: 10,
    isPaid: true,
    access: 'member',
    icon: '✝️',
    description: '适合人生级课题与深度探索，提供更完整的全景解读',
  },

  // ==================== 爱情主题 ====================
  {
    key: 'love-future-lover',
    name: '我未来的恋人在哪里？',
    nameEn: 'Where Is My Future Lover?',
    category: 'love',
    path: '/themed-readings/love/future-lover/draw',
    cardCount: 6,
    isPaid: false,
    access: 'free',
    icon: '💕',
    legacyId: 'future-lover',
    description: '看看你可能如何遇见 TA，以及这段缘分会以什么方式靠近。',
  },
  {
    key: 'love-what-they-think',
    name: 'TA 是怎么看我的？',
    nameEn: 'How Do They See Me?',
    category: 'love',
    path: '/themed-readings/love/what-they-think/draw',
    cardCount: 6,
    isPaid: false,
    access: 'free',
    icon: '💭',
    legacyId: 'what-they-think',
    description: '看看对方对你的真实想法、感受，以及短期内可能的态度变化。',
  },
  {
    key: 'love-relationship-development',
    name: '我们会在一起吗？',
    nameEn: 'Will We Be Together?',
    category: 'love',
    path: '/themed-readings/love/relationship-development/draw',
    cardCount: 8,
    isPaid: true,
    access: 'member',
    icon: '🌸',
    legacyId: 'relationship-development',
    description: '看看这段关系现在的状态、阻碍，以及接下来可能怎么发展。',
  },
  {
    key: 'love-reconciliation',
    name: '我们还会复合吗？',
    nameEn: 'Will We Get Back Together?',
    category: 'love',
    path: '/themed-readings/love/reconciliation/draw',
    cardCount: 10,
    isPaid: true,
    access: 'member',
    icon: '🌙',
    legacyId: 'reconciliation',
    description: '看看彼此之间还有没有靠近的空间，以及复合需要面对什么。',
  },

  // ==================== 事业 & 学业主题 ====================
  {
    key: 'career-skills-direction',
    name: '我适合往哪个方向发展？',
    nameEn: 'Which Direction Fits Me Best?',
    category: 'career',
    path: '/themed-readings/career-study/skills-direction/draw',
    cardCount: 5,
    isPaid: false,
    access: 'free',
    icon: '🧭',
    legacyId: 'skills-direction',
    description: '看看你的优势、状态和潜力，找到更适合你的工作、学习或成长方向。',
  },
  {
    key: 'career-interview-exam',
    name: '这次面试或考试，我要注意什么？',
    nameEn: 'What Should I Watch For in This Interview or Exam?',
    category: 'career',
    path: '/themed-readings/career-study/interview-exam-key-reminders/draw',
    cardCount: 5,
    isPaid: false,
    access: 'free',
    icon: '📝',
    legacyId: 'interview-exam-key-reminders',
    description: '看看重点在哪里、容易忽略什么，以及你可以提前准备的地方。',
  },
  {
    key: 'career-offer-decision',
    name: '这个 Offer 我该接吗？',
    nameEn: 'Should I Take This Offer?',
    category: 'career',
    path: '/themed-readings/career-study/offer-decision/draw',
    cardCount: 6,
    isPaid: true,
    access: 'member',
    icon: '✉️',
    legacyId: 'offer-decision',
    description: '看看这个机会适不适合你，以及接受之后可能带来的成长、压力和代价。',
  },
  {
    key: 'career-stay-or-leave',
    name: '这份工作，我该留下还是离开？',
    nameEn: 'Should I Stay or Leave This Job?',
    category: 'career',
    path: '/themed-readings/career-study/stay-or-leave/draw',
    cardCount: 7,
    isPaid: true,
    access: 'member',
    icon: '⚖️',
    legacyId: 'stay-or-leave',
    description: '看看继续留下的意义、消耗、转机，以及离开前需要想清楚的事。',
  },

  // ==================== 财富主题 ====================
  {
    key: 'wealth-current-status',
    name: '我现在的财运怎么样？',
    nameEn: 'How Is My Money Luck Right Now?',
    category: 'wealth',
    path: '/themed-readings/wealth/current-wealth-status/draw',
    cardCount: 3,
    isPaid: false,
    access: 'free',
    icon: '💰',
    legacyId: 'current-wealth-status',
    description: '看看你当前的金钱状态、影响因素，以及近期可能的财务走向。',
  },
  {
    key: 'wealth-obstacles',
    name: '是什么挡住了我的财运？',
    nameEn: 'What Is Blocking My Money Flow?',
    category: 'wealth',
    path: '/themed-readings/wealth/wealth-obstacles/draw',
    cardCount: 5,
    isPaid: true,
    access: 'member',
    icon: '🚧',
    legacyId: 'wealth-obstacles',
    description: '看看哪些现实因素、习惯或心态正在影响你的收入、机会和财务改善。',
  },

  // ==================== 运势 ====================
  {
    key: 'fortune-daily',
    name: '每日运势',
    nameEn: 'Daily Fortune',
    category: 'fortune',
    path: '/fortune/daily',
    cardCount: 1,
    isPaid: false,
    access: 'free',
    icon: '☀️',
    legacyId: 'daily-fortune',
    description: '看看你今天的整体运势与能量提示',
  },
  {
    key: 'fortune-monthly',
    name: '月度运势',
    nameEn: 'Monthly Fortune',
    category: 'fortune',
    path: '/fortune/monthly/basic',
    cardCount: 3,
    isPaid: false,
    access: 'free',
    icon: '🌙',
    legacyId: 'monthly-fortune',
    description: '了解这个月的整体运势走向与关注重点',
  },
  {
    key: 'fortune-monthly-member',
    name: '月度运势深层解析',
    nameEn: 'Monthly Fortune Deep Analysis',
    category: 'fortune',
    path: '/fortune/monthly/member',
    cardCount: 7,
    isPaid: true,
    access: 'member',
    icon: '🌕',
    description: '会员版七张牌深度解读本月各维度运势',
  },
  {
    key: 'fortune-seasonal',
    name: '四季运势',
    nameEn: 'Seasonal Fortune',
    category: 'fortune',
    path: '/fortune/seasonal',
    cardCount: 4,
    isPaid: false,
    access: 'member',
    icon: '🍂',
    legacyId: 'seasonal-fortune',
    description: '从更长的时间维度看当前季节的能量趋势',
  },
  {
    key: 'fortune-yearly',
    name: '年度运势',
    nameEn: 'Yearly Fortune',
    category: 'fortune',
    path: '/fortune/annual/year-ahead',
    cardCount: 12,
    isPaid: false,
    access: 'member',
    icon: '🌟',
    legacyId: 'year-ahead-fortune',
    description: '看看今年的整体运势格局与重要节点',
  },

  // ==================== 其他占卜 ====================
  {
    key: 'divination-yesno',
    name: 'Yes / No 塔罗',
    nameEn: 'Yes / No Tarot',
    category: 'divination',
    path: '/fortune/yesno-tarot/draw',
    cardCount: 1,
    isPaid: false,
    access: 'free',
    icon: '❓',
    legacyId: 'yesno-tarot',
    description: '用一张牌快速获得 Yes 或 No 的直觉指引',
  },
  {
    key: 'divination-jiaobei',
    name: '筊杯占卜',
    nameEn: 'Jiaobei Divination',
    category: 'divination',
    path: '/divination/jiaobei',
    cardCount: 0,
    isPaid: false,
    access: 'free',
    icon: '🥢',
    description: '模拟传统筊杯，快速获得神明的回应',
  },
];

// ---------------------------------------------------------------------------
// 索引 & 查询工具
// ---------------------------------------------------------------------------

/** key → SpreadMeta 映射（O(1) 查询） */
export const SPREAD_MAP: Record<string, SpreadMeta> = Object.fromEntries(
  SPREAD_LIST.map((s) => [s.key, s]),
);

/** legacyId → key 映射，用于兼容旧 ID */
export const LEGACY_ID_TO_KEY: Record<string, string> = Object.fromEntries(
  SPREAD_LIST.filter((s) => s.legacyId).map((s) => [s.legacyId!, s.key]),
);

/** 根据 spread_type key 获取完整配置 */
export function getSpreadByKey(key: string): SpreadMeta | undefined {
  return SPREAD_MAP[key];
}

/** 根据 spread_type key 获取中文名（找不到则原样返回 key） */
export function getSpreadName(key: string): string {
  return SPREAD_MAP[key]?.name ?? key;
}

/** 根据 spread_type key 获取展示名（isEn=true 时返回英文，否则返回中文） */
export function getSpreadDisplayName(key: string, isEn?: boolean): string {
  const meta = SPREAD_MAP[key];
  if (!meta) return key;
  return isEn ? (meta.nameEn ?? meta.name) : meta.name;
}

/** 根据 spread_type key 获取页面路径 */
export function getSpreadPath(key: string): string | undefined {
  return SPREAD_MAP[key]?.path;
}

/** 根据旧 ID 解析出 spread_type key */
export function resolveSpreadKey(idOrKey: string): string {
  return LEGACY_ID_TO_KEY[idOrKey] ?? idOrKey;
}

/** 按分类获取所有牌阵 */
export function getSpreadsByCategory(category: SpreadCategory): SpreadMeta[] {
  return SPREAD_LIST.filter((s) => s.category === category);
}

/** 所有 spread_type key 的联合类型（可选——如果需要编译期校验可手动维护） */
export type SpreadType =
  | 'three-card-general'
  | 'sacred-triangle'
  | 'two-choices'
  | 'hexagram'
  | 'horseshoe'
  | 'celtic-cross'
  | 'love-future-lover'
  | 'love-what-they-think'
  | 'love-relationship-development'
  | 'love-reconciliation'
  | 'career-skills-direction'
  | 'career-interview-exam'
  | 'career-offer-decision'
  | 'career-stay-or-leave'
  | 'wealth-current-status'
  | 'wealth-obstacles'
  | 'fortune-daily'
  | 'fortune-monthly'
  | 'fortune-monthly-member'
  | 'fortune-seasonal'
  | 'fortune-yearly'
  | 'divination-yesno'
  | 'divination-jiaobei';
