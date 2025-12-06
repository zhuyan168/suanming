// =============================================================================
// API 端点：/api/seasonal-draw
// 用于四季牌阵的抽牌逻辑（会员功能）
// =============================================================================
//
// 请求参数：
// - slot: 1-5（对应5个卡位）
//   - slot 1 → 权杖池（Wands - 行动层面）
//   - slot 2 → 圣杯池（Cups - 情绪层面）
//   - slot 3 → 宝剑池（Swords - 思维层面）
//   - slot 4 → 星币池（Pentacles - 现实层面）
//   - slot 5 → 大阿卡池（Major Arcana - 核心主题）
// - pick: 用户点击的卡片索引（仅作为前端交互，后端不使用）
// - sessionId: 用于标识同一轮抽牌（可选，未来可关联 userId）
//
// 返回格式：
// {
//   id: string,
//   name: string,
//   imageUrl: string,
//   suit: string,
//   number: number
// }
//
// =============================================================================

import { tarotImagesFlat } from '../../utils/tarotimages';

// =============================================================================
// 完整的78张塔罗牌数据
// =============================================================================
const tarotCards = [
  // ========== 大阿尔卡那 22张 ==========
  {
    id: 0,
    name: '0. The Fool',
    image: 'major_arcana_fool',
    suit: 'major',
    number: 0,
    upright: '新的开始、信任直觉、勇敢冒险',
    reversed: '冲动行事、犹豫不决、方向不明',
    keywords: ['纯真', '自由', '机会'],
  },
  {
    id: 1,
    name: 'I. The Magician',
    image: 'major_arcana_magician',
    suit: 'major',
    number: 1,
    upright: '资源整合、贯彻执行、影响力',
    reversed: '分散注意、欺骗、缺乏计划',
    keywords: ['行动', '意志', '显化'],
  },
  {
    id: 2,
    name: 'II. The High Priestess',
    image: 'major_arcana_priestess',
    suit: 'major',
    number: 2,
    upright: '内在智慧、直觉洞察、保持沉静',
    reversed: '忽略直觉、情绪混乱、资讯不明',
    keywords: ['直觉', '秘密', '平衡'],
  },
  {
    id: 3,
    name: 'III. The Empress',
    image: 'major_arcana_empress',
    suit: 'major',
    number: 3,
    upright: '丰盛富足、创造力、母性关怀',
    reversed: '过度依赖、创造力受阻、缺乏滋养',
    keywords: ['丰盛', '创造', '滋养'],
  },
  {
    id: 4,
    name: 'IV. The Emperor',
    image: 'major_arcana_emperor',
    suit: 'major',
    number: 4,
    upright: '权威、秩序、稳定结构',
    reversed: '专制、僵化、缺乏灵活性',
    keywords: ['权威', '秩序', '稳定'],
  },
  {
    id: 5,
    name: 'V. The Hierophant',
    image: 'major_arcana_hierophant',
    suit: 'major',
    number: 5,
    upright: '传统智慧、精神指引、遵循规范',
    reversed: '教条主义、反叛、脱离传统',
    keywords: ['传统', '指引', '规范'],
  },
  {
    id: 6,
    name: 'VI. The Lovers',
    image: 'major_arcana_lovers',
    suit: 'major',
    number: 6,
    upright: '真诚连接、重要抉择、价值一致',
    reversed: '矛盾、分歧、失去平衡',
    keywords: ['关系', '信任', '选择'],
  },
  {
    id: 7,
    name: 'VII. The Chariot',
    image: 'major_arcana_chariot',
    suit: 'major',
    number: 7,
    upright: '意志坚定、目标导向、克服障碍',
    reversed: '缺乏方向、失控、内在冲突',
    keywords: ['意志', '目标', '胜利'],
  },
  {
    id: 8,
    name: 'VIII. Strength',
    image: 'major_arcana_strength',
    suit: 'major',
    number: 8,
    upright: '内在力量、耐心、温柔控制',
    reversed: '软弱、缺乏自信、情绪失控',
    keywords: ['力量', '耐心', '控制'],
  },
  {
    id: 9,
    name: 'IX. The Hermit',
    image: 'major_arcana_hermit',
    suit: 'major',
    number: 9,
    upright: '内省、寻求真理、独处思考',
    reversed: '孤立、逃避、迷失方向',
    keywords: ['内省', '真理', '指引'],
  },
  {
    id: 10,
    name: 'X. Wheel of Fortune',
    image: 'major_arcana_fortune',
    suit: 'major',
    number: 10,
    upright: '命运转折、周期循环、新的机遇',
    reversed: '坏运气、抗拒变化、停滞不前',
    keywords: ['命运', '循环', '变化'],
  },
  {
    id: 11,
    name: 'XI. Justice',
    image: 'major_arcana_justice',
    suit: 'major',
    number: 11,
    upright: '公平正义、平衡、承担责任',
    reversed: '不公、偏见、逃避责任',
    keywords: ['正义', '平衡', '责任'],
  },
  {
    id: 12,
    name: 'XII. The Hanged Man',
    image: 'major_arcana_hanged',
    suit: 'major',
    number: 12,
    upright: '等待、牺牲、新的视角',
    reversed: '拖延、抗拒牺牲、停滞',
    keywords: ['等待', '牺牲', '视角'],
  },
  {
    id: 13,
    name: 'XIII. Death',
    image: 'major_arcana_death',
    suit: 'major',
    number: 13,
    upright: '结束与重生、转变、放下过去',
    reversed: '抗拒改变、停滞、恐惧转变',
    keywords: ['转变', '结束', '重生'],
  },
  {
    id: 14,
    name: 'XIV. Temperance',
    image: 'major_arcana_temperance',
    suit: 'major',
    number: 14,
    upright: '平衡调和、耐心、适度',
    reversed: '失衡、过度、缺乏耐心',
    keywords: ['平衡', '调和', '耐心'],
  },
  {
    id: 15,
    name: 'XV. The Devil',
    image: 'major_arcana_devil',
    suit: 'major',
    number: 15,
    upright: '束缚、欲望、物质依赖',
    reversed: '解脱、打破束缚、重获自由',
    keywords: ['束缚', '欲望', '依赖'],
  },
  {
    id: 16,
    name: 'XVI. The Tower',
    image: 'major_arcana_tower',
    suit: 'major',
    number: 16,
    upright: '突发变化、觉醒、旧结构崩塌',
    reversed: '抗拒改变、延迟崩解、局部冲击',
    keywords: ['变革', '释放', '突破'],
  },
  {
    id: 17,
    name: 'XVII. The Star',
    image: 'major_arcana_star',
    suit: 'major',
    number: 17,
    upright: '希望重燃、疗愈、灵感源泉',
    reversed: '信心不足、能量枯竭、迟滞',
    keywords: ['希望', '指引', '灵性'],
  },
  {
    id: 18,
    name: 'XVIII. The Moon',
    image: 'major_arcana_moon',
    suit: 'major',
    number: 18,
    upright: '潜意识、梦境、面对不安',
    reversed: '困惑解除、真相浮现、逐渐明朗',
    keywords: ['直觉', '感受', '阴影'],
  },
  {
    id: 19,
    name: 'XIX. The Sun',
    image: 'major_arcana_sun',
    suit: 'major',
    number: 19,
    upright: '乐观、成功、清晰洞见',
    reversed: '延迟、自满、暂时挫折',
    keywords: ['活力', '喜悦', '成长'],
  },
  {
    id: 20,
    name: 'XX. Judgement',
    image: 'major_arcana_judgement',
    suit: 'major',
    number: 20,
    upright: '觉醒、自我评估、新的开始',
    reversed: '自我怀疑、缺乏判断、错过机会',
    keywords: ['觉醒', '评估', '重生'],
  },
  {
    id: 21,
    name: 'XXI. The World',
    image: 'major_arcana_world',
    suit: 'major',
    number: 21,
    upright: '完成、成就、圆满',
    reversed: '未完成、缺乏成就感、停滞',
    keywords: ['完成', '成就', '圆满'],
  },
  // ========== 小阿尔卡那 - 权杖（Wands）14张 ==========
  {
    id: 22,
    name: 'Ace of Wands',
    image: 'minor_arcana_wands_ace',
    suit: 'wands',
    number: 1,
    upright: '新计划、灵感、创造力',
    reversed: '缺乏动力、创意受阻、延迟',
    keywords: ['灵感', '创造', '开始'],
  },
  {
    id: 23,
    name: 'Two of Wands',
    image: 'minor_arcana_wands_2',
    suit: 'wands',
    number: 2,
    upright: '规划未来、个人力量、探索',
    reversed: '缺乏规划、恐惧未知、停滞',
    keywords: ['规划', '探索', '力量'],
  },
  {
    id: 24,
    name: 'Three of Wands',
    image: 'minor_arcana_wands_3',
    suit: 'wands',
    number: 3,
    upright: '远见、探索、扩张',
    reversed: '缺乏远见、延迟、挫折',
    keywords: ['远见', '探索', '扩张'],
  },
  {
    id: 25,
    name: 'Four of Wands',
    image: 'minor_arcana_wands_4',
    suit: 'wands',
    number: 4,
    upright: '庆祝、和谐、稳定',
    reversed: '缺乏庆祝、不稳定、过渡期',
    keywords: ['庆祝', '和谐', '稳定'],
  },
  {
    id: 26,
    name: 'Five of Wands',
    image: 'minor_arcana_wands_5',
    suit: 'wands',
    number: 5,
    upright: '竞争、冲突、挑战',
    reversed: '避免冲突、内部斗争、妥协',
    keywords: ['竞争', '冲突', '挑战'],
  },
  {
    id: 27,
    name: 'Six of Wands',
    image: 'minor_arcana_wands_6',
    suit: 'wands',
    number: 6,
    upright: '胜利、成功、认可',
    reversed: '失败、缺乏认可、骄傲',
    keywords: ['胜利', '成功', '认可'],
  },
  {
    id: 28,
    name: 'Seven of Wands',
    image: 'minor_arcana_wands_7',
    suit: 'wands',
    number: 7,
    upright: '坚持立场、挑战、防御',
    reversed: '放弃、屈服、缺乏自信',
    keywords: ['坚持', '挑战', '防御'],
  },
  {
    id: 29,
    name: 'Eight of Wands',
    image: 'minor_arcana_wands_8',
    suit: 'wands',
    number: 8,
    upright: '快速行动、进展、消息',
    reversed: '延迟、匆忙、缺乏方向',
    keywords: ['速度', '进展', '消息'],
  },
  {
    id: 30,
    name: 'Nine of Wands',
    image: 'minor_arcana_wands_9',
    suit: 'wands',
    number: 9,
    upright: '韧性、坚持、最后努力',
    reversed: '疲惫、放弃、缺乏韧性',
    keywords: ['韧性', '坚持', '努力'],
  },
  {
    id: 31,
    name: 'Ten of Wands',
    image: 'minor_arcana_wands_10',
    suit: 'wands',
    number: 10,
    upright: '负担、责任、过度工作',
    reversed: '放下负担、委派、解脱',
    keywords: ['负担', '责任', '工作'],
  },
  {
    id: 32,
    name: 'Page of Wands',
    image: 'minor_arcana_wands_page',
    suit: 'wands',
    number: 11,
    upright: '探索、热情、新想法',
    reversed: '缺乏方向、拖延、不成熟',
    keywords: ['探索', '热情', '想法'],
  },
  {
    id: 33,
    name: 'Knight of Wands',
    image: 'minor_arcana_wands_knight',
    suit: 'wands',
    number: 12,
    upright: '行动、冒险、冲动',
    reversed: '鲁莽、缺乏方向、延迟',
    keywords: ['行动', '冒险', '冲动'],
  },
  {
    id: 34,
    name: 'Queen of Wands',
    image: 'minor_arcana_wands_queen',
    suit: 'wands',
    number: 13,
    upright: '自信、热情、独立',
    reversed: '缺乏自信、嫉妒、依赖',
    keywords: ['自信', '热情', '独立'],
  },
  {
    id: 35,
    name: 'King of Wands',
    image: 'minor_arcana_wands_king',
    suit: 'wands',
    number: 14,
    upright: '领导力、远见、创业精神',
    reversed: '专制、缺乏远见、冲动',
    keywords: ['领导', '远见', '创业'],
  },
  // ========== 小阿尔卡那 - 圣杯（Cups）14张 ==========
  {
    id: 36,
    name: 'Ace of Cups',
    image: 'minor_arcana_cups_ace',
    suit: 'cups',
    number: 1,
    upright: '新感情、情感开始、直觉',
    reversed: '情感空虚、失去连接、拒绝爱',
    keywords: ['情感', '直觉', '开始'],
  },
  {
    id: 37,
    name: 'Two of Cups',
    image: 'minor_arcana_cups_2',
    suit: 'cups',
    number: 2,
    upright: '伙伴关系、结合、相互吸引',
    reversed: '关系破裂、不平衡、分离',
    keywords: ['伙伴', '结合', '吸引'],
  },
  {
    id: 38,
    name: 'Three of Cups',
    image: 'minor_arcana_cups_3',
    suit: 'cups',
    number: 3,
    upright: '友谊、庆祝、社交',
    reversed: '孤立、过度社交、冲突',
    keywords: ['友谊', '庆祝', '社交'],
  },
  {
    id: 39,
    name: 'Four of Cups',
    image: 'minor_arcana_cups_4',
    suit: 'cups',
    number: 4,
    upright: '沉思、内省、错过机会',
    reversed: '觉醒、新机会、接受',
    keywords: ['沉思', '内省', '机会'],
  },
  {
    id: 40,
    name: 'Five of Cups',
    image: 'minor_arcana_cups_5',
    suit: 'cups',
    number: 5,
    upright: '失落、悲伤、遗憾',
    reversed: '接受、宽恕、前进',
    keywords: ['失落', '悲伤', '遗憾'],
  },
  {
    id: 41,
    name: 'Six of Cups',
    image: 'minor_arcana_cups_6',
    suit: 'cups',
    number: 6,
    upright: '怀旧、回忆、纯真',
    reversed: '困在过去、拒绝成长、不成熟',
    keywords: ['怀旧', '回忆', '纯真'],
  },
  {
    id: 42,
    name: 'Seven of Cups',
    image: 'minor_arcana_cups_7',
    suit: 'cups',
    number: 7,
    upright: '选择、幻想、可能性',
    reversed: '缺乏焦点、混乱、错误选择',
    keywords: ['选择', '幻想', '可能'],
  },
  {
    id: 43,
    name: 'Eight of Cups',
    image: 'minor_arcana_cups_8',
    suit: 'cups',
    number: 8,
    upright: '放弃、寻找更深意义、离开',
    reversed: '停滞、恐惧改变、逃避',
    keywords: ['放弃', '寻找', '离开'],
  },
  {
    id: 44,
    name: 'Nine of Cups',
    image: 'minor_arcana_cups_9',
    suit: 'cups',
    number: 9,
    upright: '满足、情感满足、愿望实现',
    reversed: '缺乏满足、物质主义、过度',
    keywords: ['满足', '实现', '愿望'],
  },
  {
    id: 45,
    name: 'Ten of Cups',
    image: 'minor_arcana_cups_10',
    suit: 'cups',
    number: 10,
    upright: '和谐、家庭幸福、圆满',
    reversed: '不和谐、家庭冲突、缺乏支持',
    keywords: ['和谐', '幸福', '圆满'],
  },
  {
    id: 46,
    name: 'Page of Cups',
    image: 'minor_arcana_cups_page',
    suit: 'cups',
    number: 11,
    upright: '创意灵感、直觉、新感情',
    reversed: '情感不成熟、缺乏创意、拒绝直觉',
    keywords: ['创意', '直觉', '感情'],
  },
  {
    id: 47,
    name: 'Knight of Cups',
    image: 'minor_arcana_cups_knight',
    suit: 'cups',
    number: 12,
    upright: '浪漫、魅力、追求理想',
    reversed: '情绪化、不切实际、逃避',
    keywords: ['浪漫', '魅力', '理想'],
  },
  {
    id: 48,
    name: 'Queen of Cups',
    image: 'minor_arcana_cups_queen',
    suit: 'cups',
    number: 13,
    upright: '同情、直觉、情感支持',
    reversed: '情绪不稳定、缺乏同情、依赖',
    keywords: ['同情', '直觉', '支持'],
  },
  {
    id: 49,
    name: 'King of Cups',
    image: 'minor_arcana_cups_king',
    suit: 'cups',
    number: 14,
    upright: '情感平衡、同情、控制',
    reversed: '情绪失控、冷漠、缺乏平衡',
    keywords: ['平衡', '同情', '控制'],
  },
  // ========== 小阿尔卡那 - 宝剑（Swords）14张 ==========
  {
    id: 50,
    name: 'Ace of Swords',
    image: 'minor_arcana_swords_ace',
    suit: 'swords',
    number: 1,
    upright: '新想法、清晰、突破',
    reversed: '混乱、缺乏清晰、错误想法',
    keywords: ['清晰', '突破', '想法'],
  },
  {
    id: 51,
    name: 'Two of Swords',
    image: 'minor_arcana_swords_2',
    suit: 'swords',
    number: 2,
    upright: '困难选择、僵局、平衡',
    reversed: '优柔寡断、逃避选择、不平衡',
    keywords: ['选择', '僵局', '平衡'],
  },
  {
    id: 52,
    name: 'Three of Swords',
    image: 'minor_arcana_swords_3',
    suit: 'swords',
    number: 3,
    upright: '心碎、悲伤、分离',
    reversed: '恢复、宽恕、情感愈合',
    keywords: ['心碎', '悲伤', '分离'],
  },
  {
    id: 53,
    name: 'Four of Swords',
    image: 'minor_arcana_swords_4',
    suit: 'swords',
    number: 4,
    upright: '休息、恢复、冥想',
    reversed: '疲惫、缺乏休息、过度工作',
    keywords: ['休息', '恢复', '冥想'],
  },
  {
    id: 54,
    name: 'Five of Swords',
    image: 'minor_arcana_swords_5',
    suit: 'swords',
    number: 5,
    upright: '冲突、背叛、不公',
    reversed: '和解、宽恕、解决冲突',
    keywords: ['冲突', '背叛', '不公'],
  },
  {
    id: 55,
    name: 'Six of Swords',
    image: 'minor_arcana_swords_6',
    suit: 'swords',
    number: 6,
    upright: '过渡、离开、前进',
    reversed: '无法前进、困在过去、延迟',
    keywords: ['过渡', '离开', '前进'],
  },
  {
    id: 56,
    name: 'Seven of Swords',
    image: 'minor_arcana_swords_7',
    suit: 'swords',
    number: 7,
    upright: '欺骗、策略、逃避',
    reversed: '诚实、面对后果、承担责任',
    keywords: ['欺骗', '策略', '逃避'],
  },
  {
    id: 57,
    name: 'Eight of Swords',
    image: 'minor_arcana_swords_8',
    suit: 'swords',
    number: 8,
    upright: '限制、自我怀疑、被困',
    reversed: '自由、自我接受、新视角',
    keywords: ['限制', '怀疑', '被困'],
  },
  {
    id: 58,
    name: 'Nine of Swords',
    image: 'minor_arcana_swords_9',
    suit: 'swords',
    number: 9,
    upright: '焦虑、噩梦、恐惧',
    reversed: '希望、恢复、面对恐惧',
    keywords: ['焦虑', '噩梦', '恐惧'],
  },
  {
    id: 59,
    name: 'Ten of Swords',
    image: 'minor_arcana_swords_10',
    suit: 'swords',
    number: 10,
    upright: '背叛、结束、痛苦',
    reversed: '恢复、新开始、释放',
    keywords: ['背叛', '结束', '痛苦'],
  },
  {
    id: 60,
    name: 'Page of Swords',
    image: 'minor_arcana_swords_page',
    suit: 'swords',
    number: 11,
    upright: '好奇心、新想法、沟通',
    reversed: '缺乏焦点、八卦、错误信息',
    keywords: ['好奇', '想法', '沟通'],
  },
  {
    id: 61,
    name: 'Knight of Swords',
    image: 'minor_arcana_swords_knight',
    suit: 'swords',
    number: 12,
    upright: '行动、冲动、直接',
    reversed: '鲁莽、缺乏方向、延迟',
    keywords: ['行动', '冲动', '直接'],
  },
  {
    id: 62,
    name: 'Queen of Swords',
    image: 'minor_arcana_swords_queen',
    suit: 'swords',
    number: 13,
    upright: '清晰思考、独立、诚实',
    reversed: '冷酷、缺乏同情、偏见',
    keywords: ['清晰', '独立', '诚实'],
  },
  {
    id: 63,
    name: 'King of Swords',
    image: 'minor_arcana_swords_king',
    suit: 'swords',
    number: 14,
    upright: '真理、公正、权威',
    reversed: '操纵、不公、滥用权力',
    keywords: ['真理', '公正', '权威'],
  },
  // ========== 小阿尔卡那 - 星币（Pentacles）14张 ==========
  {
    id: 64,
    name: 'Ace of Pentacles',
    image: 'minor_arcana_pentacles_ace',
    suit: 'pentacles',
    number: 1,
    upright: '新机会、物质开始、潜力',
    reversed: '错失机会、缺乏规划、不稳定',
    keywords: ['机会', '物质', '潜力'],
  },
  {
    id: 65,
    name: 'Two of Pentacles',
    image: 'minor_arcana_pentacles_2',
    suit: 'pentacles',
    number: 2,
    upright: '平衡优先、时间管理、适应',
    reversed: '不平衡、缺乏优先、过度承诺',
    keywords: ['平衡', '管理', '适应'],
  },
  {
    id: 66,
    name: 'Three of Pentacles',
    image: 'minor_arcana_pentacles_3',
    suit: 'pentacles',
    number: 3,
    upright: '团队合作、协作、技能',
    reversed: '缺乏合作、不专业、孤立',
    keywords: ['合作', '协作', '技能'],
  },
  {
    id: 67,
    name: 'Four of Pentacles',
    image: 'minor_arcana_pentacles_4',
    suit: 'pentacles',
    number: 4,
    upright: '控制、安全、节俭',
    reversed: '贪婪、物质主义、缺乏控制',
    keywords: ['控制', '安全', '节俭'],
  },
  {
    id: 68,
    name: 'Five of Pentacles',
    image: 'minor_arcana_pentacles_5',
    suit: 'pentacles',
    number: 5,
    upright: '物质困难、孤立、贫困',
    reversed: '恢复、寻求帮助、新开始',
    keywords: ['困难', '孤立', '贫困'],
  },
  {
    id: 69,
    name: 'Six of Pentacles',
    image: 'minor_arcana_pentacles_6',
    suit: 'pentacles',
    number: 6,
    upright: '慷慨、分享、给予',
    reversed: '自私、不平衡、债务',
    keywords: ['慷慨', '分享', '给予'],
  },
  {
    id: 70,
    name: 'Seven of Pentacles',
    image: 'minor_arcana_pentacles_7',
    suit: 'pentacles',
    number: 7,
    upright: '长期观点、评估、耐心',
    reversed: '缺乏进展、挫折、不耐烦',
    keywords: ['长期', '评估', '耐心'],
  },
  {
    id: 71,
    name: 'Eight of Pentacles',
    image: 'minor_arcana_pentacles_8',
    suit: 'pentacles',
    number: 8,
    upright: '技能发展、质量、专注',
    reversed: '缺乏质量、匆忙、缺乏技能',
    keywords: ['技能', '质量', '专注'],
  },
  {
    id: 72,
    name: 'Nine of Pentacles',
    image: 'minor_arcana_pentacles_9',
    suit: 'pentacles',
    number: 9,
    upright: '财务独立、自给自足、享受',
    reversed: '缺乏独立、过度依赖、财务困难',
    keywords: ['独立', '自给', '享受'],
  },
  {
    id: 73,
    name: 'Ten of Pentacles',
    image: 'minor_arcana_pentacles_10',
    suit: 'pentacles',
    number: 10,
    upright: '财富、家庭安全、长期成功',
    reversed: '财务损失、缺乏安全、家庭冲突',
    keywords: ['财富', '安全', '成功'],
  },
  {
    id: 74,
    name: 'Page of Pentacles',
    image: 'minor_arcana_pentacles_page',
    suit: 'pentacles',
    number: 11,
    upright: '新机会、学习、务实',
    reversed: '缺乏机会、不切实际、拖延',
    keywords: ['机会', '学习', '务实'],
  },
  {
    id: 75,
    name: 'Knight of Pentacles',
    image: 'minor_arcana_pentacles_knight',
    suit: 'pentacles',
    number: 12,
    upright: '效率、责任、方法',
    reversed: '懒惰、缺乏责任、拖延',
    keywords: ['效率', '责任', '方法'],
  },
  {
    id: 76,
    name: 'Queen of Pentacles',
    image: 'minor_arcana_pentacles_queen',
    suit: 'pentacles',
    number: 13,
    upright: '实用、关怀、财务安全',
    reversed: '自我中心、物质主义、缺乏关怀',
    keywords: ['实用', '关怀', '安全'],
  },
  {
    id: 77,
    name: 'King of Pentacles',
    image: 'minor_arcana_pentacles_king',
    suit: 'pentacles',
    number: 14,
    upright: '财务安全、实用、慷慨',
    reversed: '财务不稳定、贪婪、缺乏慷慨',
    keywords: ['安全', '实用', '慷慨'],
  },
];

