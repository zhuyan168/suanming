import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { CircleDollarSign, GraduationCap, Heart, Menu, RefreshCw, Sparkles, User, Wand2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGuestTrial } from '../context/GuestTrialContext';

// 完整的78张塔罗牌数据
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

const uprightTemplates = [
  (card, question) => `关于“${question}”，${card.name} 正位提醒你：${card.upright}。保持开阔的心，主动迎接机会。`,
  (card, question) => `你心中的问题“${question}”得到这张牌的回应。正位的 ${card.name} 鼓励你踏实运用资源，让愿望逐步显化。`,
  (card, question) => `${card.name} 在正位出现，象征你的直觉与理性保持一致。相信你对“${question}”的判断，并勇敢实践。`,
  (card, question) => `正位的 ${card.name} 表示：${card.upright}。在处理“${question}”时，不妨给自己更多信任与承诺。`,
];

const reversedTemplates = [
  (card, question) => `面对“${question}”，${card.name} 逆位提示你留意：${card.reversed}。请放慢脚步，先厘清内心真正的需求。`,
  (card, question) => `当 ${card.name} 以逆位回应“${question}”时，意味着目前能量不稳定，需要你重新调整节奏与策略。`,
  (card, question) => `逆位的 ${card.name} 暗示：${card.reversed}。处理“${question}”时，可以先整理情绪，等待更明确的讯号。`,
  (card, question) => `关于“${question}”，这张牌的逆位提醒你先修复根基，再作决定，这样才能避免重复旧的模式。`,
];

const cardBackWords = ['专注', '能量', '命运', '直觉', '旅程', '灵感'];

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

const generateInterpretation = (card, orientation, question) => {
  const normalizedQuestion = question.trim();
  const displayQuestion = normalizedQuestion.length > 0 ? normalizedQuestion : '这个主题';
  const templates = orientation === 'upright' ? uprightTemplates : reversedTemplates;
  const template = pickRandom(templates);
  return template(card, displayQuestion);
};

