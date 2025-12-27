/**
 * 年度运势本地规则解读生成器
 * 提供基于规则的解读生成，不依赖大模型
 */

import { TarotCard, AnnualInterpretation, MonthInterpretation, FocusArea } from '../types/annual-fortune';

// 塔罗牌映射表（简化版，仅包含关键信息）
const TAROT_INTERPRETATIONS: Record<string, {
  yearKeywords: string[];
  yearTheme: string;
  warning: string;
  monthKeywords: string[];
  focusAreas: string[];
  advice: string;
  risk: string;
}> = {
  'The Fool': {
    yearKeywords: ['新开始', '冒险', '纯真', '信任'],
    yearTheme: '这一年充满新的可能性，勇于尝试未知领域会带来意外收获',
    warning: '避免过度冲动，重要决定前需做好准备',
    monthKeywords: ['机会', '突破'],
    focusAreas: [FocusArea.Career, FocusArea.Study],
    advice: '保持开放心态，勇敢迈出第一步',
    risk: '注意避免准备不足的冒险'
  },
  'The Magician': {
    yearKeywords: ['行动力', '创造', '整合', '执行'],
    yearTheme: '拥有充足资源和能力的一年，关键在于整合并付诸行动',
    warning: '警惕分散精力，专注于核心目标',
    monthKeywords: ['执行', '显化'],
    focusAreas: [FocusArea.Career, FocusArea.Finance],
    advice: '将想法转化为具体行动',
    risk: '避免过度承诺或分散注意力'
  },
  'The High Priestess': {
    yearKeywords: ['直觉', '内在智慧', '静待', '洞察'],
    yearTheme: '倾听内在声音的一年，静心观察会得到深刻洞见',
    warning: '不要忽视直觉的提示',
    monthKeywords: ['洞察', '沉思'],
    focusAreas: [FocusArea.Health, FocusArea.Relationship],
    advice: '在行动前先倾听内心的声音',
    risk: '避免过度犹豫或信息不明时强行决策'
  },
  'The Empress': {
    yearKeywords: ['丰盛', '创造力', '滋养', '成长'],
    yearTheme: '收获丰富、创造力高涨的一年，善待自己和他人',
    warning: '避免过度付出导致自我消耗',
    monthKeywords: ['丰富', '滋养'],
    focusAreas: [FocusArea.Family, FocusArea.Love],
    advice: '平衡付出与接收，善待身心',
    risk: '警惕过度依赖他人'
  },
  'The Emperor': {
    yearKeywords: ['秩序', '权威', '结构', '稳定'],
    yearTheme: '建立稳固结构和规则的一年，理性规划带来长期收益',
    warning: '避免过于僵化，保持适度灵活性',
    monthKeywords: ['秩序', '稳定'],
    focusAreas: [FocusArea.Career, FocusArea.Finance],
    advice: '建立清晰的计划和执行机制',
    risk: '注意不要过于专制或缺乏弹性'
  },
  'The Hierophant': {
    yearKeywords: ['传统', '学习', '指引', '规范'],
    yearTheme: '寻求前辈指导、遵循既有规则能带来稳定进展',
    warning: '保留独立思考，不盲从教条',
    monthKeywords: ['学习', '传承'],
    focusAreas: [FocusArea.Study, FocusArea.Career],
    advice: '向经验丰富者学习，但保持独立判断',
    risk: '避免过度依赖传统或僵化思维'
  },
  'The Lovers': {
    yearKeywords: ['选择', '连接', '关系', '和谐'],
    yearTheme: '关系与选择的重要一年，真诚沟通建立深刻连接',
    warning: '重要选择需符合价值观',
    monthKeywords: ['关系', '选择'],
    focusAreas: [FocusArea.Love, FocusArea.Relationship],
    advice: '真诚对待重要关系，慎重做出承诺',
    risk: '避免价值观冲突或逃避重要选择'
  },
  'The Chariot': {
    yearKeywords: ['意志', '前进', '掌控', '胜利'],
    yearTheme: '意志力强劲、目标明确的一年，坚持会带来突破',
    warning: '保持方向一致，避免内在冲突',
    monthKeywords: ['前进', '突破'],
    focusAreas: [FocusArea.Career, FocusArea.Study],
    advice: '保持专注，克服障碍向目标前进',
    risk: '注意方向性，避免失控或内耗'
  },
  'Strength': {
    yearKeywords: ['力量', '耐心', '温柔', '勇气'],
    yearTheme: '以温柔而坚定的方式应对挑战，内在力量是关键',
    warning: '避免情绪失控或软弱',
    monthKeywords: ['力量', '耐心'],
    focusAreas: [FocusArea.Health, FocusArea.Relationship],
    advice: '以温和而坚定的态度面对困难',
    risk: '警惕缺乏自信或情绪波动'
  },
  'The Hermit': {
    yearKeywords: ['内省', '寻找', '独处', '智慧'],
    yearTheme: '需要独处思考的一年，内在探索带来真正智慧',
    warning: '避免过度孤立或逃避',
    monthKeywords: ['反思', '寻找'],
    focusAreas: [FocusArea.Health, FocusArea.Study],
    advice: '给自己独处时间，深入思考人生方向',
    risk: '避免过度孤立或迷失方向'
  },
  'Wheel of Fortune': {
    yearKeywords: ['转折', '循环', '机遇', '变化'],
    yearTheme: '命运转折的一年，把握机遇顺应变化',
    warning: '接纳变化，不抗拒命运流动',
    monthKeywords: ['转折', '机遇'],
    focusAreas: [FocusArea.Career, FocusArea.Finance],
    advice: '顺应变化，把握出现的新机遇',
    risk: '避免抗拒变化或错失时机'
  },
  'Justice': {
    yearKeywords: ['公平', '平衡', '责任', '真相'],
    yearTheme: '因果清晰的一年，公正对待自己和他人',
    warning: '承担应有责任，不逃避',
    monthKeywords: ['公正', '平衡'],
    focusAreas: [FocusArea.Career, FocusArea.Relationship],
    advice: '公正待人待己，承担应有责任',
    risk: '避免偏见或逃避责任'
  },
  'The Hanged Man': {
    yearKeywords: ['等待', '放手', '新视角', '暂停'],
    yearTheme: '需要暂停和换个角度看待的一年，等待带来新理解',
    warning: '避免急于求成',
    monthKeywords: ['等待', '转换'],
    focusAreas: [FocusArea.Health, FocusArea.Study],
    advice: '暂缓行动，从不同角度审视现状',
    risk: '避免过度拖延或抗拒必要牺牲'
  },
  'Death': {
    yearKeywords: ['转变', '结束', '重生', '放下'],
    yearTheme: '旧事物结束、新生开始的一年，勇敢放下过去',
    warning: '接纳必要的结束',
    monthKeywords: ['转变', '重生'],
    focusAreas: [FocusArea.Career, FocusArea.Relationship],
    advice: '勇敢放下不再适合的事物，迎接新生',
    risk: '避免抗拒改变或恐惧转变'
  },
  'Temperance': {
    yearKeywords: ['平衡', '调和', '耐心', '中庸'],
    yearTheme: '调和各方面的一年，保持中庸之道',
    warning: '避免极端和失衡',
    monthKeywords: ['平衡', '调和'],
    focusAreas: [FocusArea.Health, FocusArea.Relationship],
    advice: '在各方面寻求平衡，保持适度',
    risk: '警惕失衡或缺乏耐心'
  },
  'The Devil': {
    yearKeywords: ['束缚', '觉察', '欲望', '自由'],
    yearTheme: '觉察自我限制的一年，认清束缚才能解脱',
    warning: '警惕过度依赖或沉溺',
    monthKeywords: ['觉察', '解脱'],
    focusAreas: [FocusArea.Health, FocusArea.Finance],
    advice: '识别并摆脱不健康的依赖模式',
    risk: '避免物质或关系上的过度依赖'
  },
  'The Tower': {
    yearKeywords: ['突破', '变革', '释放', '觉醒'],
    yearTheme: '旧结构崩塌、迎来觉醒的一年，拥抱变革',
    warning: '接纳突发变化带来的冲击',
    monthKeywords: ['突破', '变革'],
    focusAreas: [FocusArea.Career, FocusArea.Relationship],
    advice: '放下不再有效的旧模式，拥抱变革',
    risk: '避免抗拒必要的改变'
  },
  'The Star': {
    yearKeywords: ['希望', '疗愈', '灵感', '指引'],
    yearTheme: '希望与疗愈的一年，保持信念会看到光明',
    warning: '保持信心，不轻言放弃',
    monthKeywords: ['希望', '疗愈'],
    focusAreas: [FocusArea.Health, FocusArea.Study],
    advice: '相信未来，专注自我疗愈和成长',
    risk: '避免信心不足或能量耗尽'
  },
  'The Moon': {
    yearKeywords: ['直觉', '潜意识', '不确定', '情绪'],
    yearTheme: '面对不确定性的一年，相信直觉引导',
    warning: '面对模糊感，不逃避情绪',
    monthKeywords: ['直觉', '情绪'],
    focusAreas: [FocusArea.Health, FocusArea.Relationship],
    advice: '倾听内在情绪，面对未知保持警觉',
    risk: '避免困惑中做重大决定'
  },
  'The Sun': {
    yearKeywords: ['成功', '喜悦', '活力', '清晰'],
    yearTheme: '充满阳光和成功的一年，自信展现真我',
    warning: '避免自满或过度乐观',
    monthKeywords: ['成功', '喜悦'],
    focusAreas: [FocusArea.Career, FocusArea.Relationship],
    advice: '自信展现自己，享受成功和快乐',
    risk: '警惕延迟或暂时挫折'
  },
  'Judgement': {
    yearKeywords: ['觉醒', '评估', '新生', '反思'],
    yearTheme: '自我评估与觉醒的一年，反思带来重生',
    warning: '诚实面对自己，不自我怀疑',
    monthKeywords: ['觉醒', '评估'],
    focusAreas: [FocusArea.Career, FocusArea.Study],
    advice: '客观评估过去，为新阶段做准备',
    risk: '避免自我怀疑或错失新机会'
  },
  'The World': {
    yearKeywords: ['完成', '圆满', '成就', '整合'],
    yearTheme: '收获圆满的一年，过往努力开花结果',
    warning: '避免停滞，为下个循环做准备',
    monthKeywords: ['完成', '成就'],
    focusAreas: [FocusArea.Career, FocusArea.Relationship],
    advice: '庆祝成就，同时准备新的开始',
    risk: '避免未完成感或缺乏成就'
  }
};

