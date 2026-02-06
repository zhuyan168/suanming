import { SpreadConfig } from '../config/themedReadings';

export type GeneralSpread = SpreadConfig & { href: string };

export const GENERAL_SPREADS: GeneralSpread[] = [
  {
    id: 'three-card-universal',
    titleZh: '三张牌万能牌阵',
    titleEn: 'Three-Card Universal',
    descZh: '适合还在犹豫、想先弄清自己现状的问题。',
    descEn: 'Clarifies the present, obstacles, and recommendations in one glance.',
    cardsCount: 3,
    isPaid: false,
    icon: '🔮',
    href: '/reading/general/three-card-universal/question',
  },
  {
    id: 'sacred-triangle',
    titleZh: '圣三角牌阵',
    titleEn: 'Sacred Triangle',
    descZh: '适合已经开始行动、需要判断下一步的问题。',
    descEn: 'Trace your timeline from past to future for a clear next step.',
    cardsCount: 3,
    isPaid: false,
    icon: '🔺',
    href: '/reading/general/sacred-triangle/question',
  },
  {
    id: 'two-choices',
    titleZh: '二选一牌阵',
    titleEn: 'Two Choices Spread',
    descZh: '当你在 A / B 之间犹豫时，帮你看清差异与更合适的选择。',
    descEn: 'Highlights contrasts so you can decide between two options.',
    cardsCount: 5,
    isPaid: false, // 测试期间免费
    icon: '🔀',
    href: '/reading/general/two-choices/question',
  },
  {
    id: 'hexagram',
    titleZh: '六芒星牌阵',
    titleEn: 'Hexagram Spread',
    descZh: '适合复杂局面与多因素交织的问题，给出更全面的洞察。',
    descEn: 'Untangles complex situations with six factors of meaning.',
    cardsCount: 7,
    isPaid: false, // 会员验证放在展示页的"开始解读"按钮处
    icon: '🔯',
    href: '/reading/general/hexagram/question',
  },
  {
    id: 'horseshoe',
    titleZh: '马蹄铁牌阵',
    titleEn: 'Horseshoe Spread',
    descZh: '梳理事件的来龙去脉与发展轨迹，找到关键转折点。',
    descEn: 'Maps past, present, and potential turns in your story.',
    cardsCount: 7,
    isPaid: false, // 会员验证放在展示页的"开始解读"按钮处
    icon: '🧲',
    href: '/reading/general/horseshoe/question',
  },
  {
    id: 'celtic-cross',
    titleZh: '凯尔特十字牌阵',
    titleEn: 'Celtic Cross',
    descZh: '适合人生级课题与深度探索，提供更完整的全景解读。',
    descEn: 'Full-system view for life-level questions and depth work.',
    cardsCount: 10,
    isPaid: true,
    icon: '✝️',
    href: '/reading/general/celtic-cross/question',
  },
];
