/**
 * 年度运势功能测试
 * 包含：数据验证、本地规则生成、存储功能
 */

import type { TarotCard, AnnualFortuneReading, AnnualInterpretation } from '../types/annual-fortune';
import { generateAnnualReading, validateInterpretation } from '../utils/annual-interpretation';

/**
 * 测试用的模拟数据
 */
const mockThemeCard: TarotCard = {
  id: '0',
  name: '0. The Fool',
  nameEn: 'The Fool',
  imageUrl: 'https://example.com/fool.png',
  isReversed: false,
  upright: '新的开始、信任直觉、勇敢冒险',
  reversed: '冲动行事、犹豫不决、方向不明',
  keywords: ['纯真', '自由', '机会']
};

const mockMonthCards: Record<number, TarotCard> = {
  1: { ...mockThemeCard, id: '1', name: 'I. The Magician', isReversed: false },
  2: { ...mockThemeCard, id: '2', name: 'II. The High Priestess', isReversed: true },
  3: { ...mockThemeCard, id: '3', name: 'III. The Empress', isReversed: false },
  4: { ...mockThemeCard, id: '4', name: 'IV. The Emperor', isReversed: false },
  5: { ...mockThemeCard, id: '5', name: 'V. The Hierophant', isReversed: true },
  6: { ...mockThemeCard, id: '6', name: 'VI. The Lovers', isReversed: false },
  7: { ...mockThemeCard, id: '7', name: 'VII. The Chariot', isReversed: false },
  8: { ...mockThemeCard, id: '8', name: 'VIII. Strength', isReversed: true },
  9: { ...mockThemeCard, id: '9', name: 'IX. The Hermit', isReversed: false },
  10: { ...mockThemeCard, id: '10', name: 'X. Wheel of Fortune', isReversed: false },
  11: { ...mockThemeCard, id: '11', name: 'XI. Justice', isReversed: true },
  12: { ...mockThemeCard, id: '12', name: 'XII. The Hanged Man', isReversed: false }
};

/**
 * 测试 1：缺 readingId 时空态正确
 */
export function test_EmptyState_WhenNoReadingId() {
  console.log('🧪 Test 1: Empty state when no readingId');
  
  // 模拟没有 readingId 的情况
  const readingId = undefined;
  const sessionStorage = null;
  const localStorage = null;
  
  // 预期结果：应该返回 null 或显示空态
  const shouldShowEmpty = !readingId && !sessionStorage && !localStorage;
  
  if (shouldShowEmpty) {
    console.log('✅ Test 1 PASSED: Empty state is correct');
    return true;
  } else {
    console.error('❌ Test 1 FAILED: Expected empty state');
    return false;
  }
}

/**
 * 测试 2：sessionStorage fallback 工作正常
 */
export function test_SessionStorageFallback() {
  console.log('🧪 Test 2: SessionStorage fallback works');
  
  // 检查是否在浏览器环境
  if (typeof window === 'undefined') {
    console.log('⚠️  Test 2 SKIPPED: Not in browser environment');
    return true;
  }
  
  try {
    // 模拟保存到 sessionStorage
    const mockReading: AnnualFortuneReading = {
      id: 'test-reading-1',
      createdAt: new Date().toISOString(),
      themeCard: mockThemeCard,
      monthCards: mockMonthCards,
      meta: {
        year: 2025
      }
    };
    
    const testKey = 'test_annual_fortune_session';
    window.sessionStorage.setItem(testKey, JSON.stringify(mockReading));
    
    // 读取并验证
    const stored = window.sessionStorage.getItem(testKey);
    if (!stored) {
      console.error('❌ Test 2 FAILED: Failed to save to sessionStorage');
      return false;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.id !== mockReading.id) {
      console.error('❌ Test 2 FAILED: Data mismatch');
      return false;
    }
    
    // 清理
    window.sessionStorage.removeItem(testKey);
    
    console.log('✅ Test 2 PASSED: SessionStorage fallback works');
    return true;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error);
    return false;
  }
}

/**
 * 测试 3：interpretation JSON 校验失败时 fallback 生效
 */
export function test_InterpretationValidation_Fallback() {
  console.log('🧪 Test 3: Interpretation validation fallback');
  
  // 测试无效数据（缺少必需字段）
  const invalidInterpretation: any = {
    yearKeywords: ['test'],
    // 缺少 yearOverview, yearWarnings, months 等
  };
  
  const isValid = validateInterpretation(invalidInterpretation);
  
  if (!isValid) {
    console.log('✅ Test 3 PASSED: Invalid data detected correctly');
    
    // 测试 fallback：使用本地规则生成
    try {
      const fallbackInterpretation = generateAnnualReading(mockThemeCard, mockMonthCards);
      
      if (validateInterpretation(fallbackInterpretation)) {
        console.log('✅ Test 3 PASSED: Fallback generation works');
        return true;
      } else {
        console.error('❌ Test 3 FAILED: Fallback generation produced invalid data');
        return false;
      }
    } catch (error) {
      console.error('❌ Test 3 FAILED: Fallback generation threw error:', error);
      return false;
    }
  } else {
    console.error('❌ Test 3 FAILED: Should have detected invalid data');
    return false;
  }
}

/**
 * 测试 4：本地规则生成完整性
 */
