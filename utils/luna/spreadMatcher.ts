import { SPREAD_LIST, type SpreadMeta } from '../../lib/spreads';

export type SpreadCategory = 'love' | 'career' | 'wealth' | 'fortune' | 'general';

export interface SpreadItem {
  id: string;
  name: string;
  category: SpreadCategory;
  description: string;
  url: string;
  keywords: string[];
}

/**
 * Luna 推荐用的关键词扩展表。
 * key 与 lib/spreads.ts 的 spread_type 对齐；keywords 仅供 Luna 匹配使用。
 */
const LUNA_KEYWORDS: Record<string, string[]> = {
  'love-what-they-think': ['想法', '想我', '态度', '心里', '怎么看', '怎么想', '在想', '喜不喜欢', '有没有感觉'],
  'love-reconciliation': ['复合', '前任', '挽回', '和好', '重新在一起', '回头', '吃回头草', '分手后'],
  'love-relationship-development': ['发展', '未来', '关系', '走向', '在一起', '结果', '进展', '感情',
    '第三者', '小三', '插足', '出轨', '分手', '会不会', '有没有可能', '能不能'],
  'love-future-lover': ['恋人', '遇见', '桃花', '单身', '脱单', '另一半', '对象'],
  'career-skills-direction': ['方向', '什么工作', '技能', '学什么', '专业', '适合', '转行', '求职', '找工作'],
  'career-interview-exam': ['面试', '考试', '考研', '高考', '笔试', '准备'],
  'career-offer-decision': ['offer', '接受', '录取', '入职'],
  'career-stay-or-leave': ['辞职', '跳槽', '继续', '做下去', '换工作', '离职', '不想干'],
  'wealth-current-status': ['财运', '财富', '赚钱', '收入', '理财', '存款', '金钱'],
  'wealth-obstacles': ['阻碍', '破财', '花钱', '瓶颈', '开销', '困难', '欠'],
  'fortune-daily': ['今天', '今日', '每日', '每天', '日运'],
  'fortune-monthly': ['月', '这个月', '月度', '月运', '本月'],
  'fortune-seasonal': ['季', '季度', '四季', '这一季', '季节'],
  'fortune-yearly': ['年', '今年', '年度', '年运', '全年', '一年'],
  'three-card-general': ['不确定', '迷茫', '不知道', '看看', '通用', '随便'],
};

function categoryFromMeta(s: SpreadMeta): SpreadCategory {
  const c = s.category;
  if (c === 'divination') return 'general';
  return c as SpreadCategory;
}

/** Luna 可推荐的牌阵列表（从 lib/spreads.ts 生成） */
export const LUNA_SPREADS: SpreadItem[] = SPREAD_LIST
  .filter((s) => LUNA_KEYWORDS[s.key])
  .map((s) => ({
    id: s.key,
    name: s.name,
    category: categoryFromMeta(s),
    description: s.description ?? '',
    url: s.path,
    keywords: LUNA_KEYWORDS[s.key] ?? [],
  }));

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
  love: 'love-relationship-development',
  career: 'career-skills-direction',
  wealth: 'wealth-current-status',
  fortune: 'fortune-monthly',
  general: 'three-card-general',
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
