import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';

// 完整的78张塔罗牌数据
const tarotCards = [
  // ========== 大阿尔卡那 22张 ==========
  {
    id: 0,
    name: '0. The Fool',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fool.png',
    upright: '新的开始、信任直觉、勇敢冒险',
    reversed: '冲动行事、犹豫不决、方向不明',
    keywords: ['纯真', '自由', '机会'],
  },
  {
    id: 1,
    name: 'I. The Magician',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_magician.png',
    upright: '资源整合、贯彻执行、影响力',
    reversed: '分散注意、欺骗、缺乏计划',
    keywords: ['行动', '意志', '显化'],
  },
  {
    id: 2,
    name: 'II. The High Priestess',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_priestess.png',
    upright: '内在智慧、直觉洞察、保持沉静',
    reversed: '忽略直觉、情绪混乱、资讯不明',
    keywords: ['直觉', '秘密', '平衡'],
  },
  {
    id: 3,
    name: 'III. The Empress',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_empress.png',
    upright: '丰盛富足、创造力、母性关怀',
    reversed: '过度依赖、创造力受阻、缺乏滋养',
    keywords: ['丰盛', '创造', '滋养'],
  },
  {
    id: 4,
    name: 'IV. The Emperor',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_emperor.png',
    upright: '权威、秩序、稳定结构',
    reversed: '专制、僵化、缺乏灵活性',
    keywords: ['权威', '秩序', '稳定'],
  },
  {
    id: 5,
    name: 'V. The Hierophant',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hierophant.png',
    upright: '传统智慧、精神指引、遵循规范',
    reversed: '教条主义、反叛、脱离传统',
    keywords: ['传统', '指引', '规范'],
  },
  {
    id: 6,
    name: 'VI. The Lovers',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_lovers.png',
    upright: '真诚连接、重要抉择、价值一致',
    reversed: '矛盾、分歧、失去平衡',
    keywords: ['关系', '信任', '选择'],
  },
  {
    id: 7,
    name: 'VII. The Chariot',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_chariot.png',
    upright: '意志坚定、目标导向、克服障碍',
    reversed: '缺乏方向、失控、内在冲突',
    keywords: ['意志', '目标', '胜利'],
  },
  {
    id: 8,
    name: 'VIII. Strength',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_strength.png',
    upright: '内在力量、耐心、温柔控制',
    reversed: '软弱、缺乏自信、情绪失控',
    keywords: ['力量', '耐心', '控制'],
  },
  {
    id: 9,
    name: 'IX. The Hermit',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hermit.png',
    upright: '内省、寻求真理、独处思考',
    reversed: '孤立、逃避、迷失方向',
    keywords: ['内省', '真理', '指引'],
  },
  {
    id: 10,
    name: 'X. Wheel of Fortune',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fortune.png',
    upright: '命运转折、周期循环、新的机遇',
    reversed: '坏运气、抗拒变化、停滞不前',
    keywords: ['命运', '循环', '变化'],
  },
  {
    id: 11,
    name: 'XI. Justice',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_justice.png',
    upright: '公平正义、平衡、承担责任',
    reversed: '不公、偏见、逃避责任',
    keywords: ['正义', '平衡', '责任'],
  },
  {
    id: 12,
    name: 'XII. The Hanged Man',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hanged.png',
    upright: '等待、牺牲、新的视角',
    reversed: '拖延、抗拒牺牲、停滞',
    keywords: ['等待', '牺牲', '视角'],
  },
  {
    id: 13,
    name: 'XIII. Death',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_death.png',
    upright: '结束与重生、转变、放下过去',
    reversed: '抗拒改变、停滞、恐惧转变',
    keywords: ['转变', '结束', '重生'],
  },
  {
    id: 14,
    name: 'XIV. Temperance',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_temperance.png',
    upright: '平衡调和、耐心、适度',
    reversed: '失衡、过度、缺乏耐心',
    keywords: ['平衡', '调和', '耐心'],
  },
  {
    id: 15,
    name: 'XV. The Devil',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_devil.png',
    upright: '束缚、欲望、物质依赖',
    reversed: '解脱、打破束缚、重获自由',
    keywords: ['束缚', '欲望', '依赖'],
  },
  {
    id: 16,
    name: 'XVI. The Tower',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_tower.png',
    upright: '突发变化、觉醒、旧结构崩塌',
    reversed: '抗拒改变、延迟崩解、局部冲击',
    keywords: ['变革', '释放', '突破'],
  },
  {
    id: 17,
    name: 'XVII. The Star',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_star.png',
    upright: '希望重燃、疗愈、灵感源泉',
    reversed: '信心不足、能量枯竭、迟滞',
    keywords: ['希望', '指引', '灵性'],
  },
  {
    id: 18,
    name: 'XVIII. The Moon',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_moon.png',
    upright: '潜意识、梦境、面对不安',
    reversed: '困惑解除、真相浮现、逐渐明朗',
    keywords: ['直觉', '感受', '阴影'],
  },
  {
    id: 19,
    name: 'XIX. The Sun',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_sun.png',
    upright: '乐观、成功、清晰洞见',
    reversed: '延迟、自满、暂时挫折',
    keywords: ['活力', '喜悦', '成长'],
  },
  {
    id: 20,
    name: 'XX. Judgement',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_judgement.png',
    upright: '觉醒、自我评估、新的开始',
    reversed: '自我怀疑、缺乏判断、错过机会',
    keywords: ['觉醒', '评估', '重生'],
  },
  {
    id: 21,
    name: 'XXI. The World',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_world.png',
    upright: '完成、成就、圆满',
    reversed: '未完成、缺乏成就感、停滞',
    keywords: ['完成', '成就', '圆满'],
  },
  // ========== 小阿尔卡那 - 权杖（Wands）14张 ==========
  {
    id: 22,
    name: 'Ace of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_ace.png',
    upright: '新计划、灵感、创造力',
    reversed: '缺乏动力、创意受阻、延迟',
    keywords: ['灵感', '创造', '开始'],
  },
  {
    id: 23,
    name: 'Two of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_2.png',
    upright: '规划未来、个人力量、探索',
    reversed: '缺乏规划、恐惧未知、停滞',
    keywords: ['规划', '探索', '力量'],
  },
  {
    id: 24,
    name: 'Three of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_3.png',
    upright: '远见、探索、扩张',
    reversed: '缺乏远见、延迟、挫折',
    keywords: ['远见', '探索', '扩张'],
  },
  {
    id: 25,
    name: 'Four of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_4.png',
    upright: '庆祝、和谐、稳定',
    reversed: '缺乏庆祝、不稳定、过渡期',
    keywords: ['庆祝', '和谐', '稳定'],
  },
  {
    id: 26,
    name: 'Five of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_5.png',
    upright: '竞争、冲突、挑战',
    reversed: '避免冲突、内部斗争、妥协',
    keywords: ['竞争', '冲突', '挑战'],
  },
  {
    id: 27,
    name: 'Six of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_6.png',
    upright: '胜利、成功、认可',
    reversed: '失败、缺乏认可、骄傲',
    keywords: ['胜利', '成功', '认可'],
  },
  {
    id: 28,
    name: 'Seven of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_7.png',
    upright: '坚持立场、挑战、防御',
    reversed: '放弃、屈服、缺乏自信',
    keywords: ['坚持', '挑战', '防御'],
  },
  {
    id: 29,
    name: 'Eight of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_8.png',
    upright: '快速行动、进展、消息',
    reversed: '延迟、匆忙、缺乏方向',
    keywords: ['速度', '进展', '消息'],
  },
  {
    id: 30,
    name: 'Nine of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_9.png',
    upright: '韧性、坚持、最后努力',
    reversed: '疲惫、放弃、缺乏韧性',
    keywords: ['韧性', '坚持', '努力'],
  },
  {
    id: 31,
    name: 'Ten of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_10.png',
    upright: '负担、责任、过度工作',
    reversed: '放下负担、委派、解脱',
    keywords: ['负担', '责任', '工作'],
  },
  {
    id: 32,
    name: 'Page of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_page.png',
    upright: '探索、热情、新想法',
    reversed: '缺乏方向、拖延、不成熟',
    keywords: ['探索', '热情', '想法'],
  },
  {
    id: 33,
    name: 'Knight of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_knight.png',
    upright: '行动、冒险、冲动',
    reversed: '鲁莽、缺乏方向、延迟',
    keywords: ['行动', '冒险', '冲动'],
  },
  {
    id: 34,
    name: 'Queen of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_queen.png',
    upright: '自信、热情、独立',
    reversed: '缺乏自信、嫉妒、依赖',
    keywords: ['自信', '热情', '独立'],
  },
  {
    id: 35,
    name: 'King of Wands',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_king.png',
    upright: '领导力、远见、创业精神',
    reversed: '专制、缺乏远见、冲动',
    keywords: ['领导', '远见', '创业'],
  },
  // ========== 小阿尔卡那 - 圣杯（Cups）14张 ==========
  {
    id: 36,
    name: 'Ace of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_ace.png',
    upright: '新感情、情感开始、直觉',
    reversed: '情感空虚、失去连接、拒绝爱',
    keywords: ['情感', '直觉', '开始'],
  },
  {
    id: 37,
    name: 'Two of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_2.png',
    upright: '伙伴关系、结合、相互吸引',
    reversed: '关系破裂、不平衡、分离',
    keywords: ['伙伴', '结合', '吸引'],
  },
  {
    id: 38,
    name: 'Three of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_3.png',
    upright: '友谊、庆祝、社交',
    reversed: '孤立、过度社交、冲突',
    keywords: ['友谊', '庆祝', '社交'],
  },
  {
    id: 39,
    name: 'Four of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_4.png',
    upright: '沉思、内省、错过机会',
    reversed: '觉醒、新机会、接受',
    keywords: ['沉思', '内省', '机会'],
  },
  {
    id: 40,
    name: 'Five of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_5.png',
    upright: '失落、悲伤、遗憾',
    reversed: '接受、宽恕、前进',
    keywords: ['失落', '悲伤', '遗憾'],
  },
  {
    id: 41,
    name: 'Six of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_6.png',
    upright: '怀旧、回忆、纯真',
    reversed: '困在过去、拒绝成长、不成熟',
    keywords: ['怀旧', '回忆', '纯真'],
  },
  {
    id: 42,
    name: 'Seven of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_7.png',
    upright: '选择、幻想、可能性',
    reversed: '缺乏焦点、混乱、错误选择',
    keywords: ['选择', '幻想', '可能'],
  },
  {
    id: 43,
    name: 'Eight of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_8.png',
    upright: '放弃、寻找更深意义、离开',
    reversed: '停滞、恐惧改变、逃避',
    keywords: ['放弃', '寻找', '离开'],
  },
  {
    id: 44,
    name: 'Nine of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_9.png',
    upright: '满足、情感满足、愿望实现',
    reversed: '缺乏满足、物质主义、过度',
    keywords: ['满足', '实现', '愿望'],
  },
  {
    id: 45,
    name: 'Ten of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_10.png',
    upright: '和谐、家庭幸福、圆满',
    reversed: '不和谐、家庭冲突、缺乏支持',
    keywords: ['和谐', '幸福', '圆满'],
  },
  {
    id: 46,
    name: 'Page of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_page.png',
    upright: '创意灵感、直觉、新感情',
    reversed: '情感不成熟、缺乏创意、拒绝直觉',
    keywords: ['创意', '直觉', '感情'],
  },
  {
    id: 47,
    name: 'Knight of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_knight.png',
    upright: '浪漫、魅力、追求理想',
    reversed: '情绪化、不切实际、逃避',
    keywords: ['浪漫', '魅力', '理想'],
  },
  {
    id: 48,
    name: 'Queen of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_queen.png',
    upright: '同情、直觉、情感支持',
    reversed: '情绪不稳定、缺乏同情、依赖',
    keywords: ['同情', '直觉', '支持'],
  },
  {
    id: 49,
    name: 'King of Cups',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_king.png',
    upright: '情感平衡、同情、控制',
    reversed: '情绪失控、冷漠、缺乏平衡',
    keywords: ['平衡', '同情', '控制'],
  },
  // ========== 小阿尔卡那 - 宝剑（Swords）14张 ==========
  {
    id: 50,
    name: 'Ace of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_ace.png',
    upright: '新想法、清晰、突破',
    reversed: '混乱、缺乏清晰、错误想法',
    keywords: ['清晰', '突破', '想法'],
  },
  {
    id: 51,
    name: 'Two of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_2.png',
    upright: '困难选择、僵局、平衡',
    reversed: '优柔寡断、逃避选择、不平衡',
    keywords: ['选择', '僵局', '平衡'],
  },
  {
    id: 52,
    name: 'Three of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_3.png',
    upright: '心碎、悲伤、分离',
    reversed: '恢复、宽恕、情感愈合',
    keywords: ['心碎', '悲伤', '分离'],
  },
  {
    id: 53,
    name: 'Four of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_4.png',
    upright: '休息、恢复、冥想',
    reversed: '疲惫、缺乏休息、过度工作',
    keywords: ['休息', '恢复', '冥想'],
  },
  {
    id: 54,
    name: 'Five of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_5.png',
    upright: '冲突、背叛、不公',
    reversed: '和解、宽恕、解决冲突',
    keywords: ['冲突', '背叛', '不公'],
  },
  {
    id: 55,
    name: 'Six of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_6.png',
    upright: '过渡、离开、前进',
    reversed: '无法前进、困在过去、延迟',
    keywords: ['过渡', '离开', '前进'],
  },
  {
    id: 56,
    name: 'Seven of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_7.png',
    upright: '欺骗、策略、逃避',
    reversed: '诚实、面对后果、承担责任',
    keywords: ['欺骗', '策略', '逃避'],
  },
  {
    id: 57,
    name: 'Eight of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_8.png',
    upright: '限制、自我怀疑、被困',
    reversed: '自由、自我接受、新视角',
    keywords: ['限制', '怀疑', '被困'],
  },
  {
    id: 58,
    name: 'Nine of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_9.png',
    upright: '焦虑、噩梦、恐惧',
    reversed: '希望、恢复、面对恐惧',
    keywords: ['焦虑', '噩梦', '恐惧'],
  },
  {
    id: 59,
    name: 'Ten of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_10.png',
    upright: '背叛、结束、痛苦',
    reversed: '恢复、新开始、释放',
    keywords: ['背叛', '结束', '痛苦'],
  },
  {
    id: 60,
    name: 'Page of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_page.png',
    upright: '好奇心、新想法、沟通',
    reversed: '缺乏焦点、八卦、错误信息',
    keywords: ['好奇', '想法', '沟通'],
  },
  {
    id: 61,
    name: 'Knight of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_knight.png',
    upright: '行动、冲动、直接',
    reversed: '鲁莽、缺乏方向、延迟',
    keywords: ['行动', '冲动', '直接'],
  },
  {
    id: 62,
    name: 'Queen of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_queen.png',
    upright: '清晰思考、独立、诚实',
    reversed: '冷酷、缺乏同情、偏见',
    keywords: ['清晰', '独立', '诚实'],
  },
  {
    id: 63,
    name: 'King of Swords',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_king.png',
    upright: '真理、公正、权威',
    reversed: '操纵、不公、滥用权力',
    keywords: ['真理', '公正', '权威'],
  },
  // ========== 小阿尔卡那 - 星币（Pentacles）14张 ==========
  {
    id: 64,
    name: 'Ace of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_ace.png',
    upright: '新机会、物质开始、潜力',
    reversed: '错失机会、缺乏规划、不稳定',
    keywords: ['机会', '物质', '潜力'],
  },
  {
    id: 65,
    name: 'Two of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_2.png',
    upright: '平衡优先、时间管理、适应',
    reversed: '不平衡、缺乏优先、过度承诺',
    keywords: ['平衡', '管理', '适应'],
  },
  {
    id: 66,
    name: 'Three of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_3.png',
    upright: '团队合作、协作、技能',
    reversed: '缺乏合作、不专业、孤立',
    keywords: ['合作', '协作', '技能'],
  },
  {
    id: 67,
    name: 'Four of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_4.png',
    upright: '控制、安全、节俭',
    reversed: '贪婪、物质主义、缺乏控制',
    keywords: ['控制', '安全', '节俭'],
  },
  {
    id: 68,
    name: 'Five of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_5.png',
    upright: '物质困难、孤立、贫困',
    reversed: '恢复、寻求帮助、新开始',
    keywords: ['困难', '孤立', '贫困'],
  },
  {
    id: 69,
    name: 'Six of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_6.png',
    upright: '慷慨、分享、给予',
    reversed: '自私、不平衡、债务',
    keywords: ['慷慨', '分享', '给予'],
  },
  {
    id: 70,
    name: 'Seven of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_7.png',
    upright: '长期观点、评估、耐心',
    reversed: '缺乏进展、挫折、不耐烦',
    keywords: ['长期', '评估', '耐心'],
  },
  {
    id: 71,
    name: 'Eight of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_8.png',
    upright: '技能发展、质量、专注',
    reversed: '缺乏质量、匆忙、缺乏技能',
    keywords: ['技能', '质量', '专注'],
  },
  {
    id: 72,
    name: 'Nine of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_9.png',
    upright: '财务独立、自给自足、享受',
    reversed: '缺乏独立、过度依赖、财务困难',
    keywords: ['独立', '自给', '享受'],
  },
  {
    id: 73,
    name: 'Ten of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_10.png',
    upright: '财富、家庭安全、长期成功',
    reversed: '财务损失、缺乏安全、家庭冲突',
    keywords: ['财富', '安全', '成功'],
  },
  {
    id: 74,
    name: 'Page of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_page.png',
    upright: '新机会、学习、务实',
    reversed: '缺乏机会、不切实际、拖延',
    keywords: ['机会', '学习', '务实'],
  },
  {
    id: 75,
    name: 'Knight of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_knight.png',
    upright: '效率、责任、方法',
    reversed: '懒惰、缺乏责任、拖延',
    keywords: ['效率', '责任', '方法'],
  },
  {
    id: 76,
    name: 'Queen of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_queen.png',
    upright: '实用、关怀、财务安全',
    reversed: '自我中心、物质主义、缺乏关怀',
    keywords: ['实用', '关怀', '安全'],
  },
  {
    id: 77,
    name: 'King of Pentacles',
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_king.png',
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
        <span className="material-symbols-outlined text-2xl text-primary">auto_fix_high</span>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-xs text-white/70 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:border-white/20 hover:text-white"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};

const TarotReadingModal = ({ isOpen, onRequestClose }) => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [drawResult, setDrawResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const closeTimerRef = useRef(null);
  const questionInputRef = useRef(null);
  const wasOpenRef = useRef(false);
  const cardBackIndices = useMemo(() => Array.from({ length: 12 }, (_, index) => index), []);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = setTimeout(() => {
        setQuestion('');
        setError(null);
        setDrawResult(null);
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
      setDrawResult(null);
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
    // 只在未抽牌时才聚焦输入框
    if (!drawResult && questionInputRef.current) {
      questionInputRef.current.focus();
    }
    return undefined;
  }, [isOpen, drawResult]);

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
    if (!question.trim()) {
      setError('请先输入你的问题，再开始抽牌。');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // 随机抽取塔罗牌和正逆位
      const card = pickRandom(tarotCards);
      const orientation = Math.random() > 0.5 ? 'upright' : 'reversed';

      // 调用 API 获取 AI 解读
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          cardName: card.name,
          orientation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 显示详细的错误信息
        const errorMessage = data.message || data.error || '获取解读失败，请稍后重试';
        console.error('API 错误:', {
          status: response.status,
          error: data.error,
          message: data.message,
          details: data.details,
        });
        throw new Error(errorMessage);
      }

      // 检查返回数据是否有效
      if (!data.answer && !data.interpretation) {
        throw new Error('未能获取有效解读，请重试');
      }

      setDrawResult({
        card,
        orientation,
        answer: data.answer,
        interpretation: data.interpretation,
      });
      
      // 移除输入框焦点，防止光标闪烁
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    } catch (err) {
      console.error('抽牌错误:', err);
      setError(err.message || '抽牌失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawAgain = () => {
    setError(null);
    setDrawResult(null);
    setQuestion(''); // 清空问题
    // 移除任何元素的焦点，防止光标闪烁
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  };

  const isDrawDisabled = question.trim().length === 0 || isLoading;

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[60] flex items-start justify-center px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 overflow-y-auto bg-gradient-to-br from-background-dark/95 via-background-dark/90 to-black/90 backdrop-blur-md ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{ paddingBottom: '10rem' }}
      onClick={handleClose}
    >
      
      {/* 未抽牌时：垂直水平居中显示输入框和按钮 */}
      {!drawResult ? (
        <section
          className={`relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 text-white shadow-glow transition-all duration-300 my-auto ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="关闭塔罗占卜面板"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition hover:border-white/20 hover:text-white"
            type="button"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <header className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-2">塔罗占卜</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight">静心提问，抽取你的指引</h2>
            <p className="text-sm text-white/70 mt-1">
              请在心中专注你的问题，深呼吸三次后开始抽牌。相信宇宙会为你带来最适合的讯息。
            </p>
          </header>

          <div className="flex flex-col gap-6">
            {/* 占卜引导提示 */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-white/90 leading-relaxed">
                <span className="font-semibold text-primary">占卜建议：</span>为获得最准确的指引，同一个问题建议只问一次。重复占卜可能会让能量混乱，影响结果的准确性。
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3" htmlFor="tarot-question">
                你的问题
              </label>
              <textarea
                id="tarot-question"
                ref={questionInputRef}
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-base text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={4}
                maxLength={160}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="提问技巧：请输入可以用 Yes 或 No 回答的问题，例如：我应该接受这个新的工作机会吗？我和他/她的关系会有进一步发展吗？"
              ></textarea>
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>最多 160 字</span>
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
                    <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
                    解读中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    抽牌
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* 抽牌后：显示结果 */
        <section
          className={`relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 text-white shadow-glow transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="关闭塔罗占卜面板"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 transition hover:border-white/20 hover:text-white z-20"
            type="button"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          <div className="animate-fade-in flex flex-col">
            {/* 用户问题显示区域 */}
            {question && (
              <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 text-center">
                <p className="text-sm font-medium text-primary/80 mb-2 uppercase tracking-wider">Your Question</p>
                <p className="text-lg text-white/95 leading-relaxed font-medium">{question}</p>
              </div>
            )}
            
            <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr] w-full">
              <div className="flex flex-col gap-4">
                {/* 卡片图片区域 */}
                <div className="flex flex-col items-center gap-4">
                  <div className="perspective w-full flex justify-center">
                    <div className="animate-flip-in h-72 w-48 overflow-hidden rounded-3xl border border-white/15 bg-black/20 shadow-glow">
                      <img
                        src={drawResult.card.image}
                        alt={drawResult.card.name}
                        className={`h-full w-full object-cover transition-transform duration-500 ${drawResult.orientation === 'reversed' ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50">若出现逆位，牌面将倒置显示。</p>
                </div>
              </div>
              {/* 右侧内容区域 */}
              <div className="flex flex-col gap-5 justify-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">{drawResult.card.name}</h3>
                  <p className="mt-1 text-sm text-white/60">
                    {drawResult.orientation === 'upright' ? '正位' : '逆位'} ·
                    {drawResult.orientation === 'upright' ? drawResult.card.upright : drawResult.card.reversed}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {drawResult.card.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                {/* AI 生成的答案 */}
                {drawResult.answer && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                      <span className="text-sm font-semibold text-primary uppercase tracking-wider">答案</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{drawResult.answer}</p>
                  </div>
                )}
                {/* AI 生成的解析 */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-base leading-relaxed text-white/80">
                  {drawResult.interpretation}
                </div>
                {/* 按钮区域：稍微向左偏移，视觉上更居中 */}
                <div className="flex justify-center mt-6 -ml-3">
                  <button
                    type="button"
                    onClick={handleDrawAgain}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    再问一个
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [isTarotOpen, setIsTarotOpen] = useState(false);
  const [toast, setToast] = useState({ title: '', message: '' });
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimerRef = useRef(null);
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);

  // 在客户端动态加载 Tailwind CSS CDN 和配置
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 确保 HTML 根元素有 dark 类
    document.documentElement.classList.add('dark');

    // 加载 Tailwind 配置函数
    const loadTailwindConfig = () => {
      if (window.tailwind) {
        window.tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                primary: '#7f13ec',
                'background-light': '#f7f6f8',
                'background-dark': '#191022',
              },
              fontFamily: {
                display: ['Spline Sans', 'sans-serif'],
              },
              borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
              boxShadow: {
                glow: '0 0 15px 0 rgba(234, 179, 8, 0.2), 0 0 5px 0 rgba(234, 179, 8, 0.1)',
              },
            },
          },
        };
        setIsTailwindLoaded(true);
        return true;
      }
      return false;
    };

    // 检查 Tailwind 是否已经加载
    if (window.tailwind) {
      if (loadTailwindConfig()) {
        return;
      }
    }

    // 检查是否已经在加载中
    if (document.querySelector('script[src*="tailwindcss"]')) {
      // 如果脚本已存在，等待它加载完成
      const checkTailwind = setInterval(() => {
        if (window.tailwind) {
          loadTailwindConfig();
          clearInterval(checkTailwind);
        }
      }, 50);
      return () => clearInterval(checkTailwind);
    }

    // 加载 Tailwind CDN
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    tailwindScript.async = true;
    tailwindScript.onload = () => {
      // 多次尝试加载配置，因为 Tailwind 可能需要一点时间初始化
      let attempts = 0;
      const tryLoadConfig = setInterval(() => {
        attempts++;
        if (loadTailwindConfig() || attempts > 20) {
          clearInterval(tryLoadConfig);
        }
      }, 100);
    };
    document.head.appendChild(tailwindScript);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  }, []);

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

  const handleTarotClose = () => {
    setIsTarotOpen(false);
  };

  const handleFeatureComingSoon = (title) => {
    showToast(title, '该功能正在开发中，敬请期待。');
  };

  const handleFortuneMessage = (title) => {
    showToast(title, '我们会根据你的反馈优先开放此项占卜服务。');
  };

  return (
    <>
      <Head>
        <title>Mystic Insights - Fortune Telling &amp; Horoscope</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
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
              box-shadow: 0 0 8px 0px rgba(127, 19, 236, 0.5), 0 0 4px 0px rgba(127, 19, 236, 0.3), 0 0 0 1px rgba(127, 19, 236, 0.3);
            }
            50% {
              box-shadow: 0 0 15px 3px rgba(127, 19, 236, 0.7), 0 0 8px 2px rgba(127, 19, 236, 0.5), 0 0 0 1px rgba(127, 19, 236, 0.6);
            }
          }
          .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
          }
          .group:hover .animate-pulse-glow {
            box-shadow: 0 0 20px 4px rgba(127, 19, 236, 0.8), 0 0 10px 3px rgba(127, 19, 236, 0.6), 0 0 0 1px rgba(127, 19, 236, 0.7);
          }
          @keyframes breathe {
            0%, 100% {
              opacity: 0.4;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
          .animate-breathe {
            animation: breathe 4s ease-in-out infinite;
          }
          @keyframes text-glow {
            0%, 100% {
              text-shadow: 0 0 10px rgba(127, 19, 236, 0.3), 
                           0 0 20px rgba(127, 19, 236, 0.2),
                           0 0 30px rgba(168, 85, 247, 0.1);
            }
            50% {
              text-shadow: 0 0 15px rgba(127, 19, 236, 0.5), 
                           0 0 25px rgba(127, 19, 236, 0.3),
                           0 0 35px rgba(168, 85, 247, 0.2);
            }
          }
          .animate-text-glow {
            animation: text-glow 4s ease-in-out infinite;
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease forwards;
          }
          @keyframes flip-in {
            from {
              transform: rotateY(-180deg);
              opacity: 0;
            }
            to {
              transform: rotateY(0deg);
              opacity: 1;
            }
          }
          .animate-flip-in {
            animation: flip-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .perspective {
            perspective: 1200px;
          }
          /* 确保基础样式在 Tailwind 加载前也能显示 */
          body {
            margin: 0;
            font-family: 'Spline Sans', sans-serif;
          }
          html.dark,
          html.dark body {
            background-color: #191022;
          }
        ` }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.tailwindConfigSet) {
                window.tailwindConfigSet = true;
                (function() {
                  var script = document.createElement('script');
                  script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
                  script.async = true;
                  script.onload = function() {
                    if (window.tailwind) {
                      window.tailwind.config = {
                        darkMode: 'class',
                        theme: {
                          extend: {
                            colors: {
                              primary: '#7f13ec',
                              'background-light': '#f7f6f8',
                              'background-dark': '#191022',
                            },
                            fontFamily: {
                              display: ['Spline Sans', 'sans-serif'],
                            },
                            borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
                            boxShadow: {
                              glow: '0 0 15px 0 rgba(234, 179, 8, 0.2), 0 0 5px 0 rgba(234, 179, 8, 0.1)',
                            },
                          },
                        },
                      };
                    }
                  };
                  document.head.appendChild(script);
                })();
              }
            `,
          }}
        />
      </Head>
      <div className="dark">
        <div className="font-display bg-background-light dark:bg-background-dark">
          <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-white">
                  <div className="size-6 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Mystic Insights</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-8">
                  <div className="flex items-center gap-9">
                    <a className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                      Home
                    </a>
                    <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                      My Readings
                    </a>
                    <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                      About
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {/* 原按钮缺少交互反馈，导致用户点击无响应，这里统一提示路线计划 */}
                    <button
                      type="button"
                      onClick={() => handleFeatureComingSoon('Sign Up 功能开发中')}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                    >
                      <span className="truncate">Sign Up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeatureComingSoon('Login 功能开发中')}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors"
                    >
                      <span className="truncate">Login</span>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleFeatureComingSoon('移动端菜单开发中')}
                  className="md:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
              </header>
              <main className="flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
                <div className="mx-auto max-w-6xl">
                  <section className="mb-16">
                    <div
                      className="relative overflow-hidden flex min-h-[380px] flex-col gap-6 rounded-xl bg-cover bg-center bg-no-repeat items-center justify-center p-4 text-center"
                      data-alt="A mystical, abstract background with swirling purple and blue cosmic nebulae and faint star patterns."
                    >
                      <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfEGBzoDokXgRS6Ba5Wj5HBFKsltQO-dubX9obltWaFOskDIiYL50bM9mCNa1PvetW_ExXEUA7n6J3-cbJWM82pH2jWwEoEjz3gIbHr9pIf55jVLkszkslsFu-Qg_pac6MBGsLT-rLuG2kYFb3md79b-JSYgwQ9lVfZKrtzCU7hq5hc6iD8WrXQYAHyggiWU4M2ZFmkZNocAAaxwXdnY3i9ZSon_4A1RpdUEqvwVEjTQ4D-SDbmBkjEYFVBE5E3aHfz8TvdtQ12d8')] bg-cover bg-center animate-flow [background-size:200%_200%] opacity-80"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(25,16,34,0.4)] to-[rgba(25,16,34,0.7)]"></div>
                      <div className="relative z-10 flex flex-col gap-6 items-center">
                        <div className="flex flex-col gap-2">
                          <h1 className="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
                            探索未知，预见未来
                          </h1>
                          <h2 className="text-white/80 text-base sm:text-lg font-normal leading-normal max-w-2xl mx-auto">
                            Discover profound personal insights and navigate your path with our ancient divination tools.
                          </h2>
                        </div>
                        {/* 原 HTML 通过 data-tarot-trigger + 外部脚本触发弹窗，Next.js 中脚本未运行导致无法开启，这里改为 React 事件 */}
                        <button
                          type="button"
                          onClick={handleTarotTrigger}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-transform hover:scale-105"
                        >
                          <span className="truncate">Start Your Reading</span>
                        </button>
                      </div>
                    </div>
                  </section>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 @container">
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow">
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-sm font-medium">是否占卜</p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Fortune Telling</p>
                          <p className="text-white/60 text-base font-normal leading-normal">
                            Choose your preferred method of divination to gain clarity and guidance on your path.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 mt-auto">
                          {/* 同样原因，绑定 onClick 以触发 React 弹窗 */}
                          <button
                            type="button"
                            onClick={handleTarotTrigger}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">塔罗占卜 (Tarot)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/divination/jiaobei')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">掷筊占卜 (Moon Blocks)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow">
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-sm font-medium">运势测算</p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Fortune Calculation</p>
                          <p className="text-white/60 text-base font-normal leading-normal">
                            Uncover astrological insights for your day, month, season, or the entire year ahead.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <button
                            type="button"
                            onClick={() => router.push('/fortune/daily')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">每日运势</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/fortune/monthly')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">月度运势</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('四季牌阵 请求已记录')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">四季牌阵</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('年度运势 请求已记录')}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="truncate">年度运势</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex flex-col gap-6 rounded-xl bg-white/5 p-8 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] animate-pulse-glow">
                      <div className="relative z-10 flex h-full flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-primary text-sm font-medium">主题占卜</p>
                          <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Themed Readings</p>
                          <p className="text-white/60 text-base font-normal leading-normal">
                            Seek answers and guidance for the most important areas of your life.
                          </p>
                        </div>
                        <div className="flex flex-col gap-4 mt-auto">
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('爱情占卜 请求已记录')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">favorite</span>
                            <span className="truncate">爱情 (Love)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('事业＆学业占卜 请求已记录')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">school</span>
                            <span className="truncate">事业&amp;学业 (Career &amp; Study)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFortuneMessage('财富占卜 请求已记录')}
                            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-4 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">paid</span>
                            <span className="truncate">财富 (Wealth)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 治愈系引导文字 */}
                  <div className="mt-20 mb-12 flex justify-center">
                    <div className="relative inline-block">
                      {/* 背景光晕效果 */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 blur-2xl animate-breathe"></div>
                      {/* 文字容器 */}
                      <div className="relative px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="text-white/90 text-base sm:text-lg font-medium text-center tracking-wide leading-relaxed animate-text-glow">
                          占卜呈现当下能量的趋势，但未来始终掌握在你手里。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <footer className="border-t border-solid border-white/10 mt-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-8 md:px-16 lg:px-24 py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-white/70">
                      <div className="size-5 text-primary">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-sm">© 2024 Mystic Insights. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                        Terms of Service
                      </a>
                      <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                        Privacy Policy
                      </a>
                      <a className="text-white/70 text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">
                        Contact Us
                      </a>
                    </div>
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