// 小阿卡纳默认解读模板
const MINOR_ARCANA_DEFAULTS = {
  Wands: {
    yearKeywords: ['行动', '创造', '热情'],
    focusAreas: [FocusArea.Career, FocusArea.Study],
    advice: '主动出击，将计划付诸实践'
  },
  Cups: {
    yearKeywords: ['情感', '关系', '直觉'],
    focusAreas: [FocusArea.Love, FocusArea.Relationship],
    advice: '关注情感需求，深化重要关系'
  },
  Swords: {
    yearKeywords: ['思考', '沟通', '决断'],
    focusAreas: [FocusArea.Career, FocusArea.Study],
    advice: '理性分析，清晰表达想法'
  },
  Pentacles: {
    yearKeywords: ['物质', '实践', '稳定'],
    focusAreas: [FocusArea.Finance, FocusArea.Career],
    advice: '务实行动，关注财务和健康'
  }
};

/**
 * 从牌名中提取牌组
 */
function extractSuit(cardName: string): string | null {
  if (cardName.includes('Wands')) return 'Wands';
  if (cardName.includes('Cups')) return 'Cups';
  if (cardName.includes('Swords')) return 'Swords';
  if (cardName.includes('Pentacles')) return 'Pentacles';
  return null;
}

/**
 * 从牌名中提取简化名称（用于匹配大阿卡纳）
 */
