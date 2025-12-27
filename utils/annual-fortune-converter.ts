/**
 * 数据格式转换器
 * 用于将现有抽牌页（year-ahead）的数据格式转换为新的年度运势类型
 */

import type { TarotCard, AnnualFortuneReading } from '../types/annual-fortune';

/**
 * 现有抽牌页的数据格式
 */
export interface YearAheadResult {
  userId?: string | null;
  year: string;
  cards: Array<{
    id: number;
    name: string;
    image: string;
    upright: string;
    reversed: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  result?: any;
  createdAt: number;
}

/**
 * 将现有格式的单张牌转换为新格式
 */
function convertCard(
  card: YearAheadResult['cards'][0]
): TarotCard {
  return {
    id: card.id.toString(),
    name: card.name,
    imageUrl: card.image,
    isReversed: card.orientation === 'reversed',
    upright: card.upright,
    reversed: card.reversed,
    keywords: card.keywords
  };
}

/**
 * 将现有年度运势数据转换为新格式
 * 
 * 现有格式：
 * - cards[0-11]: 1-12 月份牌
 * - cards[12]: 年度主题牌（中心）
 */
export function convertYearAheadToAnnualReading(
  yearAhead: YearAheadResult
): AnnualFortuneReading {
  if (!yearAhead.cards || yearAhead.cards.length !== 13) {
    throw new Error('Invalid year ahead data: expected 13 cards');
  }

  // 第 13 张（索引 12）是年度主题牌
  const themeCard = convertCard(yearAhead.cards[12]);

  // 前 12 张（索引 0-11）是月份牌
  const monthCards: Record<number, TarotCard> = {};
  for (let i = 0; i < 12; i++) {
    monthCards[i + 1] = convertCard(yearAhead.cards[i]);
  }

  return {
    id: `year_${yearAhead.year}_${yearAhead.createdAt}`,
    createdAt: new Date(yearAhead.createdAt).toISOString(),
    themeCard,
    monthCards,
    meta: {
      year: parseInt(yearAhead.year),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'zh-CN'
    }
  };
}

/**
 * 将新格式转换回现有格式（用于兼容性）
 */
export function convertAnnualReadingToYearAhead(
  reading: AnnualFortuneReading
): YearAheadResult {
  const cards = [];

  // 前 12 张是月份牌（1-12 月）
  for (let month = 1; month <= 12; month++) {
    const card = reading.monthCards[month];
    if (!card) {
      throw new Error(`Missing card for month ${month}`);
    }

    cards.push({
      id: parseInt(card.id),
      name: card.name,
      image: card.imageUrl,
      upright: card.upright || '',
      reversed: card.reversed || '',
      keywords: card.keywords || [],
      orientation: card.isReversed ? 'reversed' as const : 'upright' as const
    });
  }

  // 第 13 张是年度主题牌
  cards.push({
    id: parseInt(reading.themeCard.id),
    name: reading.themeCard.name,
    image: reading.themeCard.imageUrl,
    upright: reading.themeCard.upright || '',
    reversed: reading.themeCard.reversed || '',
    keywords: reading.themeCard.keywords || [],
    orientation: reading.themeCard.isReversed ? 'reversed' as const : 'upright' as const
  });

  return {
    userId: null,
    year: (reading.meta?.year || new Date().getFullYear()).toString(),
    cards,
    createdAt: new Date(reading.createdAt).getTime()
  };
}

/**
 * 从 localStorage 加载现有格式的数据并转换
 */
export function loadAndConvertFromLocalStorage(year?: string): AnnualFortuneReading | null {
  if (typeof window === 'undefined') return null;

  const targetYear = year || new Date().getFullYear().toString();
  const key = `year_ahead_${targetYear}`;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const yearAhead: YearAheadResult = JSON.parse(stored);
    return convertYearAheadToAnnualReading(yearAhead);
  } catch (error) {
    console.error('Failed to load and convert from localStorage:', error);
    return null;
  }
}

/**
 * 检测数据格式类型
 */
export function detectDataFormat(data: any): 'year-ahead' | 'annual-fortune' | 'unknown' {
  if (!data || typeof data !== 'object') {
    return 'unknown';
  }

  // 检测新格式
  if (data.themeCard && data.monthCards) {
    return 'annual-fortune';
  }

  // 检测现有格式
  if (data.cards && Array.isArray(data.cards) && data.cards.length === 13 && data.year) {
    return 'year-ahead';
  }

  return 'unknown';
}

/**
 * 自动转换（检测格式并转换）
 */
export function autoConvert(data: any): AnnualFortuneReading | null {
  const format = detectDataFormat(data);

  switch (format) {
    case 'annual-fortune':
      return data as AnnualFortuneReading;

    case 'year-ahead':
      try {
        return convertYearAheadToAnnualReading(data as YearAheadResult);
      } catch (error) {
        console.error('Failed to convert year-ahead data:', error);
        return null;
      }

    default:
      console.warn('Unknown data format:', data);
      return null;
  }
}

