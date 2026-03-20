import { SpreadConfig } from '../config/themedReadings';
import { getSpreadsByCategory } from '../lib/spreads';

export type GeneralSpread = SpreadConfig & { href: string };

/**
 * 通用牌阵列表 —— 数据来源为 lib/spreads.ts，此处转换为 GeneralSpread 格式
 * 以便 SpreadCard 等现有组件无需改动即可使用。
 */
export const GENERAL_SPREADS: GeneralSpread[] = getSpreadsByCategory('general').map((s) => ({
  id: s.key,
  titleZh: s.name,
  titleEn: s.nameEn,
  descZh: s.description ?? '',
  descEn: '',
  cardsCount: s.cardCount,
  isPaid: s.isPaid,
  access: s.access,
  icon: s.icon,
  href: s.path,
}));