// =============================================================================
// 创建五个牌池
// =============================================================================
const swordsPool = tarotCards.filter(card => card.suit === 'swords');
const cupsPool = tarotCards.filter(card => card.suit === 'cups');
const wandsPool = tarotCards.filter(card => card.suit === 'wands');
const pentaclesPool = tarotCards.filter(card => card.suit === 'pentacles');
const majorPool = tarotCards.filter(card => card.suit === 'major');

// =============================================================================
// 临时内存存储已抽卡片（未来接入数据库后替换）
// key: sessionId, value: Set of card IDs
// =============================================================================
const sessionDrawnCards = new Map();

// =============================================================================
// 会员验证函数（预留接口）
// 未来接入用户系统后，在此实现真实的会员校验逻辑
// =============================================================================
async function verifyMembership(userId) {
  // TODO: 未来接入用户系统后，实现真实的会员验证
  // 示例：查询数据库检查用户会员状态
  // const user = await db.users.findById(userId);
  // return user && user.membershipStatus === 'active';
  
  // 当前默认所有用户都是会员（开发阶段）
  return true;
}

// =============================================================================
// 历史记录保存函数（预留接口）
// 未来接入数据库后，保存四季牌阵抽牌记录
// =============================================================================
async function saveSeasonalRecord(userId, cards) {
  // TODO: 未来接入数据库后，保存抽牌记录
  // 示例：
  // await db.tarotRecords.insert({
  //   userId: userId,
  //   spreadType: 'seasonal',
  //   cards: cards,
  //   createdAt: new Date()
  // });
  
  console.log('[预留] 保存四季牌阵记录:', { userId, cardsCount: cards.length });
}