const FeatureToast = ({ visible, title, message, onClose }) => {
  if (!title && !message) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] w-72 rounded-2xl border border-white/10 bg-background-dark/90 p-4 text-white shadow-glow backdrop-blur transition-all duration-300 ${visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <div className="flex items-start gap-3">
        <Wand2 className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-xs text-white/70 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const TarotReadingModal = ({ isOpen, onRequestClose }) => {
  const router = useRouter();
  const isEn = router.locale === 'en';
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const closeTimerRef = useRef(null);
  const questionInputRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = setTimeout(() => {
        setQuestion('');
        setError(null);
      }, 320);
      return () => {
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }
      };
    }

    if (!wasOpenRef.current) {
      setQuestion('');
      setError(null);
    }
    wasOpenRef.current = true;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    // 聚焦输入框
    if (questionInputRef.current) {
      questionInputRef.current.focus();
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }
    if (!isOpen) {
      return undefined;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleClose = () => {
    onRequestClose();
  };

  const handleDrawCard = async () => {
    setError(null);
    
    // 保存用户问题到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yesno_tarot_draw_v1');
      localStorage.setItem('yesno_tarot_question_v1', question.trim());
    }
    
    // 跳转到抽牌页
    router.push('/fortune/yesno-tarot/draw');
  };

  const isDrawDisabled = isLoading;

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[60] flex items-start justify-center px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 overflow-y-auto bg-gradient-to-br from-background-dark/95 via-background-dark/90 to-black/90 backdrop-blur-md ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{ paddingBottom: '10rem' }}
      onClick={handleClose}
    >
      
      <section
        className={`relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 text-white shadow-glow transition-all duration-300 my-auto ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label={isEn ? 'Close Yes/No Tarot panel' : '关闭是否塔罗面板'}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition hover:border-white/20 hover:text-white"
          type="button"
          onClick={handleClose}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <header className="mb-8 flex flex-col gap-3 text-center">
          <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-2">{isEn ? 'Yes/No Tarot' : '是否塔罗'}</p>
          <h2 className="text-3xl font-black leading-tight tracking-tight">
            {isEn ? 'Ask Quietly, Draw Your Guidance' : '静心提问，抽取你的指引'}
          </h2>
        </header>

        <div className="flex flex-col gap-6">
          {/* 占卜引导提示 */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white/90 leading-relaxed">
                <span className="font-semibold text-primary">{isEn ? 'Reading tip: ' : '占卜建议：'}</span>
                {isEn
                  ? 'For the clearest guidance, ask the same question only once. Repeating the same reading can make the answer feel less clear.'
                  : '为获得最准确的指引，同一个问题建议只问一次。重复占卜可能会让能量混乱，影响结果的准确性。'}
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                <span className="font-semibold text-primary">{isEn ? 'Question tip: ' : '提问技巧：'}</span>
                {isEn
                  ? 'Enter a question that can be answered with Yes or No, such as: Should I accept this new job offer? Will this relationship move forward?'
                  : '请输入可以用 Yes 或 No 回答的问题，例如：我应该接受这个新的工作机会吗？我和他/她的关系会有进一步发展吗？'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-3" htmlFor="tarot-question">
              {isEn ? 'Your Question (Optional)' : '你的问题（可选）'}
            </label>
            <textarea
              id="tarot-question"
              ref={questionInputRef}
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={4}
              maxLength={160}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={isEn ? 'Hold your question in mind, take three deep breaths, then begin your reading...' : '请在心中默念你的问题，深呼吸三次后开始抽牌。也可以在此输入问题获得更详细的解读。'}
            ></textarea>
            <div className="mt-2 flex items-center justify-between text-xs text-white/50">
              <span>{isEn ? 'Up to 160 characters' : '最多 160 字'}</span>
              <span>{question.length}/160</span>
            </div>
            {error ? <p className="mt-2 text-sm text-orange-300">{error}</p> : null}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleDrawCard}
              disabled={isDrawDisabled}
              className={`flex items-center gap-2 rounded-full px-8 py-3 text-base font-semibold transition ${isDrawDisabled ? 'cursor-not-allowed bg-white/10 text-white/30' : 'bg-primary text-white shadow-glow hover:bg-primary/90 hover:scale-105'}`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
                  {isEn ? 'Preparing...' : '准备中...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  {isEn ? 'Draw Card' : '抽牌'}
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const isEn = router.locale === 'en';

  const switchLocale = () => {
    const next = router.locale === 'en' ? 'zh' : 'en';
    router.push(router.asPath, router.asPath, { locale: next });
  };

  const [isTarotOpen, setIsTarotOpen] = useState(false);
  const [toast, setToast] = useState({ title: '', message: '' });
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [startTrialErrorReason, setStartTrialErrorReason] = useState(null);

  const {
    isActive: isTrialActive,
    hoursLeft: trialHoursLeft,
    totalRemaining: trialTotalRemaining,
    isLoading: isTrialLoading,
    startTrial,
  } = useGuestTrial();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const displayEmail = (email) => {
    if (!email) return '';
    if (email.length <= 20) return email;
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const truncated = local.length > 8 ? local.slice(0, 8) + '…' : local;
    return `${truncated}@${domain}`;
  };

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  }, []);

  // 检测URL参数，如果存在 tarot=true 则自动打开弹窗
  useEffect(() => {
    if (router.isReady && router.query.tarot === 'true') {
      setIsTarotOpen(true);
      // 清除URL参数，避免刷新时重复打开
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.isReady, router.query.tarot]);

  const showToast = (title, message) => {
    setToast({ title, message });
    setIsToastVisible(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 3600);
  };

  const handleCloseToast = () => {
    setIsToastVisible(false);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  };

  const handleTarotTrigger = () => {
    setIsTarotOpen(true);
  };

  const scrollToReadingOptions = () => {
    document.getElementById('reading-options')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeroCtaClick = async () => {
    setStartTrialErrorReason(null);
    if (user) {
      scrollToReadingOptions();
      return;
    }
    if (isTrialActive) {
      if (trialTotalRemaining <= 0) {
        setStartTrialErrorReason('trial_limit_exceeded');
        return;
      }
      scrollToReadingOptions();
      return;
    }
    const result = await startTrial();
    if (result.success) {
      scrollToReadingOptions();
    } else {
      setStartTrialErrorReason(result.reason);
    }
  };

  const handleTarotClose = () => {
    setIsTarotOpen(false);
  };

  const handleFeatureComingSoon = (title) => {
    showToast(title, '该功能正在开发中，敬请期待。');
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  const handleFortuneMessage = (title) => {
    showToast(title, '我们会根据你的反馈优先开放此项占卜服务。');
  };

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="dark">
        <div className="font-display bg-background-light dark:bg-background-dark">
          <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-white">
                  <img
                    src="/favicon.png"
                    alt=""
                    aria-hidden="true"
                    className="size-8 rounded-md object-cover shrink-0"
                  />
                  <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">FateAura</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-8">
                  <div className="flex items-center gap-9">
                    <Link className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="/">
                      {t('nav.home')}
                    </Link>
                    <Link className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="/about">
                      {t('nav.about')}
                    </Link>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={switchLocale}
                      className="flex items-center justify-center h-8 px-3 rounded-md border border-white/20 text-white/70 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                    >
                      {t('lang.switch')}
                    </button>
                    {authLoading ? (
                      <div className="h-10 w-20" />
                    ) : user ? (
                      <>
                        <Link
                          href="/account"
                          className="flex items-center gap-1.5 text-white/70 text-sm font-medium hover:text-primary transition-colors"
                        >
                          <User className="h-4 w-4" aria-hidden="true" />
                          {t('nav.account')}
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors"
                        >
                          <span className="truncate">{t('nav.signout')}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/register"
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                        >
                          <span className="truncate">{t('nav.register')}</span>
                        </Link>
                        <Link
                          href="/login"
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors"
                        >
                          <span className="truncate">{t('nav.login')}</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-main-nav"
                  aria-label={t('nav.openMenu')}
                  className="md:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </header>
              {mobileNavOpen && (
                <div className="fixed inset-0 z-[60] md:hidden" role="presentation">
                  <button
                      type="button"
                      aria-label={t('nav.closeMenu')}
                      className="absolute inset-0 bg-black/60"
                      onClick={closeMobileNav}
                    />
                  <nav
                    id="mobile-main-nav"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('nav.menu')}
                    className="absolute top-0 right-0 bottom-0 flex w-[min(100vw,18rem)] flex-col border-l border-white/10 bg-background-dark/98 backdrop-blur-md shadow-xl"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
                      <span className="text-white text-sm font-semibold tracking-wide">{t('nav.menu')}</span>
                      <button
                        type="button"
                        onClick={closeMobileNav}
                        aria-label={t('nav.closeMenu')}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                      >
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 p-4 pt-3">
                      <Link
                        href="/"
                        onClick={closeMobileNav}
                        className="rounded-lg px-3 py-3 text-white text-base font-medium hover:bg-white/10 transition-colors"
                      >
                        {t('nav.home')}
                      </Link>
                      <Link
                        href="/about"
                        onClick={closeMobileNav}
                        className="rounded-lg px-3 py-3 text-white/70 text-base font-medium hover:bg-white/10 hover:text-primary transition-colors"
                      >
                        {t('nav.about')}
                      </Link>
                    </div>
                    <div className="mx-4 h-px bg-white/10 shrink-0" />
                    <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1 min-h-0">
                      {authLoading ? (
                        <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
                      ) : user ? (
                        <>
                          {user.email && (
                            <p className="px-1 text-xs text-white/50 truncate" title={user.email}>
                              {displayEmail(user.email)}
                            </p>
                          )}
                          <Link
                            href="/account"
                            onClick={closeMobileNav}
                            className="flex items-center gap-2 rounded-lg px-3 py-3 text-white/90 text-base font-medium hover:bg-white/10 hover:text-primary transition-colors"
                          >
                            <User className="h-5 w-5" aria-hidden="true" />
                            {t('nav.account')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              closeMobileNav();
                              handleSignOut();
                            }}
                            className="flex w-full cursor-pointer items-center justify-center rounded-lg py-3 px-4 bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
                          >
                            {t('nav.signout')}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/register"
                            onClick={closeMobileNav}
                            className="flex w-full cursor-pointer items-center justify-center rounded-lg py-3 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                          >
                            {t('nav.register')}
                          </Link>
                          <Link
                            href="/login"
                            onClick={closeMobileNav}
                            className="flex w-full cursor-pointer items-center justify-center rounded-lg py-3 px-4 bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
                          >
                            {t('nav.login')}
                          </Link>
                        </>
                      )}
                    </div>
                    <div className="mx-4 h-px bg-white/10 shrink-0" />
                    <div className="p-4">
                      <button
                        type="button"
                        onClick={() => { closeMobileNav(); switchLocale(); }}
                        className="flex w-full items-center justify-center h-10 rounded-md border border-white/20 text-white/70 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                      >
                        {t('lang.switch')}
                      </button>
                    </div>
                  </nav>
                </div>
              )}
              <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
                <div className="mx-auto max-w-6xl">
                  <section className="mb-16">
                    <div
                      className="relative overflow-hidden flex min-h-[380px] flex-col gap-6 rounded-xl bg-cover bg-center bg-no-repeat items-center justify-center p-4 text-center"
                      data-alt="A mystical, abstract background with swirling purple and blue cosmic nebulae and faint star patterns."
                    >
                      <Image
                        src="/home-hero.webp"
                        alt=""
                        fill
                        preload
                        sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) calc(100vw - 128px), 1152px"
                        quality={70}
                        className="object-cover object-center opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(25,16,34,0.4)] to-[rgba(25,16,34,0.7)]"></div>
                      <div className="relative z-10 flex flex-col gap-6 items-center">
                        <div className="flex flex-col gap-2">
                          <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                            {t('hero.title')}
                          </h1>
                          <h2 className="text-white/80 text-base sm:text-lg font-normal leading-normal max-w-2xl mx-auto">
                            {t('hero.subtitle')}
                          </h2>
                        </div>
                        {/* Hero CTA: 已登录 → Begin Reading；未登录无trial → Try Free for 72 Hours；active trial → Continue Free Trial */}
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleHeroCtaClick}
                            disabled={isTrialLoading}
                            className="flex min-w-[220px] sm:min-w-[280px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-10 sm:px-14 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {isTrialLoading ? (
                              <span className="truncate">{isEn ? 'Starting...' : '正在开启...'}</span>
                            ) : user ? (
                              <span className="truncate">{t('hero.cta')}</span>
                            ) : isTrialActive ? (
                              <span className="truncate">{isEn ? 'Continue Free Trial' : '继续免费试用'}</span>
                            ) : (
                              <span className="truncate">{isEn ? 'Try Free for 72 Hours' : '免费试用 72 小时'}</span>
                            )}
                          </button>

                          {/* 按钮下方小字 */}
                          {!user && !isTrialLoading && (
                            <p className="text-white/55 text-xs leading-tight">
                              {isTrialActive
                                ? (isEn
                                    ? `Your trial ends in ${trialHoursLeft} hour${trialHoursLeft !== 1 ? 's' : ''}`
                                    : `免费试用还剩 ${trialHoursLeft} 小时`)
                                : (isEn ? 'No login required' : '无需登录')}
                            </p>
                          )}

                          {/* startTrial 失败时的轻量提示 */}
                          {startTrialErrorReason && (
                            <p className="text-red-400/90 text-xs leading-tight">
                              {startTrialErrorReason === 'trial_expired' || startTrialErrorReason === 'trial_limit_exceeded'
                                ? (isEn
                                    ? "You've used all free trial readings. Sign up to continue and save your readings."
                                    : '您的 72 小时免费试用次数已用完。注册账号后可继续使用并保存解读记录。')
                                : (isEn ? 'Unable to start your free trial. Please try again.' : '暂时无法开启免费试用，请稍后再试。')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                  <div id="reading-options" className="grid grid-cols-1 lg:grid-cols-3 gap-8 @container">
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow">
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-xl font-bold">{t('section.general.title')}</p>
                          <p className="text-white/80 text-base font-normal leading-normal">
                            {t('section.general.desc')}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 mt-auto">
                          {/* 通用牌阵入口 */}
                          <button
                            type="button"
                            onClick={() => router.push('/reading/general')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">{t('section.general.spreads')}</span>
                          </button>
                          {/* 同样原因，绑定 onClick 以触发 React 弹窗 */}
                          <button
                            type="button"
                            onClick={handleTarotTrigger}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">{t('section.general.yesno')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/divination/jiaobei')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">{t('section.general.oracle')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow">
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-xl font-bold">{t('section.fortune.title')}</p>
                          <p className="text-white/80 text-base font-normal leading-normal">
                            {t('section.fortune.desc')}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <button
                            type="button"
                            onClick={() => router.push('/fortune/daily')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">{t('section.fortune.daily')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/fortune/monthly')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">{t('section.fortune.monthly')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/fortune/seasonal')}
                            className="relative flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors group"
                          >
                            <span className="truncate">{t('section.fortune.seasonal')}</span>
                            {/* 会员角标 - 镂空五角星 */}
                            <svg 
                              className="absolute top-1 right-1 w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(127,19,236,0.8)]" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-black/90 text-white/90 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
                              {t('section.fortune.membersOnly')}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/fortune/annual/year-ahead')}
                            className="relative flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors group"
                          >
                            <span className="truncate">{t('section.fortune.annual')}</span>
                            {/* 会员角标 - 镂空五角星 */}
                            <svg 
                              className="absolute top-1 right-1 w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(127,19,236,0.8)]" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-black/90 text-white/90 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
                              {t('section.fortune.membersOnly')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow">
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-xl font-bold">{t('section.themed.title')}</p>
                          <p className="text-white/80 text-base font-normal leading-normal">
                            {t('section.themed.desc')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-4 mt-auto">
                          <button
                            type="button"
                            onClick={() => router.push('/themed-readings/love')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <Heart className="h-5 w-5" aria-hidden="true" />
                            <span className="truncate">{t('section.themed.love')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/themed-readings/career-study')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <GraduationCap className="h-5 w-5" aria-hidden="true" />
                            <span className="truncate">{t('section.themed.career')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/themed-readings/wealth')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
                            <span className="truncate">{t('section.themed.wealth')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 治愈系引导文字 */}
                  <div className="mt-20 mb-12 flex justify-center">
                    <div className="relative flex items-center justify-center gap-3 sm:gap-4 px-4">
                      {/* 背景光晕效果 - 更柔和的中心发光 */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
                      
                      {/* 左侧装饰星 - 带旋转动画 */}
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary/80 animate-pulse" style={{ animationDuration: '3s' }} aria-hidden="true" />
                      
                      {/* 文字 */}
                      <p className="relative z-10 text-white/90 text-sm sm:text-lg font-medium text-center tracking-wide leading-relaxed animate-text-glow">
                        {t('tagline')}
                      </p>
                      
                      {/* 右侧装饰星 - 带旋转动画 */}
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary/80 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </main>
              <footer className="border-t border-solid border-white/10 mt-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-8 md:px-16 lg:px-24 py-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-white/70">
                      <img
                        src="/favicon.png"
                        alt=""
                        aria-hidden="true"
                        className="size-6 rounded-md object-cover shrink-0"
                      />
                      <span className="text-sm text-center md:text-left">{t('footer.copyright')}</span>
                    </div>
                    <nav
                      className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-sm"
                      aria-label={t('footer.nav')}
                    >
                      <Link
                        href="/about"
                        className="text-white/70 font-medium leading-normal hover:text-primary transition-colors"
                      >
                        {t('footer.about')}
                      </Link>
                      <Link
                        href="/privacy"
                        className="text-white/70 font-medium leading-normal hover:text-primary transition-colors"
                      >
                        {t('footer.privacy')}
                      </Link>
                      <Link
                        href="/membership"
                        className="text-white/70 font-medium leading-normal hover:text-primary transition-colors"
                      >
                        {isEn ? 'Pricing' : '会员价格'}
                      </Link>
                      <Link
                        href="/terms"
                        className="text-white/70 font-medium leading-normal hover:text-primary transition-colors"
                      >
                        {t('footer.terms')}
                      </Link>
                      <Link
                        href="/contact"
                        className="text-white/70 font-medium leading-normal hover:text-primary transition-colors"
                      >
                        {t('footer.contact')}
                      </Link>
                    </nav>
                  </div>
                </div>
              </footer>
            </div>
          </div>
          {/* 原 HTML 依赖外挂脚本通过 #tarot-reading-root 注入组件，这里直接渲染 React 组件以恢复功能 */}
          <TarotReadingModal isOpen={isTarotOpen} onRequestClose={handleTarotClose} />
        </div>
      </div>
      <FeatureToast visible={isToastVisible} title={toast.title} message={toast.message} onClose={handleCloseToast} />
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