function extractCardKey(cardName: string): string {
  // 移除前缀数字和点号，例如 "0. The Fool" -> "The Fool"
  return cardName.replace(/^\d+\.\s*/, '').replace(/^(I+|I?V|V?I{0,3})\.\s*/, '');
}

/**
 * 根据牌获取解读数据
 */
function getCardInterpretation(card: TarotCard) {
  const cardKey = extractCardKey(card.name);
  
  // 优先查找大阿卡纳
  if (TAROT_INTERPRETATIONS[cardKey]) {
    return TAROT_INTERPRETATIONS[cardKey];
  }
  
  // 小阿卡纳根据牌组返回默认模板
  const suit = extractSuit(card.name);
  if (suit && MINOR_ARCANA_DEFAULTS[suit as keyof typeof MINOR_ARCANA_DEFAULTS]) {
    const defaults = MINOR_ARCANA_DEFAULTS[suit as keyof typeof MINOR_ARCANA_DEFAULTS];
    return {
      yearKeywords: defaults.yearKeywords,
      yearTheme: `本月${defaults.yearKeywords.join('、')}领域值得关注`,
      warning: '保持专注，避免分散精力',
      monthKeywords: defaults.yearKeywords.slice(0, 2),
      focusAreas: defaults.focusAreas,
      advice: defaults.advice,
      risk: '注意避免过度投入单一领域'
    };
  }
  
  // 兜底默认值
  return {
    yearKeywords: ['变化', '成长', '机遇'],
    yearTheme: '充满可能性的时期',
    warning: '保持开放心态',
    monthKeywords: ['变化', '成长'],
    focusAreas: [FocusArea.Career],
    advice: '顺应变化，把握机遇',
    risk: '避免固守旧模式'
  };
}

