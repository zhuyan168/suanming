export type SpreadCategory = 'love' | 'career' | 'wealth' | 'fortune' | 'general';

export interface SpreadItem {
  id: string;
  name: string;
  category: SpreadCategory;
  description: string;
  url: string;
  keywords: string[];
}

export const LUNA_SPREADS: SpreadItem[] = [
  // ---- 感情类 ----
  {
    id: 'what-they-think',
    name: '对方在想什么',
    category: 'love',
    description: '探索对方此刻的真实想法、感受与关系的短期走向',
    url: '/themed-readings/love/what-they-think/draw',
    keywords: ['想法', '想我', '态度', '心里', '怎么看', '怎么想', '在想', '喜不喜欢', '有没有感觉'],
  },
  {
    id: 'reconciliation',
    name: '复合的可能性',
    category: 'love',
    description: '评估重新靠近的空间与代价，帮你做更稳的选择',
    url: '/themed-readings/love/reconciliation/draw',
    keywords: ['复合', '前任', '挽回', '和好', '重新在一起', '回头', '吃回头草', '分手后'],
  },
  {
    id: 'relationship-development',
    name: '这段感情的发展',
    category: 'love',
    description: '看看这段关系的真实状态与自然走向',
    url: '/themed-readings/love/relationship-development/draw',
    keywords: ['发展', '未来', '关系', '走向', '在一起', '结果', '进展', '感情',
      '第三者', '小三', '插足', '出轨', '分手', '会不会', '有没有可能', '能不能'],
  },
  {
    id: 'future-lover',
    name: '未来恋人牌阵',
    category: 'love',
    description: '看看未来恋人的画像与相遇路径',
    url: '/themed-readings/love/future-lover/draw',
    keywords: ['恋人', '遇见', '桃花', '单身', '脱单', '另一半', '对象'],
  },
  // ---- 事业类 ----
  {
    id: 'skills-direction',
    name: '我应该找什么样的工作 / 学什么技能',
    category: 'career',
    description: '理清你的优势与能量倾向，找到更适合的方向',
    url: '/themed-readings/career-study/skills-direction/draw',
    keywords: ['方向', '什么工作', '技能', '学什么', '专业', '适合', '转行', '求职', '找工作'],
  },
  {
    id: 'interview-exam',
    name: '面试 / 考试关键提醒',
    category: 'career',
    description: '看清重点，避开容易忽略的坑',
    url: '/themed-readings/career-study/interview-exam-key-reminders/draw',
    keywords: ['面试', '考试', '考研', '高考', '笔试', '准备'],
  },
  {
    id: 'offer-decision',
    name: '我已经拿到 offer 了，要不要接受',
    category: 'career',
    description: '在选择分岔口看清代价与机会',
    url: '/themed-readings/career-study/offer-decision/draw',
    keywords: ['offer', '接受', '录取', '入职'],
  },
  {
    id: 'stay-or-leave',
    name: '这份工作是否值得继续做下去',
    category: 'career',
    description: '评估继续投入的意义、消耗与转机',
    url: '/themed-readings/career-study/stay-or-leave/draw',
    keywords: ['辞职', '跳槽', '继续', '做下去', '换工作', '离职', '不想干'],
  },
  // ---- 财运类 ----
  {
    id: 'current-wealth-status',
    name: '我现在的财运如何',
    category: 'wealth',
    description: '快速看清你当前的财运状态与近期走向',
    url: '/themed-readings/wealth/current-wealth-status/draw',
    keywords: ['财运', '财富', '赚钱', '收入', '理财', '存款', '金钱'],
  },
  {
    id: 'wealth-obstacles',
    name: '我现在的财富阻碍是什么',
    category: 'wealth',
    description: '找到财务改善的突破口',
    url: '/themed-readings/wealth/wealth-obstacles/draw',
    keywords: ['阻碍', '破财', '花钱', '瓶颈', '开销', '困难', '欠'],
  },
  // ---- 运势类 ----
  {
    id: 'daily-fortune',
    name: '每日运势',
    category: 'fortune',
    description: '看看你今天的整体运势与能量提示',
    url: '/fortune/daily',
    keywords: ['今天', '今日', '每日', '每天', '日运'],
  },
  {
    id: 'monthly-fortune',
    name: '月度运势',
    category: 'fortune',
    description: '了解这个月的整体运势走向与关注重点',
    url: '/fortune/monthly/basic',
    keywords: ['月', '这个月', '月度', '月运', '本月'],
  },
  {
    id: 'seasonal-fortune',
    name: '四季运势',
    category: 'fortune',
    description: '从更长的时间维度看当前季节的能量趋势',
    url: '/fortune/seasonal',
    keywords: ['季', '季度', '四季', '这一季', '季节'],
  },
  {
    id: 'year-ahead-fortune',
    name: '年度运势',
    category: 'fortune',
    description: '看看今年的整体运势格局与重要节点',
    url: '/fortune/annual/year-ahead',
    keywords: ['年', '今年', '年度', '年运', '全年', '一年'],
  },
  // ---- 通用类 ----
  {
    id: 'three-card-universal',
    name: '三张牌万能牌阵',
    category: 'general',
    description: '适合还在犹豫、想先弄清自己现状的问题',
    url: '/reading/general/three-card-universal/question',
    keywords: ['不确定', '迷茫', '不知道', '看看', '通用', '随便'],
  },
];

