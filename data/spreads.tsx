import { SpreadConfig } from '../config/themedReadings';
import { getSpreadsByCategory } from '../lib/spreads';

export type GeneralSpread = SpreadConfig & { href: string };

/** English descriptions for general spreads (lib/spreads.ts only has Chinese descriptions) */
const descEnMap: Record<string, string> = {
  'three-card-general': 'Not sure which spread to choose? Start here. You can ask about love, work, or everyday life for a quick overview without too much detail.',
  'sacred-triangle': 'Know what is troubling you but not what is causing it or what to do next? This spread helps you identify the obstacle and find a practical way forward.',
  'two-choices': 'Torn between two options that both have pros and cons? This spread compares Path A and Path B, showing what each may feel like and where each could lead.',
  'hexagram': 'Too many factors are tangled together? This spread looks at the full story, your inner state, outside influences, and possible actions to help you untangle a complex situation.',
  'horseshoe': 'Want to know how a situation reached this point and where it may go next? This spread traces its past, present, hidden influences, obstacles, and possible outcome.',
  'celtic-cross': 'Facing an important situation with many layers? This ten-card spread examines the present, obstacles, past influences, strengths, inner and outer pressures, and where things may be heading.',
};

/**
 * 通用牌阵列表 —— 数据来源为 lib/spreads.ts，此处转换为 GeneralSpread 格式
 * 以便 SpreadCard 等现有组件无需改动即可使用。
 */
export const GENERAL_SPREADS: GeneralSpread[] = getSpreadsByCategory('general').map((s) => ({
  id: s.key,
  titleZh: s.name,
  titleEn: s.nameEn,
  descZh: s.description ?? '',
  descEn: descEnMap[s.key] ?? s.nameEn,
  cardsCount: s.cardCount,
  isPaid: s.isPaid,
  access: s.access,
  icon: s.icon,
  href: s.path,
  ...(s.key === 'three-card-general'
    ? {
        tagsZh: [
          { icon: 'redeem', label: '免费' },
          { icon: 'bolt', label: '快速牌阵' },
          { icon: 'style', label: '3张牌' },
        ],
        tagsEn: [
          { icon: 'redeem', label: 'Free' },
          { icon: 'bolt', label: 'Quick Reading' },
          { icon: 'style', label: '3 Cards' },
        ],
      }
    : {}),
  ...(s.key === 'sacred-triangle'
    ? {
        tagsZh: [
          { icon: 'redeem', label: '免费' },
          { icon: 'assistant_direction', label: '行动指引' },
          { icon: 'style', label: '3张牌' },
        ],
        tagsEn: [
          { icon: 'redeem', label: 'Free' },
          { icon: 'assistant_direction', label: 'Action Guidance' },
          { icon: 'style', label: '3 Cards' },
        ],
      }
    : {}),
  ...(s.key === 'two-choices'
    ? {
        tagsZh: [
          { icon: 'redeem', label: '免费' },
          { icon: 'compare_arrows', label: '选择对比' },
          { icon: 'style', label: '5张牌' },
        ],
        tagsEn: [
          { icon: 'redeem', label: 'Free' },
          { icon: 'compare_arrows', label: 'Choice Comparison' },
          { icon: 'style', label: '5 Cards' },
        ],
      }
    : {}),
  ...(s.key === 'hexagram'
    ? {
        tagsZh: [
          { icon: 'paid', label: '付费' },
          { icon: 'hub', label: '多维分析' },
          { icon: 'style', label: '7张牌' },
        ],
        tagsEn: [
          { icon: 'paid', label: 'Paid' },
          { icon: 'hub', label: 'Multi-Angle Analysis' },
          { icon: 'style', label: '7 Cards' },
        ],
      }
    : {}),
  ...(s.key === 'horseshoe'
    ? {
        tagsZh: [
          { icon: 'paid', label: '付费' },
          { icon: 'timeline', label: '趋势推演' },
          { icon: 'style', label: '7张牌' },
        ],
        tagsEn: [
          { icon: 'paid', label: 'Paid' },
          { icon: 'timeline', label: 'Situation Forecast' },
          { icon: 'style', label: '7 Cards' },
        ],
      }
    : {}),
  ...(s.key === 'celtic-cross'
    ? {
        tagsZh: [
          { icon: 'paid', label: '付费' },
          { icon: 'zoom_out_map', label: '全面深度分析' },
          { icon: 'style', label: '10张牌' },
        ],
        tagsEn: [
          { icon: 'paid', label: 'Paid' },
          { icon: 'zoom_out_map', label: 'Complete Deep Dive' },
          { icon: 'style', label: '10 Cards' },
        ],
      }
    : {}),
}));
