import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem from '../../../components/fortune/CardItem';
import EmptySlot from '../../../components/fortune/EmptySlot';
import ScrollBar from '../../../components/fortune/ScrollBar';
import FiveCardSlots from '../../../components/fortune/FiveCardSlots';
import { TarotCard, CardMeaning } from '../../../components/fortune/CardItem';
import { tarotImagesFlat } from '../../../utils/tarotimages';
import { useSpreadAccess } from '../../../hooks/useSpreadAccess';
import { getAuthHeaders, getClientCacheIdentity } from '../../../lib/apiHeaders';

// 完整的78张塔罗牌数据（仅用于UI渲染背面卡片）
const tarotCards = [
  // ========== 大阿尔卡那 22张 ==========
  {
    id: 0,
    name: '0. The Fool',
    image: '/assets/tarot-webp-optimized/major_arcana_fool.webp',
    upright: '新的开始、信任直觉、勇敢冒险',
    reversed: '冲动行事、犹豫不决、方向不明',
    keywords: ['纯真', '自由', '机会'],
  },
  {
    id: 1,
    name: 'I. The Magician',
    image: '/assets/tarot-webp-optimized/major_arcana_magician.webp',
    upright: '资源整合、贯彻执行、影响力',
    reversed: '分散注意、欺骗、缺乏计划',
    keywords: ['行动', '意志', '显化'],
  },
  {
    id: 2,
    name: 'II. The High Priestess',
    image: '/assets/tarot-webp-optimized/major_arcana_priestess.webp',
    upright: '内在智慧、直觉洞察、保持沉静',
    reversed: '忽略直觉、情绪混乱、资讯不明',
    keywords: ['直觉', '秘密', '平衡'],
  },
  {
    id: 3,
    name: 'III. The Empress',
    image: '/assets/tarot-webp-optimized/major_arcana_empress.webp',
    upright: '丰盛富足、创造力、母性关怀',
    reversed: '过度依赖、创造力受阻、缺乏滋养',
    keywords: ['丰盛', '创造', '滋养'],
  },
  {
    id: 4,
    name: 'IV. The Emperor',
    image: '/assets/tarot-webp-optimized/major_arcana_emperor.webp',
    upright: '权威、秩序、稳定结构',
    reversed: '专制、僵化、缺乏灵活性',
    keywords: ['权威', '秩序', '稳定'],
  },
  {
    id: 5,
    name: 'V. The Hierophant',
    image: '/assets/tarot-webp-optimized/major_arcana_hierophant.webp',
    upright: '传统智慧、精神指引、遵循规范',
    reversed: '教条主义、反叛、脱离传统',
    keywords: ['传统', '指引', '规范'],
  },
  {
    id: 6,
    name: 'VI. The Lovers',
    image: '/assets/tarot-webp-optimized/major_arcana_lovers.webp',
    upright: '真诚连接、重要抉择、价值一致',
    reversed: '矛盾、分歧、失去平衡',
    keywords: ['关系', '信任', '选择'],
  },
  {
    id: 7,
    name: 'VII. The Chariot',
    image: '/assets/tarot-webp-optimized/major_arcana_chariot.webp',
    upright: '意志坚定、目标导向、克服障碍',
    reversed: '缺乏方向、失控、内在冲突',
    keywords: ['意志', '目标', '胜利'],
  },
  {
    id: 8,
    name: 'VIII. Strength',
    image: '/assets/tarot-webp-optimized/major_arcana_strength.webp',
    upright: '内在力量、耐心、温柔控制',
    reversed: '软弱、缺乏自信、情绪失控',
    keywords: ['力量', '耐心', '控制'],
  },
  {
    id: 9,
    name: 'IX. The Hermit',
    image: '/assets/tarot-webp-optimized/major_arcana_hermit.webp',
    upright: '内省、寻求真理、独处思考',
    reversed: '孤立、逃避、迷失方向',
    keywords: ['内省', '真理', '指引'],
  },
  {
    id: 10,
    name: 'X. Wheel of Fortune',
    image: '/assets/tarot-webp-optimized/major_arcana_fortune.webp',
    upright: '命运转折、周期循环、新的机遇',
    reversed: '坏运气、抗拒变化、停滞不前',
    keywords: ['命运', '循环', '变化'],
  },
  {
    id: 11,
    name: 'XI. Justice',
    image: '/assets/tarot-webp-optimized/major_arcana_justice.webp',
    upright: '公平正义、平衡、承担责任',
    reversed: '不公、偏见、逃避责任',
    keywords: ['正义', '平衡', '责任'],
  },
  {
    id: 12,
    name: 'XII. The Hanged Man',
    image: '/assets/tarot-webp-optimized/major_arcana_hanged.webp',
    upright: '等待、牺牲、新的视角',
    reversed: '拖延、抗拒牺牲、停滞',
    keywords: ['等待', '牺牲', '视角'],
  },
  {
    id: 13,
    name: 'XIII. Death',
    image: '/assets/tarot-webp-optimized/major_arcana_death.webp',
    upright: '结束与重生、转变、放下过去',
    reversed: '抗拒改变、停滞、恐惧转变',
    keywords: ['转变', '结束', '重生'],
  },
  {
    id: 14,
    name: 'XIV. Temperance',
    image: '/assets/tarot-webp-optimized/major_arcana_temperance.webp',
    upright: '平衡调和、耐心、适度',
    reversed: '失衡、过度、缺乏耐心',
    keywords: ['平衡', '调和', '耐心'],
  },
  {
    id: 15,
    name: 'XV. The Devil',
    image: '/assets/tarot-webp-optimized/major_arcana_devil.webp',
    upright: '束缚、欲望、物质依赖',
    reversed: '解脱、打破束缚、重获自由',
    keywords: ['束缚', '欲望', '依赖'],
  },
  {
    id: 16,
    name: 'XVI. The Tower',
    image: '/assets/tarot-webp-optimized/major_arcana_tower.webp',
    upright: '突发变化、觉醒、旧结构崩塌',
    reversed: '抗拒改变、延迟崩解、局部冲击',
    keywords: ['变革', '释放', '突破'],
  },
  {
    id: 17,
    name: 'XVII. The Star',
    image: '/assets/tarot-webp-optimized/major_arcana_star.webp',
    upright: '希望重燃、疗愈、灵感源泉',
    reversed: '信心不足、能量枯竭、迟滞',
    keywords: ['希望', '指引', '灵性'],
  },
  {
    id: 18,
    name: 'XVIII. The Moon',
    image: '/assets/tarot-webp-optimized/major_arcana_moon.webp',
    upright: '潜意识、梦境、面对不安',
    reversed: '困惑解除、真相浮现、逐渐明朗',
    keywords: ['直觉', '感受', '阴影'],
  },
  {
    id: 19,
    name: 'XIX. The Sun',
    image: '/assets/tarot-webp-optimized/major_arcana_sun.webp',
    upright: '乐观、成功、清晰洞见',
    reversed: '延迟、自满、暂时挫折',
    keywords: ['活力', '喜悦', '成长'],
  },
  {
    id: 20,
    name: 'XX. Judgement',
    image: '/assets/tarot-webp-optimized/major_arcana_judgement.webp',
    upright: '觉醒、自我评估、新的开始',
    reversed: '自我怀疑、缺乏判断、错过机会',
    keywords: ['觉醒', '评估', '重生'],
  },
  {
    id: 21,
    name: 'XXI. The World',
    image: '/assets/tarot-webp-optimized/major_arcana_world.webp',
    upright: '完成、成就、圆满',
    reversed: '未完成、缺乏成就感、停滞',
    keywords: ['完成', '成就', '圆满'],
  },
  // ========== 小阿尔卡那 - 权杖（Wands）14张 ==========
  {
    id: 22,
    name: 'Ace of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_ace.webp',
    upright: '新计划、灵感、创造力',
    reversed: '缺乏动力、创意受阻、延迟',
    keywords: ['灵感', '创造', '开始'],
  },
  {
    id: 23,
    name: 'Two of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_2.webp',
    upright: '规划未来、个人力量、探索',
    reversed: '缺乏规划、恐惧未知、停滞',
    keywords: ['规划', '探索', '力量'],
  },
  {
    id: 24,
    name: 'Three of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_3.webp',
    upright: '远见、探索、扩张',
    reversed: '缺乏远见、延迟、挫折',
    keywords: ['远见', '探索', '扩张'],
  },
  {
    id: 25,
    name: 'Four of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_4.webp',
    upright: '庆祝、和谐、稳定',
    reversed: '缺乏庆祝、不稳定、过渡期',
    keywords: ['庆祝', '和谐', '稳定'],
  },
  {
    id: 26,
    name: 'Five of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_5.webp',
    upright: '竞争、冲突、挑战',
    reversed: '避免冲突、内部斗争、妥协',
    keywords: ['竞争', '冲突', '挑战'],
  },
  {
    id: 27,
    name: 'Six of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_6.webp',
    upright: '胜利、成功、认可',
    reversed: '失败、缺乏认可、骄傲',
    keywords: ['胜利', '成功', '认可'],
  },
  {
    id: 28,
    name: 'Seven of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_7.webp',
    upright: '坚持立场、挑战、防御',
    reversed: '放弃、屈服、缺乏自信',
    keywords: ['坚持', '挑战', '防御'],
  },
  {
    id: 29,
    name: 'Eight of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_8.webp',
    upright: '快速行动、进展、消息',
    reversed: '延迟、匆忙、缺乏方向',
    keywords: ['速度', '进展', '消息'],
  },
  {
    id: 30,
    name: 'Nine of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_9.webp',
    upright: '韧性、坚持、最后努力',
    reversed: '疲惫、放弃、缺乏韧性',
    keywords: ['韧性', '坚持', '努力'],
  },
  {
    id: 31,
    name: 'Ten of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_10.webp',
    upright: '负担、责任、过度工作',
    reversed: '放下负担、委派、解脱',
    keywords: ['负担', '责任', '工作'],
  },
  {
    id: 32,
    name: 'Page of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_page.webp',
    upright: '探索、热情、新想法',
    reversed: '缺乏方向、拖延、不成熟',
    keywords: ['探索', '热情', '想法'],
  },
  {
    id: 33,
    name: 'Knight of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_knight.webp',
    upright: '行动、冒险、冲动',
    reversed: '鲁莽、缺乏方向、延迟',
    keywords: ['行动', '冒险', '冲动'],
  },
  {
    id: 34,
    name: 'Queen of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_queen.webp',
    upright: '自信、热情、独立',
    reversed: '缺乏自信、嫉妒、依赖',
    keywords: ['自信', '热情', '独立'],
  },
  {
    id: 35,
    name: 'King of Wands',
    image: '/assets/tarot-webp-optimized/minor_arcana_wands_king.webp',
    upright: '领导力、远见、创业精神',
    reversed: '专制、缺乏远见、冲动',
    keywords: ['领导', '远见', '创业'],
  },
  // ========== 小阿尔卡那 - 圣杯（Cups）14张 ==========
  {
    id: 36,
    name: 'Ace of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_ace.webp',
    upright: '新感情、情感开始、直觉',
    reversed: '情感空虚、失去连接、拒绝爱',
    keywords: ['情感', '直觉', '开始'],
  },
  {
    id: 37,
    name: 'Two of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_2.webp',
    upright: '伙伴关系、结合、相互吸引',
    reversed: '关系破裂、不平衡、分离',
    keywords: ['伙伴', '结合', '吸引'],
  },
  {
    id: 38,
    name: 'Three of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_3.webp',
    upright: '友谊、庆祝、社交',
    reversed: '孤立、过度社交、冲突',
    keywords: ['友谊', '庆祝', '社交'],
  },
  {
    id: 39,
    name: 'Four of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_4.webp',
    upright: '沉思、内省、错过机会',
    reversed: '觉醒、新机会、接受',
    keywords: ['沉思', '内省', '机会'],
  },
  {
    id: 40,
    name: 'Five of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_5.webp',
    upright: '失落、悲伤、遗憾',
    reversed: '接受、宽恕、前进',
    keywords: ['失落', '悲伤', '遗憾'],
  },
  {
    id: 41,
    name: 'Six of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_6.webp',
    upright: '怀旧、回忆、纯真',
    reversed: '困在过去、拒绝成长、不成熟',
    keywords: ['怀旧', '回忆', '纯真'],
  },
  {
    id: 42,
    name: 'Seven of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_7.webp',
    upright: '选择、幻想、可能性',
    reversed: '缺乏焦点、混乱、错误选择',
    keywords: ['选择', '幻想', '可能'],
  },
  {
    id: 43,
    name: 'Eight of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_8.webp',
    upright: '放弃、寻找更深意义、离开',
    reversed: '停滞、恐惧改变、逃避',
    keywords: ['放弃', '寻找', '离开'],
  },
  {
    id: 44,
    name: 'Nine of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_9.webp',
    upright: '满足、情感满足、愿望实现',
    reversed: '缺乏满足、物质主义、过度',
    keywords: ['满足', '实现', '愿望'],
  },
  {
    id: 45,
    name: 'Ten of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_10.webp',
    upright: '和谐、家庭幸福、圆满',
    reversed: '不和谐、家庭冲突、缺乏支持',
    keywords: ['和谐', '幸福', '圆满'],
  },
  {
    id: 46,
    name: 'Page of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_page.webp',
    upright: '创意灵感、直觉、新感情',
    reversed: '情感不成熟、缺乏创意、拒绝直觉',
    keywords: ['创意', '直觉', '感情'],
  },
  {
    id: 47,
    name: 'Knight of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_knight.webp',
    upright: '浪漫、魅力、追求理想',
    reversed: '情绪化、不切实际、逃避',
    keywords: ['浪漫', '魅力', '理想'],
  },
  {
    id: 48,
    name: 'Queen of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_queen.webp',
    upright: '同情、直觉、情感支持',
    reversed: '情绪不稳定、缺乏同情、依赖',
    keywords: ['同情', '直觉', '支持'],
  },
  {
    id: 49,
    name: 'King of Cups',
    image: '/assets/tarot-webp-optimized/minor_arcana_cups_king.webp',
    upright: '情感平衡、同情、控制',
    reversed: '情绪失控、冷漠、缺乏平衡',
    keywords: ['平衡', '同情', '控制'],
  },
  // ========== 小阿尔卡那 - 宝剑（Swords）14张 ==========
  {
    id: 50,
    name: 'Ace of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_ace.webp',
    upright: '新想法、清晰、突破',
    reversed: '混乱、缺乏清晰、错误想法',
    keywords: ['清晰', '突破', '想法'],
  },
  {
    id: 51,
    name: 'Two of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_2.webp',
    upright: '困难选择、僵局、平衡',
    reversed: '优柔寡断、逃避选择、不平衡',
    keywords: ['选择', '僵局', '平衡'],
  },
  {
    id: 52,
    name: 'Three of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_3.webp',
    upright: '心碎、悲伤、分离',
    reversed: '恢复、宽恕、情感愈合',
    keywords: ['心碎', '悲伤', '分离'],
  },
  {
    id: 53,
    name: 'Four of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_4.webp',
    upright: '休息、恢复、冥想',
    reversed: '疲惫、缺乏休息、过度工作',
    keywords: ['休息', '恢复', '冥想'],
  },
  {
    id: 54,
    name: 'Five of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_5.webp',
    upright: '冲突、背叛、不公',
    reversed: '和解、宽恕、解决冲突',
    keywords: ['冲突', '背叛', '不公'],
  },
  {
    id: 55,
    name: 'Six of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_6.webp',
    upright: '过渡、离开、前进',
    reversed: '无法前进、困在过去、延迟',
    keywords: ['过渡', '离开', '前进'],
  },
  {
    id: 56,
    name: 'Seven of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_7.webp',
    upright: '欺骗、策略、逃避',
    reversed: '诚实、面对后果、承担责任',
    keywords: ['欺骗', '策略', '逃避'],
  },
  {
    id: 57,
    name: 'Eight of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_8.webp',
    upright: '限制、自我怀疑、被困',
    reversed: '自由、自我接受、新视角',
    keywords: ['限制', '怀疑', '被困'],
  },
  {
    id: 58,
    name: 'Nine of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_9.webp',
    upright: '焦虑、噩梦、恐惧',
    reversed: '希望、恢复、面对恐惧',
    keywords: ['焦虑', '噩梦', '恐惧'],
  },
  {
    id: 59,
    name: 'Ten of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_10.webp',
    upright: '背叛、结束、痛苦',
    reversed: '恢复、新开始、释放',
    keywords: ['背叛', '结束', '痛苦'],
  },
  {
    id: 60,
    name: 'Page of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_page.webp',
    upright: '好奇心、新想法、沟通',
    reversed: '缺乏焦点、八卦、错误信息',
    keywords: ['好奇', '想法', '沟通'],
  },
  {
    id: 61,
    name: 'Knight of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_knight.webp',
    upright: '行动、冲动、直接',
    reversed: '鲁莽、缺乏方向、延迟',
    keywords: ['行动', '冲动', '直接'],
  },
  {
    id: 62,
    name: 'Queen of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_queen.webp',
    upright: '清晰思考、独立、诚实',
    reversed: '冷酷、缺乏同情、偏见',
    keywords: ['清晰', '独立', '诚实'],
  },
  {
    id: 63,
    name: 'King of Swords',
    image: '/assets/tarot-webp-optimized/minor_arcana_swords_king.webp',
    upright: '真理、公正、权威',
    reversed: '操纵、不公、滥用权力',
    keywords: ['真理', '公正', '权威'],
  },
  // ========== 小阿尔卡那 - 星币（Pentacles）14张 ==========
  {
    id: 64,
    name: 'Ace of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_ace.webp',
    upright: '新机会、物质开始、潜力',
    reversed: '错失机会、缺乏规划、不稳定',
    keywords: ['机会', '物质', '潜力'],
  },
  {
    id: 65,
    name: 'Two of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_2.webp',
    upright: '平衡优先、时间管理、适应',
    reversed: '不平衡、缺乏优先、过度承诺',
    keywords: ['平衡', '管理', '适应'],
  },
  {
    id: 66,
    name: 'Three of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_3.webp',
    upright: '团队合作、协作、技能',
    reversed: '缺乏合作、不专业、孤立',
    keywords: ['合作', '协作', '技能'],
  },
  {
    id: 67,
    name: 'Four of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_4.webp',
    upright: '控制、安全、节俭',
    reversed: '贪婪、物质主义、缺乏控制',
    keywords: ['控制', '安全', '节俭'],
  },
  {
    id: 68,
    name: 'Five of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_5.webp',
    upright: '物质困难、孤立、贫困',
    reversed: '恢复、寻求帮助、新开始',
    keywords: ['困难', '孤立', '贫困'],
  },
  {
    id: 69,
    name: 'Six of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_6.webp',
    upright: '慷慨、分享、给予',
    reversed: '自私、不平衡、债务',
    keywords: ['慷慨', '分享', '给予'],
  },
  {
    id: 70,
    name: 'Seven of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_7.webp',
    upright: '长期观点、评估、耐心',
    reversed: '缺乏进展、挫折、不耐烦',
    keywords: ['长期', '评估', '耐心'],
  },
  {
    id: 71,
    name: 'Eight of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_8.webp',
    upright: '技能发展、质量、专注',
    reversed: '缺乏质量、匆忙、缺乏技能',
    keywords: ['技能', '质量', '专注'],
  },
  {
    id: 72,
    name: 'Nine of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_9.webp',
    upright: '财务独立、自给自足、享受',
    reversed: '缺乏独立、过度依赖、财务困难',
    keywords: ['独立', '自给', '享受'],
  },
  {
    id: 73,
    name: 'Ten of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_10.webp',
    upright: '财富、家庭安全、长期成功',
    reversed: '财务损失、缺乏安全、家庭冲突',
    keywords: ['财富', '安全', '成功'],
  },
  {
    id: 74,
    name: 'Page of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_page.webp',
    upright: '新机会、学习、务实',
    reversed: '缺乏机会、不切实际、拖延',
    keywords: ['机会', '学习', '务实'],
  },
  {
    id: 75,
    name: 'Knight of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_knight.webp',
    upright: '效率、责任、方法',
    reversed: '懒惰、缺乏责任、拖延',
    keywords: ['效率', '责任', '方法'],
  },
  {
    id: 76,
    name: 'Queen of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_queen.webp',
    upright: '实用、关怀、财务安全',
    reversed: '自我中心、物质主义、缺乏关怀',
    keywords: ['实用', '关怀', '安全'],
  },
  {
    id: 77,
    name: 'King of Pentacles',
    image: '/assets/tarot-webp-optimized/minor_arcana_pentacles_king.webp',
    upright: '财务安全、实用、慷慨',
    reversed: '财务不稳定、贪婪、缺乏慷慨',
    keywords: ['安全', '实用', '慷慨'],
  },
];