// =============================================================================
// 根据 slot 参数获取对应的牌池
// 对应前端 FiveCardSlots.tsx 的槽位定义：
// - Slot 1 (索引0) → 权杖牌组 (Wands) - 左侧
// - Slot 2 (索引1) → 圣杯牌组 (Cups) - 右侧
// - Slot 3 (索引2) → 宝剑牌组 (Swords) - 下方
// - Slot 4 (索引3) → 星币牌组 (Pentacles) - 上方
// - Slot 5 (索引4) → 大阿尔卡纳 (Major Arcana) - 中心
// =============================================================================
function getPoolBySlot(slot) {
  switch (slot) {
    case 1:
      return { pool: wandsPool, name: 'wands' };
    case 2:
      return { pool: cupsPool, name: 'cups' };
    case 3:
      return { pool: swordsPool, name: 'swords' };
    case 4:
      return { pool: pentaclesPool, name: 'pentacles' };
    case 5:
      return { pool: majorPool, name: 'major' };
    default:
      return null;
  }
}

// =============================================================================
// 从指定牌池中随机抽取一张未抽过的牌
// =============================================================================
function drawCardFromPool(pool, drawnCardIds) {
  // 过滤出未抽过的牌
  const availableCards = pool.filter(card => !drawnCardIds.has(card.id));
  
  if (availableCards.length === 0) {
    // 牌池已空（理论上不应该发生，因为每个池有14张，只抽1张）
    return null;
  }
  
  // 随机选择一张
  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex];
}