/**
 * 根据牌的正逆位调整解读
 */
function adjustForOrientation(interpretation: string, isReversed: boolean): string {
  if (!isReversed) return interpretation;
  
  // 逆位时，建议变为警示
  const reversalPrefixes = [
    '需要注意',
    '警惕',
    '避免过度',
    '当心'
  ];
  const prefix = reversalPrefixes[Math.floor(Math.random() * reversalPrefixes.length)];
  return `${prefix}：${interpretation}`;
}

/**
 * 获取月度注意事项（基于季节和月份自然节奏）
 */
function getMonthlyNote(month: number, isReversed: boolean): string {
  const monthNotes: Record<number, { normal: string; reversed: string }> = {
    1: {
      normal: '新年伊始，适合设定目标和规划全年',
      reversed: '避免过早承诺，先观察再行动'
    },
    2: {
      normal: '冬末春初，保持耐心等待时机',
      reversed: '能量转换期，注意情绪波动'
    },
    3: {
      normal: '春季开始，活力上升，适合启动新计划',
      reversed: '避免冲动决策，稳扎稳打'
    },
    4: {
      normal: '春季中期，稳步推进现有项目',
      reversed: '可能遇到阻碍，调整策略'
    },
    5: {
      normal: '春末夏初，社交活动增加',
      reversed: '避免过度承诺或分散精力'
    },
    6: {
      normal: '年中节点，阶段性总结和调整',
      reversed: '需要重新审视上半年的计划'
    },
    7: {
      normal: '盛夏时节，保持充沛的能量',
      reversed: '注意休息，避免过度消耗'
    },
    8: {
      normal: '夏末时期，为秋季做准备',
      reversed: '清理不必要的事务'
    },
    9: {
      normal: '秋季开始，收获期，新阶段启动',
      reversed: '可能面临调整，保持灵活'
    },
    10: {
      normal: '秋季中期，稳定期，巩固成果',
      reversed: '避免固守旧模式'
    },
    11: {
      normal: '秋末冬初，储备期，总结反思',
      reversed: '警惕拖延，该结束的要果断'
    },
    12: {
      normal: '年底收尾，为新年做准备',
      reversed: '避免仓促决定，留待明年再说'
    }
  };

  const note = monthNotes[month];
  return isReversed ? note.reversed : note.normal;
}