// 工具函数：从旧 URL 中提取文件名作为 key
const getCardKeyFromUrl = (url: string) => {
  const match = url.match(/\/([^/]+)\.png$/);
  return match ? match[1] : null;
};

// 扩展的卡牌类型，包含预设的正逆位
interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// 洗牌函数：Fisher-Yates 洗牌算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 洗牌函数：打乱卡牌顺序并为每张牌分配正逆位
const shuffleCards = (cards: TarotCard[]): ShuffledTarotCard[] => {
  // 先为每张牌随机分配正逆位
  const cardsWithOrientation = cards.map(card => {
    let randomValue: number;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      randomValue = array[0] / (0xFFFFFFFF + 1);
    } else {
      randomValue = Math.random() + (Date.now() % 1000) / 10000;
      randomValue = randomValue % 1;
    }
    return {
      ...card,
      orientation: randomValue >= 0.5 ? 'upright' : 'reversed' as 'upright' | 'reversed',
    };
  });
  
  // 然后打乱顺序
  return shuffleArray(cardsWithOrientation);
};

// 获取当前季节名称
const getCurrentSeason = (isEn = false): string => {
  const month = new Date().getMonth() + 1;
  if (isEn) {
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  }
  if (month >= 3 && month <= 5) return '春季';
  if (month >= 6 && month <= 8) return '夏季';
  if (month >= 9 && month <= 11) return '秋季';
  return '冬季';
};