// =============================================================================
// API 主处理函数
// =============================================================================
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slot, pick, sessionId } = req.query;
    
    // -------------------------------------------------------------------------
    // 1. 会员验证（预留）
    // -------------------------------------------------------------------------
    // const userId = req.user?.id; // 未来从认证中间件获取
    const userId = null; // 当前未实现用户系统
    
    const isMember = await verifyMembership(userId);
    if (!isMember) {
      return res.status(403).json({ error: 'not_member' });
    }
    
    // -------------------------------------------------------------------------
    // 2. 参数验证
    // -------------------------------------------------------------------------
    const slotNum = parseInt(slot, 10);
    
    if (!slot || isNaN(slotNum) || slotNum < 1 || slotNum > 5) {
      return res.status(400).json({ 
        error: 'invalid_slot',
        message: 'slot 参数必须是 1-5 之间的数字'
      });
    }
    
    // pick 参数仅作为前端交互，后端不使用
    // sessionId 用于标识同一轮抽牌
    const currentSessionId = sessionId || 'default';
    
    // -------------------------------------------------------------------------
    // 3. 获取对应的牌池
    // -------------------------------------------------------------------------
    const poolData = getPoolBySlot(slotNum);
    if (!poolData) {
      return res.status(400).json({ 
        error: 'invalid_slot',
        message: 'slot 参数不合法'
      });
    }
    
    // -------------------------------------------------------------------------
    // 4. 获取当前 session 已抽的牌
    // -------------------------------------------------------------------------
    if (!sessionDrawnCards.has(currentSessionId)) {
      sessionDrawnCards.set(currentSessionId, new Set());
    }
    const drawnCardIds = sessionDrawnCards.get(currentSessionId);
    
    // -------------------------------------------------------------------------
    // 5. 从牌池中抽取一张牌
    // -------------------------------------------------------------------------
    const selectedCard = drawCardFromPool(poolData.pool, drawnCardIds);
    
    if (!selectedCard) {
      return res.status(500).json({ 
        error: 'pool_empty',
        message: '牌池已空，无法抽取更多卡牌'
      });
    }
    
    // 记录已抽卡片
    drawnCardIds.add(selectedCard.id);
    
    // -------------------------------------------------------------------------
    // 5.5. 如果抽满5张，清理session（重要：保证下次抽牌时牌堆是全新的）
    // -------------------------------------------------------------------------
    if (drawnCardIds.size >= 5) {
      // 立即清理当前session，避免影响下次抽牌
      sessionDrawnCards.delete(currentSessionId);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[四季牌阵] Session ${currentSessionId} 已完成5张抽牌，已清理`);
      }
    }
    
    // -------------------------------------------------------------------------
    // 6. 获取图片 URL
    // -------------------------------------------------------------------------
    const imageKey = selectedCard.image;
    const imageUrl = tarotImagesFlat[imageKey];
    
    // -------------------------------------------------------------------------
    // 7. 随机生成正逆位
    // -------------------------------------------------------------------------
    const orientation = Math.random() >= 0.5 ? 'upright' : 'reversed';
    
    // -------------------------------------------------------------------------
    // 8. 构造返回数据（符合前端要求的格式）
    // -------------------------------------------------------------------------
    const responseCard = {
      id: selectedCard.id,  // number 类型
      name: selectedCard.name,
      imageUrl: imageUrl,
      upright: selectedCard.upright,
      reversed: selectedCard.reversed,
      keywords: selectedCard.keywords,
      orientation: orientation,
      suit: selectedCard.suit,
      number: selectedCard.number
    };
    
    // -------------------------------------------------------------------------
    // 9. 返回结果（包裹在 card 属性中）
    // -------------------------------------------------------------------------
    return res.status(200).json({
      slot: slotNum,
      card: responseCard
    });
    
  } catch (error) {
    console.error('四季牌阵抽牌错误:', error);
    return res.status(500).json({ 
      error: 'internal_error',
      message: '服务器内部错误'
    });
  }
}