/**
 * 生成年度运势解读（基于规则）
 */
export function generateAnnualReading(
  themeCard: TarotCard,
  monthCards: Record<number, TarotCard>
): AnnualInterpretation {
  
  // 1. 处理年度主题牌
  const themeInterpretation = getCardInterpretation(themeCard);
  
  const yearKeywords = themeCard.isReversed 
    ? ['挑战', '调整', ...themeInterpretation.yearKeywords.slice(0, 2)]
    : themeInterpretation.yearKeywords.slice(0, 5);
  
  const yearOverview = [
    themeInterpretation.yearTheme,
    themeCard.isReversed 
      ? '今年需要更多耐心和调整，但挑战背后蕴含成长机会'
      : '这一年整体能量积极向上，抓住关键时机将获得显著进展',
    `以"${themeCard.name}"为核心主题，全年贯穿${themeInterpretation.yearKeywords.slice(0, 2).join('与')}的能量`,
  ];
  
  const yearWarnings = [
    themeInterpretation.warning,
    '平衡工作与生活，避免过度消耗',
    '重要决策前充分思考，但不过度犹豫'
  ];
  
  // 2. 处理各月运势
  const months: Record<number, MonthInterpretation> = {};
  const monthScores: number[] = []; // 用于判断高光/低潮月
  
  for (let month = 1; month <= 12; month++) {
    const card = monthCards[month];
    if (!card) continue;
    
    const interpretation = getCardInterpretation(card);
    
    // 生成月度解读
    months[month] = {
      keywords: interpretation.monthKeywords.slice(0, 2),
      focusAreas: interpretation.focusAreas.slice(0, 2),
      advice: adjustForOrientation(interpretation.advice, card.isReversed),
      risk: card.isReversed ? interpretation.risk : undefined,
      monthlyNote: getMonthlyNote(month, card.isReversed) // 添加月度注意事项
    };
    
    // 简单评分：正位 = 1, 逆位 = -1（用于判断高光/低潮）
    monthScores.push(card.isReversed ? -1 : 1);
  }
  
  // 3. 判断高光月份和低潮月份
  const highlights: number[] = [];
  const lowlights: number[] = [];
  
  monthScores.forEach((score, index) => {
    const month = index + 1;
    if (score > 0 && highlights.length < 3) {
      highlights.push(month);
    } else if (score < 0 && lowlights.length < 2) {
      lowlights.push(month);
    }
  });
  
  // 如果没有足够的低潮月，随机选择几个
  if (highlights.length === 0) {
    highlights.push(3, 6, 9); // 默认春、夏、秋
  }
  if (lowlights.length === 0) {
    lowlights.push(2); // 默认2月
  }
  
  // 4. 生成行动清单
  const actionList = [
    `在${highlights[0]}月把握关键机遇，主动推进重要计划`,
    `${lowlights[0]}月保持耐心，做好基础工作和能量储备`,
    `全年保持${themeInterpretation.yearKeywords[0]}的核心主题，定期回顾调整`
  ];
  
  return {
    yearKeywords,
    yearOverview,
    yearWarnings,
    months,
    highlights,
    lowlights,
    actionList
  };
}

/**
 * 验证解读结果的完整性
 */
export function validateInterpretation(interpretation: any): interpretation is AnnualInterpretation {
  if (!interpretation || typeof interpretation !== 'object') return false;
  
  const required = [
    'yearKeywords',
    'yearOverview', 
    'yearWarnings',
    'months',
    'highlights',
    'lowlights',
    'actionList'
  ];
  
  for (const field of required) {
    if (!(field in interpretation)) return false;
  }
  
  // 验证月度数据
  if (typeof interpretation.months !== 'object') return false;
  for (let i = 1; i <= 12; i++) {
    if (!interpretation.months[i]) return false;
  }
  
  return true;
}