// 获取当前季度标识（用于存储和区分）
// 格式：'2025-Q1', '2025-Q2' 等
const getCurrentQuarter = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  let quarter: number;
  if (month >= 3 && month <= 5) {
    quarter = 2; // 春季 Q2
  } else if (month >= 6 && month <= 8) {
    quarter = 3; // 夏季 Q3
  } else if (month >= 9 && month <= 11) {
    quarter = 4; // 秋季 Q4
  } else {
    // 冬季 12, 1, 2月 - 归属到当前年份的Q1
    quarter = 1;
    // 如果是12月，归到下一年的Q1
    if (month === 12) {
      return `${year + 1}-Q1`;
    }
  }
  
  return `${year}-Q${quarter}`;
};

// 生成带季度后缀的唯一会话ID
const generateSessionId = (quarter: string): string => {
  // 使用时间戳 + 随机数生成唯一ID，带季度后缀
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${quarter}_${timestamp}_${random}`;
};

// 获取或创建当前季度的sessionId
const getUserSessionId = (quarter: string): string => {
  if (typeof window === 'undefined') return '';
  
  const storageKey = `user_session_id_${quarter}`; // 季度独立的 key
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = generateSessionId(quarter);
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

// 获取当前季度的推荐抽牌节气
const getSeasonalSolarTerm = (isEn = false): { term: string; date: string; description: string } => {
  const month = new Date().getMonth() + 1;

  if (isEn) {
    if (month >= 3 && month <= 5) return {
      term: 'Spring Equinox',
      date: 'March 20–21',
      description: 'On the Spring Equinox, yin and yang are in balance and all things awaken — the ideal moment to sense the energy of spring.',
    };
    if (month >= 6 && month <= 8) return {
      term: 'Summer Solstice',
      date: 'June 21–22',
      description: 'On the Summer Solstice, yang energy peaks and vitality reaches its height — the best time to explore your summer fortune.',
    };
    if (month >= 9 && month <= 11) return {
      term: 'Autumnal Equinox',
      date: 'September 22–23',
      description: 'On the Autumnal Equinox, day and night are equal — a time of harvest and reflection, perfect for reading the autumn ahead.',
    };
    return {
      term: 'Winter Solstice',
      date: 'December 21–22',
      description: 'On the Winter Solstice, yin peaks and yang is reborn — a key moment to glimpse the hidden currents of winter.',
    };
  }
  
  if (month >= 3 && month <= 5) {
    return {
      term: '春分',
      date: '3月20-21日',
      description: '春分之日，阴阳平衡，万物复苏，是感知春季能量的最佳时刻'
    };
  } else if (month >= 6 && month <= 8) {
    return {
      term: '夏至',
      date: '6月21-22日',
      description: '夏至之日，阳气最盛，生命力达到顶峰，最适合探索夏季运势'
    };
  } else if (month >= 9 && month <= 11) {
    return {
      term: '秋分',
      date: '9月22-23日',
      description: '秋分之日，昼夜均分，收获与沉淀并存，宜探知秋季走向'
    };
  } else {
    return {
      term: '冬至',
      date: '12月21-22日',
      description: '冬至之日，阴极阳生，新旧交替，是洞察冬季命运的关键节点'
    };
  }
};

// 获取当前季度的日期范围（用于显示）
const getCurrentQuarterDateRange = (isEn = false): string => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
  const febEnd = isLeapYear ? 29 : 28;

  if (isEn) {
    if (currentMonth >= 3 && currentMonth <= 5) return `March 1 – May 31, ${currentYear}`;
    if (currentMonth >= 6 && currentMonth <= 8) return `June 1 – August 31, ${currentYear}`;
    if (currentMonth >= 9 && currentMonth <= 11) return `September 1 – November 30, ${currentYear}`;
    if (currentMonth === 12) return `December 1, ${currentYear} – February ${febEnd}, ${currentYear + 1}`;
    return `December 1, ${currentYear - 1} – February ${febEnd}, ${currentYear}`;
  }

  // 春季 (3-5月)
  if (currentMonth >= 3 && currentMonth <= 5) {
    return `${currentYear}年3月1日至5月31日`;
  }
  // 夏季 (6-8月)
  else if (currentMonth >= 6 && currentMonth <= 8) {
    return `${currentYear}年6月1日至8月31日`;
  }
  // 秋季 (9-11月)
  else if (currentMonth >= 9 && currentMonth <= 11) {
    return `${currentYear}年9月1日至11月30日`;
  }
  // 冬季 (12, 1, 2月)
  else {
    // 如果是12月，显示当年12月到次年2月
    if (currentMonth === 12) {
      return `${currentYear}年12月1日至${currentYear + 1}年2月${febEnd}日`;
    }
    // 如果是1-2月，显示上一年12月到当年2月
    else {
      return `${currentYear - 1}年12月1日至${currentYear}年2月${febEnd}日`;
    }
  }
};

// 获取下个季度的日期范围
const getNextQuarterDateRange = (): { startMonth: number; startDay: number; endMonth: number; endDay: number; year: number } => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  
  // 春季 (3-5月) -> 下个季度是夏季 (6-8月)
  if (currentMonth >= 3 && currentMonth <= 5) {
    return {
      startMonth: 6,
      startDay: 1,
      endMonth: 8,
      endDay: 31,
      year: currentYear
    };
  }
  // 夏季 (6-8月) -> 下个季度是秋季 (9-11月)
  else if (currentMonth >= 6 && currentMonth <= 8) {
    return {
      startMonth: 9,
      startDay: 1,
      endMonth: 11,
      endDay: 30,
      year: currentYear
    };
  }
  // 秋季 (9-11月) -> 下个季度是冬季 (12-次年2月)
  else if (currentMonth >= 9 && currentMonth <= 11) {
    // 判断下一年是否为闰年
    const nextYear = currentYear + 1;
    const isLeapYear = (nextYear % 4 === 0 && nextYear % 100 !== 0) || (nextYear % 400 === 0);
    return {
      startMonth: 12,
      startDay: 1,
      endMonth: 2,
      endDay: isLeapYear ? 29 : 28,
      year: currentYear // 起始年份是当前年
    };
  }
  // 冬季 (12, 1, 2月) -> 下个季度是春季 (3-5月)
  else {
    // 如果现在是12月，下个季度在下一年
    // 如果现在是1-2月，下个季度在当前年
    const targetYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    return {
      startMonth: 3,
      startDay: 1,
      endMonth: 5,
      endDay: 31,
      year: targetYear
    };
  }
};

// 格式化下个季度的日期范围文字
const MONTH_NAMES_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const formatNextQuarterRange = (isEn = false): string => {
  const { startMonth, startDay, endMonth, endDay, year } = getNextQuarterDateRange();
  const currentYear = new Date().getFullYear();
  if (isEn) {
    if (startMonth === 12) {
      return `${MONTH_NAMES_EN[startMonth]} ${startDay}, ${year} – ${MONTH_NAMES_EN[endMonth]} ${endDay}, ${year + 1}`;
    }
    if (year > currentYear) {
      return `${MONTH_NAMES_EN[startMonth]} ${startDay} – ${MONTH_NAMES_EN[endMonth]} ${endDay}, ${year}`;
    }
    return `${MONTH_NAMES_EN[startMonth]} ${startDay} – ${MONTH_NAMES_EN[endMonth]} ${endDay}`;
  }
  if (startMonth === 12) {
    return `${year}年${startMonth}月${startDay}日至${year + 1}年${endMonth}月${endDay}日`;
  }
  if (year > currentYear) {
    return `${year}年${startMonth}月${startDay}日至${endMonth}月${endDay}日`;
  }
  return `${startMonth}月${startDay}日至${endMonth}月${endDay}日`;
};

// 四季牌阵单次结果接口
interface SeasonalResult {
  userId?: string | null;
  cards: Array<{
    id: number;
    name: string;
    image: string;
    upright: string | CardMeaning;
    reversed: string | CardMeaning;
    keywords?: string[];
    orientation: 'upright' | 'reversed';
  }>;
  reading?: any | null;  // AI 解读结果
  createdAt: number;
  quarter: string; // 季度标识，如 '2025-Q1'
}

// 按季度保存的历史记录接口
interface SeasonalRecords {
  [quarter: string]: SeasonalResult;
}

const buildSeasonalResultFromHistory = (
  record: any,
  quarter: string
): SeasonalResult | null => {
  const cards = Array.isArray(record?.cards) ? record.cards : null;
  if (!cards || cards.length !== 5) return null;

  return {
    userId: null,
    cards: cards.map((card: any) => ({
      ...card,
      orientation: card.orientation === 'reversed' ? 'reversed' : 'upright',
    })),
    reading: record?.reading_result,
    createdAt: record?.created_at ? new Date(record.created_at).getTime() : Date.now(),
    quarter,
  };
};

export default function SeasonalFortune() {
  const router = useRouter();
  const isEn = router.locale === 'en';

  const { loading: accessLoading, allowed } = useSpreadAccess({
    spreadKey: 'fortune-seasonal',
    redirectPath: '/',
  });

  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedResult, setSavedResult] = useState<SeasonalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(true);
  const [scrollValue, setScrollValue] = useState(0);
  const [sessionId, setSessionId] = useState<string>(''); // 用户唯一会话ID
  const [currentQuarter, setCurrentQuarter] = useState<string>(''); // 当前季度
  const [hasConfirmedOnce, setHasConfirmedOnce] = useState(false); // 是否已经确认过"只能抽一次"提醒
  
  // 五张卡槽的状态
  const [selectedCards, setSelectedCards] = useState<(ShuffledTarotCard | null)[]>([null, null, null, null, null]);
  const [isAnimating, setIsAnimating] = useState<boolean[]>([false, false, false, false, false]);
  
  // uiSlots: 用于页面卡背渲染的数组（长度固定为78，抽到的位置替换为null）
  const [uiSlots, setUiSlots] = useState<(ShuffledTarotCard | null)[]>([]);
  
  // 卡牌容器引用，用于滚动同步
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollValueRef = useRef(scrollValue);
  
  // 更新 scrollValueRef
  useEffect(() => {
    scrollValueRef.current = scrollValue;
  }, [scrollValue]);

  // 同步滚动条到容器滚动
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (maxScroll <= 0) return;
    
    const targetScroll = (scrollValue / 100) * maxScroll;
    const currentScroll = container.scrollLeft;
    
    if (Math.abs(targetScroll - currentScroll) > 1) {
      isScrollingRef.current = true;
      container.scrollLeft = targetScroll;
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);
    }
  }, [scrollValue]);

  // 监听容器滚动，同步到滚动条
  const handleScroll = () => {
    if (!containerRef.current || isScrollingRef.current) return;
    
    const container = containerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (maxScroll <= 0) return;
    
    const scrollPercent = (container.scrollLeft / maxScroll) * 100;
    
    if (Math.abs(scrollPercent - scrollValueRef.current) > 0.5) {
      setScrollValue(scrollPercent);
    }
  };

  // 初始化：检查是否已经抽过牌（按季度）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 获取当前季度
    const quarter = getCurrentQuarter();
    setCurrentQuarter(quarter);
    
    // 获取当前季度的sessionId
    const userSessionId = getUserSessionId(quarter);
    setSessionId(userSessionId);

    if (process.env.NODE_ENV === 'development') {
    }

    let cancelled = false;

    const initializeDeck = () => {
      if (cancelled) return;
      const updatedTarotCards = tarotCards.map(c => {
        const key = getCardKeyFromUrl(c.image);
        if (key && tarotImagesFlat[key as keyof typeof tarotImagesFlat]) {
          return { ...c, image: tarotImagesFlat[key as keyof typeof tarotImagesFlat] };
        }
        return c;
      });

      const shuffled = shuffleCards(updatedTarotCards);
      setUiSlots(shuffled);
    };

    const loadServerResult = async () => {
      const cacheIdentity = await getClientCacheIdentity();
      const storageKey = `seasonal_fortune_records_${cacheIdentity}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        try {
          const records = JSON.parse(stored) as SeasonalRecords;
          const currentQuarterResult = records[quarter];

          if (currentQuarterResult) {
            const validatedCards = currentQuarterResult.cards.map(card => {
              const key = getCardKeyFromUrl(card.image);
              const newImage = key && tarotImagesFlat[key as keyof typeof tarotImagesFlat];
              const baseCard = tarotCards.find(tc => tc.id === card.id);

              if (newImage && baseCard) {
                return {
                  ...baseCard,
                  image: newImage,
                  orientation: card.orientation,
                };
              }

              if (!card.image || !card.name || !card.upright || !card.reversed || !card.keywords) {
                if (baseCard) {
                  return {
                    id: baseCard.id,
                    name: baseCard.name,
                    image: baseCard.image,
                    upright: baseCard.upright,
                    reversed: baseCard.reversed,
                    keywords: baseCard.keywords,
                    orientation: card.orientation,
                  };
                }
              }
              return card;
            });

            setSavedResult({ ...currentQuarterResult, cards: validatedCards });
            setHasDrawn(true);
            setShowCards(false);
            setSelectedCards(validatedCards as ShuffledTarotCard[]);
            return;
          }
        } catch (e) {
          console.error('Failed to parse stored records:', e);
        }
      }

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `/api/periodic-reading/current?spreadKey=fortune-seasonal&tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || '')}`,
          { headers }
        );

        if (!response.ok || cancelled) {
          initializeDeck();
          return;
        }

        const data = await response.json();
        const serverResult = data?.existingRecord
          ? buildSeasonalResultFromHistory(data.existingRecord, quarter)
          : null;

        if (!serverResult || cancelled) {
          initializeDeck();
          return;
        }

        const existingRecords = stored ? JSON.parse(stored) as SeasonalRecords : {};
        existingRecords[quarter] = serverResult;
        localStorage.setItem(storageKey, JSON.stringify(existingRecords));

        setSavedResult(serverResult);
        setHasDrawn(true);
        setShowCards(false);
        setSelectedCards(serverResult.cards as ShuffledTarotCard[]);
      } catch (error) {
        console.error('Failed to load server seasonal result:', error);
        initializeDeck();
      }
    };

    loadServerResult();

    return () => {
      cancelled = true;
    };
  }, []);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;

    // 检查是否已经抽满5张
    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 5) return;

    // 🔒 如果是第一次抽牌，显示强提醒
    if (currentCardCount === 0 && !hasConfirmedOnce) {
      const confirmed = window.confirm(
        isEn
          ? `⚠️ Important Reminder ⚠️\n\nYou can draw the Seasonal Spread only once per quarter. Once you begin, this quarter's draw (${getCurrentQuarterDateRange(true)}) cannot be restarted.\n\nPlease make sure you are ready and in a quiet environment, focused on your question.\n\nAre you sure you want to start drawing?`
          : `⚠️ 重要提醒 ⚠️\n\n每个季度只能抽取一次四季牌阵，一旦开始抽牌，本季度（${getCurrentQuarterDateRange()}）将无法重新抽取。\n\n请确保你已做好准备，在安静的环境中专注于你的问题。\n\n确定要开始抽牌吗？`
      );
      
      if (!confirmed) {
        return; // 用户取消，不执行抽牌
      }
      
      setHasConfirmedOnce(true); // 标记已确认，后续抽牌不再提醒
    }

    // 获取 uiSlots[slotIndex] 作为视觉上的卡片（但实际牌面来自API）
    const visualCard = uiSlots[slotIndex];
    
    // 如果该位置已经是 null，则不执行任何操作
    if (!visualCard) return;

    // 找到第一个空槽位
    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

    // 确保 sessionId 已初始化（防御性编程）
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      console.warn('[抽牌] sessionId 为空，重新获取');
      const quarter = getCurrentQuarter();
      currentSessionId = getUserSessionId(quarter);
      setSessionId(currentSessionId);
      setCurrentQuarter(quarter);
    }

    // 计算 pick 值：剩余要抽的牌数（方案A：5, 4, 3, 2, 1）
    const pickValue = 5 - currentCardCount;

    if (process.env.NODE_ENV === 'development') {
    }

    setIsLoading(true);
    setError(null);

    try {
      // 调用后端 API 获取真实的塔罗牌，传递sessionId
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/seasonal-draw?slot=${emptySlotIndex + 1}&pick=${pickValue}&sessionId=${currentSessionId}`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(isEn ? 'Draw failed. Please try again.' : '抽牌失败，请重试');
      }

      const data = await response.json();
      
      // 从返回的数据中构造卡牌对象
      const drawnCard: ShuffledTarotCard = {
        id: data.card.id,
        name: data.card.name,
        image: data.card.imageUrl,
        upright: data.card.upright,
        reversed: data.card.reversed,
        keywords: data.card.keywords,
        orientation: data.card.orientation,
      };

      
      // 更新selectedCards
      const newSelectedCards = [...selectedCards];
      newSelectedCards[emptySlotIndex] = drawnCard;
      setSelectedCards(newSelectedCards);
      
      // 更新动画状态
      const newIsAnimating = [...isAnimating];
      newIsAnimating[emptySlotIndex] = true;
      setIsAnimating(newIsAnimating);
      
      // 将 uiSlots[slotIndex] 设置为 null（视觉上移除这张卡）
      setUiSlots(prev => 
        prev.map((c, i) => (i === slotIndex ? null : c))
      );

      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 150));
      newIsAnimating[emptySlotIndex] = false;
      setIsAnimating([...newIsAnimating]);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsLoading(false);

      // 如果抽满5张，保存结果（按季度）
      const updatedCardCount = newSelectedCards.filter(c => c !== null).length;
      if (updatedCardCount === 5 && typeof window !== 'undefined') {
        const cardsToSave = newSelectedCards.filter(c => c !== null) as ShuffledTarotCard[];

        const result: SeasonalResult = {
          userId: null,
          cards: cardsToSave,
          reading: null,  // 初始为 null，将在 result 页面首次访问时获取并保存
          createdAt: Date.now(),
          quarter: currentQuarter,
        };

        // 读取现有的所有季度记录
        const cacheIdentity = await getClientCacheIdentity();
        const storageKey = `seasonal_fortune_records_${cacheIdentity}`;
        let allRecords: SeasonalRecords = {};
        
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            allRecords = JSON.parse(stored) as SeasonalRecords;
          }
        } catch (e) {
          console.error('Failed to parse existing records:', e);
        }
        
        // 保存当前季度的结果
        allRecords[currentQuarter] = result;
        localStorage.setItem(storageKey, JSON.stringify(allRecords));
        
        setSavedResult(result);
        setHasDrawn(true);
        setShowCards(false);
        
        if (process.env.NODE_ENV === 'development') {
        }
      }
    } catch (err) {
      console.error('抽牌错误:', err);
      setError(err instanceof Error ? err.message : (isEn ? 'Draw failed. Please try again later.' : '抽牌失败，请稍后重试'));
      setIsLoading(false);
    }
  };

  const handleViewResult = () => {
    router.push('/fortune/seasonal/result');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // 检查是否可以开始测算（已抽满5张）
  const canStartReading = selectedCards.filter(c => c !== null).length === 5;

  if (accessLoading || !allowed) {
    return (
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white flex items-center justify-center" style={{ backgroundColor: '#191022' }}>
          <div className="text-white/60">{isEn ? 'Loading...' : '加载中...'}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{isEn ? `${getCurrentSeason(true)} Fortune - FateAura` : `${getCurrentSeason()}运势 - FateAura`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-flow {
            animation: flow 20s ease-in-out infinite;
          }
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 5px 0px rgba(127, 19, 236, 0.4), 0 0 2px 0px rgba(127, 19, 236, 0.2);
            }
            50% {
              box-shadow: 0 0 10px 2px rgba(127, 19, 236, 0.6), 0 0 4px 1px rgba(127, 19, 236, 0.4);
            }
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
          }
          html.dark,
          html.dark body {
            background-color: #191022;
          }
        ` }} />
        
      </Head>
      
      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white">
          {/* 头部 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">{isEn ? 'Back' : '返回首页'}</span>
            </button>
            <div className="flex items-center gap-4 text-white">
              <img
                    src="/favicon.png"
                    alt=""
                    aria-hidden="true"
                    className="size-8 rounded-md object-cover shrink-0"
                  />
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">FateAura</h2>
            </div>
            <div className="w-20"></div>
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
            <div className="mx-auto max-w-7xl">
              {/* 标题区域 */}
              <div className="text-center mb-12">
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">
                  {isEn ? 'Seasonal Spread' : '四季牌阵'}
                </p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  {hasDrawn
                    ? isEn ? `${getCurrentSeason(true)} Fortune Drawn` : `${getCurrentSeason()}运势已抽取`
                    : isEn ? 'Draw Five Tarot Cards' : '抽取五张塔罗牌'}
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto mb-6">
                  {hasDrawn
                    ? isEn
                      ? `You have drawn your ${getCurrentSeason(true)} fortune. Click below to view your reading.`
                      : `你已抽取${getCurrentSeason()}运势，点击下方按钮查看详细解析。`
                    : isEn
                      ? `Explore the energy of action, emotion, mind, career, and overall fortune for ${getCurrentSeason(true)}.`
                      : `探索你在${getCurrentSeason()}这三个月的行动力、情感、思维、事业与整体运势走向。`}
                </p>
                
                {/* 节气提示和重要提醒 */}
                {!hasDrawn ? (
                  <>
                    {/* 重要提醒 */}
                    <div className="max-w-3xl mx-auto mt-6 p-5 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-2 border-red-500/30">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div className="flex-1">
                          <p className="text-red-200 font-bold text-base mb-2">
                            {isEn
                              ? `Important: This quarter (${getCurrentQuarterDateRange(true)}) you can only draw once`
                              : `重要提醒：本季度（${getCurrentQuarterDateRange()}）只能抽一次`}
                          </p>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {isEn
                              ? "The Seasonal Spread can only be drawn once per quarter. Once you begin, you won't be able to restart this draw. Please find a quiet environment and focus on your question before drawing. The system will ask for your confirmation once more before you begin."
                              : '四季牌阵每个季度仅能抽取一次，一旦开始抽牌即无法重来。请在安静的环境中，专注于你想要了解的问题后再开始抽牌。抽牌前系统会再次确认。'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 节气建议 */}
                    <div className="max-w-3xl mx-auto mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
                      <p className="text-white/60 text-sm leading-relaxed">
                        {isEn ? (
                          <>
                            <span className="text-primary font-semibold">✨ Reading Tip: </span>
                            You may draw anytime this quarter, but we recommend drawing around the{' '}
                            <span className="text-white font-semibold mx-1">{getSeasonalSolarTerm(true).term}</span>
                            ({getSeasonalSolarTerm(true).date}). {getSeasonalSolarTerm(true).description}
                          </>
                        ) : (
                          <>
                            <span className="text-primary font-semibold">✨ 占卜建议：</span>
                            本季度内任何时间均可抽牌，但我们建议在
                            <span className="text-white font-semibold mx-1">{getSeasonalSolarTerm().term}</span>
                            （{getSeasonalSolarTerm().date}）抽取，
                            {getSeasonalSolarTerm().description}。
                          </>
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm">
                      {isEn
                        ? `🔒 This quarter's spread has been drawn. A new draw opens next quarter (${formatNextQuarterRange(true)}).`
                        : `🔒 本季度牌阵已抽取，下个季度 ${formatNextQuarterRange()} 可抽取新的牌阵`}
                    </p>
                  </div>
                )}
              </div>

              {/* 卡片选择区域 */}
              <AnimatePresence>
                {showCards && !hasDrawn && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {error && (
                      <div className="mb-8 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-center">
                        {error}
                      </div>
                    )}
                    
                    {/* 78张卡牌横向滚动区域 */}
                    <div className="card-container-wrapper w-full mb-4">
                      <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="card-container flex flex-row overflow-x-scroll overflow-y-hidden pb-2 px-2"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      >
                        {uiSlots.map((card, index) => 
                          card ? (
                            <CardItem
                              key={card.id}
                              card={card}
                              index={index}
                              onClick={drawCard}
                              isDisabled={isLoading}
                              isSelected={false}
                            />
                          ) : (
                            <EmptySlot key={`empty-${index}`} index={index} />
                          )
                        )}
                      </div>
                      
                      <style jsx>{`
                        .card-container::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                    </div>

                    {/* 自定义滚动条 */}
                    <ScrollBar
                      value={scrollValue}
                      onChange={setScrollValue}
                      disabled={isLoading}
                    />

                    {/* 五张卡槽区域 */}
                    <FiveCardSlots
                      cards={selectedCards}
                      isAnimating={isAnimating}
                      showLoadingText={true}
                      isEn={isEn}
                    />

                    {selectedCards.filter(c => c !== null).length < 5 && (
                      <div className="text-center text-white/50 text-sm mt-6">
                        <p>{isEn
                        ? `💫 Draw five cards one by one (${selectedCards.filter(c => c !== null).length}/5)`
                        : `💫 请依次抽取五张卡牌（${selectedCards.filter(c => c !== null).length}/5）`}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 已抽过的情况 */}
              {hasDrawn && savedResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-5xl mx-auto"
                >
                  <FiveCardSlots
                    cards={selectedCards}
                    isAnimating={[false, false, false, false, false]}
                    showLoadingText={false}
                    forceFlipped={true}
                    isEn={isEn}
                  />

                  <div className="text-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleViewResult}
                      className="px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                    >
                      {isEn ? `View ${getCurrentSeason(true)} Reading` : `查看${getCurrentSeason()}解析`}
                    </motion.button>
                  </div>

                  <div className="text-center text-white/50 text-sm mt-6">
                    <p>{isEn ? `✨ Your ${getCurrentSeason(true)} spread has been saved` : `✨ 已保存你的${getCurrentSeason()}牌阵`}</p>
                  </div>
                </motion.div>
              )}

              {/* 底部按钮 - 未抽过且已抽满5张 */}
              {!hasDrawn && canStartReading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewResult}
                    className="px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                  >
                    {isEn ? 'Start Reading' : '开始测算'}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


