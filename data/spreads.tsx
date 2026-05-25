import { SpreadConfig } from '../config/themedReadings';
import { getSpreadsByCategory } from '../lib/spreads';

export type GeneralSpread = SpreadConfig & { href: string };

/** English descriptions for general spreads (lib/spreads.ts only has Chinese descriptions) */
const descEnMap: Record<string, string> = {
  'three-card-general': "Ideal when you're feeling uncertain — a clear reflection of where your energy stands right now",
  'sacred-triangle': 'Best when action has already begun and you need to clarify your next step',
  'two-choices': 'When weighing option A vs B — see the difference and which path aligns with you',
  'hexagram': 'For complex, layered situations — broader insight across multiple interacting factors',
  'horseshoe': 'Trace the full arc of a situation from start to finish and locate the key turning point',
  'celtic-cross': 'For life-level questions and deep exploration — the most complete spread available',
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
}));