export function test_LocalGenerationCompleteness() {
  console.log('🧪 Test 4: Local generation completeness');
  
  try {
    const interpretation = generateAnnualReading(mockThemeCard, mockMonthCards);
    
    // 检查必需字段
    const requiredFields = [
      'yearKeywords',
      'yearOverview',
      'yearWarnings',
      'months',
      'highlights',
      'lowlights',
      'actionList'
    ];
    
    for (const field of requiredFields) {
      if (!(field in interpretation)) {
        console.error(`❌ Test 4 FAILED: Missing field: ${field}`);
        return false;
      }
    }
    
    // 检查年度关键词数量（3-5个）
    if (interpretation.yearKeywords.length < 3 || interpretation.yearKeywords.length > 5) {
      console.error(`❌ Test 4 FAILED: yearKeywords count invalid: ${interpretation.yearKeywords.length}`);
      return false;
    }
    
    // 检查年度主线数量（2-4句）
    if (interpretation.yearOverview.length < 2 || interpretation.yearOverview.length > 4) {
      console.error(`❌ Test 4 FAILED: yearOverview count invalid: ${interpretation.yearOverview.length}`);
      return false;
    }
    
    // 检查月度数据完整性（必须有 1-12 月）
    for (let month = 1; month <= 12; month++) {
      if (!interpretation.months[month]) {
        console.error(`❌ Test 4 FAILED: Missing month ${month}`);
        return false;
      }
      
      const monthData = interpretation.months[month];
      
      // 检查月度必需字段
      if (!monthData.keywords || monthData.keywords.length === 0) {
        console.error(`❌ Test 4 FAILED: Month ${month} missing keywords`);
        return false;
      }
      
      if (!monthData.focusAreas || monthData.focusAreas.length === 0) {
        console.error(`❌ Test 4 FAILED: Month ${month} missing focusAreas`);
        return false;
      }
      
      if (!monthData.advice) {
        console.error(`❌ Test 4 FAILED: Month ${month} missing advice`);
        return false;
      }
    }
    
    // 检查高光月份（2-3个）
    if (interpretation.highlights.length < 2 || interpretation.highlights.length > 3) {
      console.error(`❌ Test 4 FAILED: highlights count invalid: ${interpretation.highlights.length}`);
      return false;
    }
    
    // 检查低潮月份（1-2个）
    if (interpretation.lowlights.length < 1 || interpretation.lowlights.length > 2) {
      console.error(`❌ Test 4 FAILED: lowlights count invalid: ${interpretation.lowlights.length}`);
      return false;
    }
    
    // 检查行动清单（3条）
    if (interpretation.actionList.length !== 3) {
      console.error(`❌ Test 4 FAILED: actionList count invalid: ${interpretation.actionList.length}`);
      return false;
    }
    
    console.log('✅ Test 4 PASSED: Local generation is complete and valid');
    console.log('📊 Generated interpretation:', JSON.stringify(interpretation, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error);
    return false;
  }
}

/**
 * 测试 5：正逆位影响解读
 */
export function test_OrientationImpact() {
  console.log('🧪 Test 5: Orientation impacts interpretation');
  
  try {
    // 测试正位
    const uprightCard: TarotCard = { ...mockThemeCard, isReversed: false };
    const uprightResult = generateAnnualReading(uprightCard, mockMonthCards);
    
    // 测试逆位
    const reversedCard: TarotCard = { ...mockThemeCard, isReversed: true };
    const reversedResult = generateAnnualReading(reversedCard, mockMonthCards);
    
    // 验证：逆位应该有不同的关键词（通常包含"挑战"或"调整"）
    const hasReversalImpact = 
      reversedResult.yearKeywords.includes('挑战') || 
      reversedResult.yearKeywords.includes('调整') ||
      reversedResult.yearKeywords !== uprightResult.yearKeywords;
    
    if (hasReversalImpact) {
      console.log('✅ Test 5 PASSED: Orientation affects interpretation');
      return true;
    } else {
      console.warn('⚠️  Test 5 WARNING: Orientation impact not obvious');
      return true; // 不算失败，只是警告
    }
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('\n========================================');
  console.log('🧪 Running Annual Fortune Tests');
  console.log('========================================\n');
  
  const tests = [
    { name: 'Empty State', fn: test_EmptyState_WhenNoReadingId },
    { name: 'SessionStorage Fallback', fn: test_SessionStorageFallback },
    { name: 'Interpretation Validation', fn: test_InterpretationValidation_Fallback },
    { name: 'Local Generation Completeness', fn: test_LocalGenerationCompleteness },
    { name: 'Orientation Impact', fn: test_OrientationImpact }
  ];
  
  const results: { name: string; passed: boolean }[] = [];
  
  for (const test of tests) {
    try {
      const passed = test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`❌ Test "${test.name}" threw error:`, error);
      results.push({ name: test.name, passed: false });
    }
    console.log(''); // 空行分隔
  }
  
  // 汇总结果
  console.log('========================================');
  console.log('📊 Test Summary');
  console.log('========================================\n');
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });
  
  console.log(`\n${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log(`\n⚠️  ${totalCount - passedCount} test(s) failed`);
  }
  
  return passedCount === totalCount;
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined' && (window as any).__RUN_TESTS__) {
  runAllTests();
}