const CATEGORY_KEYWORDS: Record<SpreadCategory, string[]> = {
  love: [
    '感情', '爱情', '恋爱', '暧昧', '喜欢', '爱', '男朋友', '女朋友',
    '男友', '女友', '老公', '老婆', '对象', '暗恋', '追', '表白', '约会',
    '结婚', '婚姻', '出轨', '外遇', '情感', '恋人', '前任', '复合',
    '分手', '挽回', '他', '她', '关系',
  ],
  career: [
    '事业', '工作', '求职', '学业', '职业', '上班', '公司', '老板',
    '上司', '同事', '升职', '加薪', '学习', '考研', '高考', '面试',
    '考试', '跳槽', '辞职', 'offer', '实习', '创业',
  ],
  wealth: [
    '财运', '金钱', '收入', '钱', '财富', '投资', '理财', '赚钱',
    '存款', '开销', '花钱', '破财', '发财', '财务',
  ],
  fortune: [
    '运势', '运气', '运程', '今天', '今日', '每日', '每天', '月运',
    '月度', '这个月', '本月', '季度', '四季', '年运', '年度', '今年',
    '全年', '一年', '最近', '近期', '怎么样', '好不好',
  ],
  general: [],
};

const CATEGORY_DEFAULTS: Record<SpreadCategory, string> = {
  love: 'relationship-development',
  career: 'skills-direction',
  wealth: 'current-wealth-status',
  fortune: 'monthly-fortune',
  general: 'three-card-universal',
};

function detectCategory(message: string): SpreadCategory {
  const lower = message.toLowerCase();

  const scores: Record<SpreadCategory, number> = {
    love: 0,
    career: 0,
    wealth: 0,
    fortune: 0,
    general: 0,
  };

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [SpreadCategory, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        scores[cat] += 1;
      }
    }
  }

  const best = (Object.entries(scores) as [SpreadCategory, number][])
    .filter(([cat]) => cat !== 'general')
    .sort((a, b) => b[1] - a[1])[0];

  return best && best[1] > 0 ? best[0] : 'general';
}

function findBestSpread(message: string, category: SpreadCategory): SpreadItem {
  const lower = message.toLowerCase();
  const categoryItems = LUNA_SPREADS.filter((s) => s.category === category);

  let bestMatch: SpreadItem | null = null;
  let bestScore = 0;

  for (const item of categoryItems) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch) return bestMatch;

  const defaultId = CATEGORY_DEFAULTS[category];
  return LUNA_SPREADS.find((s) => s.id === defaultId) ?? LUNA_SPREADS[LUNA_SPREADS.length - 1];
}

export interface SpreadRecommendation {
  spread: SpreadItem;
  category: SpreadCategory;
  message: string;
}

const CATEGORY_LABELS: Record<SpreadCategory, string> = {
  love: '和感情关系相关的',
  career: '和事业学业相关的',
  wealth: '和财运财务相关的',
  fortune: '和运势相关的',
  general: '通用的',
};

export function getRecommendedSpread(userMessage: string): SpreadRecommendation {
  const category = detectCategory(userMessage);
  const spread = findBestSpread(userMessage, category);

  const catLabel = CATEGORY_LABELS[category];
  const replyMessage =
    category === 'general'
      ? `我暂时不太确定哪个分类最适合你，不过你可以先试试通用牌阵「${spread.name}」，它适合任何主题的问题。`
      : `我更推荐你使用${catLabel}牌阵。\n「${spread.name}」——${spread.description}`;

  return { spread, category, message: replyMessage };
}

export function matchSpreadByMessage(message: string): SpreadRecommendation {
  return getRecommendedSpread(message);
}

export function getSpreadById(id: string): SpreadItem | undefined {
  return LUNA_SPREADS.find((s) => s.id === id);
}
