/**
 * 年度运势数据存储工具
 * 使用 sessionStorage 和 localStorage
 */

import type { AnnualFortuneReading, AnnualInterpretation } from '../types/annual-fortune';

const STORAGE_KEY_PREFIX = 'annual_fortune_reading';
const SESSION_KEY = 'annual_fortune_session';

/**
 * 生成存储 key
 */
function getStorageKey(year?: number): string {
  const targetYear = year || new Date().getFullYear();
  return `${STORAGE_KEY_PREFIX}_${targetYear}`;
}

/**
 * 保存到 localStorage（持久化）
 */
export function saveReadingToLocal(reading: AnnualFortuneReading, interpretation?: AnnualInterpretation): void {
  if (typeof window === 'undefined') return;
  
  try {
    const year = reading.meta?.year || new Date().getFullYear();
    const key = getStorageKey(year);
    
    const data = {
      reading,
      interpretation,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`✅ Saved reading to localStorage: ${key}`);
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
  }
}

/**
 * 从 localStorage 读取
 */
export function loadReadingFromLocal(year?: number): { 
  reading: AnnualFortuneReading; 
  interpretation?: AnnualInterpretation;
  savedAt: string;
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getStorageKey(year);
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // 验证数据结构
    if (!data.reading || !data.reading.themeCard || !data.reading.monthCards) {
      console.warn('⚠️ Invalid reading data in localStorage');
      return null;
    }
    
    console.log(`✅ Loaded reading from localStorage: ${key}`);
    return data;
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * 保存到 sessionStorage（临时）
 */
export function saveReadingToSession(reading: AnnualFortuneReading): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(reading));
    console.log('✅ Saved reading to sessionStorage');
  } catch (error) {
    console.error('❌ Failed to save to sessionStorage:', error);
  }
}

/**
 * 从 sessionStorage 读取
 */
export function loadReadingFromSession(): AnnualFortuneReading | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    
    if (!stored) return null;
    
    const reading = JSON.parse(stored);
    
    // 验证数据结构
    if (!reading.themeCard || !reading.monthCards) {
      console.warn('⚠️ Invalid reading data in sessionStorage');
      return null;
    }
    
    console.log('✅ Loaded reading from sessionStorage');
    return reading;
  } catch (error) {
    console.error('❌ Failed to load from sessionStorage:', error);
    return null;
  }
}

/**
 * 清除 sessionStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(SESSION_KEY);
    console.log('✅ Cleared sessionStorage');
  } catch (error) {
    console.error('❌ Failed to clear sessionStorage:', error);
  }
}

/**
 * 获取年度运势（优先级：readingId -> sessionStorage -> localStorage）
 */
export async function getAnnualFortuneReading(readingId?: string): Promise<{
  reading: AnnualFortuneReading;
  interpretation?: AnnualInterpretation;
  source: 'api' | 'session' | 'local';
} | null> {
  
  // 1. 如果有 readingId，尝试从 API 获取
  if (readingId) {
    try {
      const response = await fetch(`/api/annual-fortune/readings/${readingId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded reading from API');
        return { ...data, source: 'api' };
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from API, trying fallback...', error);
    }
  }
  
  // 2. 尝试从 sessionStorage 读取
  const sessionReading = loadReadingFromSession();
  if (sessionReading) {
    return { reading: sessionReading, source: 'session' };
  }
  
  // 3. 尝试从 localStorage 读取
  const localData = loadReadingFromLocal();
  if (localData) {
    return { ...localData, source: 'local' };
  }
  
  return null;
}

/**
 * 检查当前年份是否已有记录
 */
export function hasReadingForCurrentYear(): boolean {
  return loadReadingFromLocal() !== null;
}

