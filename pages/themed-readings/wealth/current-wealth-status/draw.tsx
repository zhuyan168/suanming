import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem, { TarotCard } from '../../../../components/fortune/CardItem';
import EmptySlot from '../../../../components/fortune/EmptySlot';
import ScrollBar from '../../../../components/fortune/ScrollBar';
import WealthThreeCardSlots from '../../../../components/fortune/WealthThreeCardSlots';

// 完整的78张塔罗牌数据
const tarotCards = [
  // ========== 大阿尔卡那 22张 ==========
  { id: 0, name: '0. The Fool', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fool.png', upright: '新的开始、信任直觉、勇敢冒险', reversed: '冲动行事、犹豫不决、方向不明', keywords: ['纯真', '自由', '机会'] },
  { id: 1, name: 'I. The Magician', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_magician.png', upright: '资源整合、贯彻执行、影响力', reversed: '分散注意、欺骗、缺乏计划', keywords: ['行动', '意志', '显化'] },
  { id: 2, name: 'II. The High Priestess', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_priestess.png', upright: '内在智慧、直觉洞察、保持沉静', reversed: '忽略直觉、情绪混乱、资讯不明', keywords: ['直觉', '秘密', '平衡'] },
  { id: 3, name: 'III. The Empress', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_empress.png', upright: '丰盛富足、创造力、母性关怀', reversed: '过度依赖、创造力受阻、缺乏滋养', keywords: ['丰盛', '创造', '滋养'] },
  { id: 4, name: 'IV. The Emperor', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_emperor.png', upright: '权威、秩序、稳定结构', reversed: '专制、僵化、缺乏灵活性', keywords: ['权威', '秩序', '稳定'] },
  { id: 5, name: 'V. The Hierophant', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hierophant.png', upright: '传统智慧、精神指引、遵循规范', reversed: '教条主义、反叛、脱离传统', keywords: ['传统', '指引', '规范'] },
  { id: 6, name: 'VI. The Lovers', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_lovers.png', upright: '真诚连接、重要抉择、价值一致', reversed: '矛盾、分歧、失去平衡', keywords: ['关系', '信任', '选择'] },
  { id: 7, name: 'VII. The Chariot', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_chariot.png', upright: '意志坚定、目标导向、克服障碍', reversed: '缺乏方向、失控、内在冲突', keywords: ['意志', '目标', '胜利'] },
  { id: 8, name: 'VIII. Strength', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_strength.png', upright: '内在力量、耐心、温柔控制', reversed: '软弱、缺乏自信、情绪失控', keywords: ['力量', '耐心', '控制'] },
  { id: 9, name: 'IX. The Hermit', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hermit.png', upright: '内省、寻求真理、独处思考', reversed: '孤立、逃避、迷失方向', keywords: ['内省', '真理', '指引'] },
  { id: 10, name: 'X. Wheel of Fortune', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fortune.png', upright: '命运转折、周期循环、新的机遇', reversed: '坏运气、抗拒变化、停滞不前', keywords: ['命运', '循环', '变化'] },
  { id: 11, name: 'XI. Justice', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_justice.png', upright: '公平正义、平衡、承担责任', reversed: '不公、偏见、逃避责任', keywords: ['正义', '平衡', '责任'] },
  { id: 12, name: 'XII. The Hanged Man', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hanged.png', upright: '等待、牺牲、新的视角', reversed: '拖延、抗拒牺牲、停滞', keywords: ['等待', '牺牲', '视角'] },
  { id: 13, name: 'XIII. Death', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_death.png', upright: '结束与重生、转变、放下过去', reversed: '抗拒改变、停滞、恐惧转变', keywords: ['转变', '结束', '重生'] },
  { id: 14, name: 'XIV. Temperance', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_temperance.png', upright: '平衡调和、耐心、适度', reversed: '失衡、过度、缺乏耐心', keywords: ['平衡', '调和', '耐心'] },
  { id: 15, name: 'XV. The Devil', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_devil.png', upright: '束缚、欲望、物质依赖', reversed: '解脱、打破束缚、重获自由', keywords: ['束缚', '欲望', '依赖'] },
  { id: 16, name: 'XVI. The Tower', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_tower.png', upright: '突发变化、觉醒、旧结构崩塌', reversed: '抗拒改变、延迟崩解、局部冲击', keywords: ['变革', '释放', '突破'] },
  { id: 17, name: 'XVII. The Star', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_star.png', upright: '希望重燃、疗愈、灵感源泉', reversed: '信心不足、能量枯竭、迟滞', keywords: ['希望', '指引', '灵性'] },
  { id: 18, name: 'XVIII. The Moon', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_moon.png', upright: '潜意识、梦境、面对不安', reversed: '困惑解除、真相浮现、逐渐明朗', keywords: ['直觉', '感受', '阴影'] },
  { id: 19, name: 'XIX. The Sun', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_sun.png', upright: '乐观、成功、清晰洞见', reversed: '延迟、自满、暂时挫折', keywords: ['活力', '喜悦', '成长'] },
  { id: 20, name: 'XX. Judgement', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_judgement.png', upright: '觉醒、自我评估、新的开始', reversed: '自我怀疑、缺乏判断、错过机会', keywords: ['觉醒', '评估', '重生'] },
  { id: 21, name: 'XXI. The World', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_world.png', upright: '完成、成就、圆满', reversed: '未完成、缺乏成就感、停滞', keywords: ['完成', '成就', '圆满'] },
  // ========== 小阿尔卡那 - 权杖（Wands）14张 ==========
  { id: 22, name: 'Ace of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_ace.png', upright: '新计划、灵感、创造力', reversed: '缺乏动力、创意受阻、延迟', keywords: ['灵感', '创造', '开始'] },
  { id: 23, name: 'Two of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_2.png', upright: '规划未来、个人力量、探索', reversed: '缺乏规划、恐惧未知、停滞', keywords: ['规划', '探索', '力量'] },
  { id: 24, name: 'Three of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_3.png', upright: '远见、探索、扩张', reversed: '缺乏远见、延迟、挫折', keywords: ['远见', '探索', '扩张'] },
  { id: 25, name: 'Four of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_4.png', upright: '庆祝、和谐、稳定', reversed: '缺乏庆祝、不稳定、过渡期', keywords: ['庆祝', '和谐', '稳定'] },
  { id: 26, name: 'Five of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_5.png', upright: '竞争、冲突、挑战', reversed: '避免冲突、内部斗争、妥协', keywords: ['竞争', '冲突', '挑战'] },
  { id: 27, name: 'Six of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_6.png', upright: '胜利、成功、认可', reversed: '失败、缺乏认可、骄傲', keywords: ['胜利', '成功', '认可'] },
  { id: 28, name: 'Seven of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_7.png', upright: '坚持立场、挑战、防御', reversed: '放弃、屈服、缺乏自信', keywords: ['坚持', '挑战', '防御'] },
  { id: 29, name: 'Eight of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_8.png', upright: '快速行动、进展、消息', reversed: '延迟、匆忙、缺乏方向', keywords: ['速度', '进展', '消息'] },
  { id: 30, name: 'Nine of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_9.png', upright: '韧性、坚持、最后努力', reversed: '疲惫、放弃、缺乏韧性', keywords: ['韧性', '坚持', '努力'] },
  { id: 31, name: 'Ten of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_10.png', upright: '负担、责任、过度工作', reversed: '放下负担、委派、解脱', keywords: ['负担', '责任', '工作'] },
  { id: 32, name: 'Page of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_page.png', upright: '探索、热情、新想法', reversed: '缺乏方向、拖延、不成熟', keywords: ['探索', '热情', '想法'] },
  { id: 33, name: 'Knight of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_knight.png', upright: '行动、冒险、冲动', reversed: '鲁莽、缺乏方向、延迟', keywords: ['行动', '冒险', '冲动'] },
  { id: 34, name: 'Queen of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_queen.png', upright: '自信、热情、独立', reversed: '缺乏自信、嫉妒、依赖', keywords: ['自信', '热情', '独立'] },
  { id: 35, name: 'King of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_king.png', upright: '领导力、远见、创业精神', reversed: '专制、缺乏远见、冲动', keywords: ['领导', '远见', '创业'] },
  // ========== 小阿尔卡那 - 圣杯（Cups）14张 ==========
  { id: 36, name: 'Ace of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_ace.png', upright: '新感情、情感开始、直觉', reversed: '情感空虚、失去连接、拒绝爱', keywords: ['情感', '直觉', '开始'] },
  { id: 37, name: 'Two of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_2.png', upright: '伙伴关系、结合、相互吸引', reversed: '关系破裂、不平衡、分离', keywords: ['伙伴', '结合', '吸引'] },
  { id: 38, name: 'Three of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_3.png', upright: '友谊、庆祝、社交', reversed: '孤立、过度社交、冲突', keywords: ['友谊', '庆祝', '社交'] },
  { id: 39, name: 'Four of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_4.png', upright: '沉思、内省、错过机会', reversed: '觉醒、新机会、接受', keywords: ['沉思', '内省', '机会'] },
  { id: 40, name: 'Five of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_5.png', upright: '失落、悲伤、遗憾', reversed: '接受、宽恕、前进', keywords: ['失落', '悲伤', '遗憾'] },
  { id: 41, name: 'Six of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_6.png', upright: '怀旧、回忆、纯真', reversed: '困住在过去、拒绝成长、不成熟', keywords: ['怀旧', '回忆', '纯真'] },
  { id: 42, name: 'Seven of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_7.png', upright: '选择、幻想、可能性', reversed: '缺乏焦点、混乱、错误选择', keywords: ['选择', '幻想', '可能'] },
  { id: 43, name: 'Eight of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_8.png', upright: '放弃、寻找更深意义、离开', reversed: '停滞、恐惧改变、逃避', keywords: ['放弃', '寻找', '离开'] },
  { id: 44, name: 'Nine of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_9.png', upright: '满足、情感满足、愿望实现', reversed: '缺乏满足、物质主义、过度', keywords: ['满足', '实现', '愿望'] },
  { id: 45, name: 'Ten of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_10.png', upright: '和谐、家庭幸福、圆满', reversed: '不和谐、家庭冲突、缺乏支持', keywords: ['和谐', '幸福', '圆满'] },
  { id: 46, name: 'Page of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_page.png', upright: '创意灵感、直觉、新感情', reversed: '情感不成熟、缺乏创意、拒绝直觉', keywords: ['创意', '直觉', '感情'] },
  { id: 47, name: 'Knight of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_knight.png', upright: '浪漫、魅力、追求理想', reversed: '情绪化、不切实际、逃避', keywords: ['浪漫', '魅力', '理想'] },
  { id: 48, name: 'Queen of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_queen.png', upright: '同情、直觉、情感支持', reversed: '情绪不稳定、缺乏同情、依赖', keywords: ['同情', '直觉', '支持'] },
  { id: 49, name: 'King of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_king.png', upright: '情感平衡、同情、控制', reversed: '情绪失控、冷漠、缺乏平衡', keywords: ['平衡', '同情', '控制'] },
  // ========== 小阿尔卡那 - 宝剑（Swords）14张 ==========
  { id: 50, name: 'Ace of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_ace.png', upright: '新想法、清晰、突破', reversed: '混乱、缺乏清晰、错误想法', keywords: ['清晰', '突破', '想法'] },
  { id: 51, name: 'Two of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_2.png', upright: '困难选择、僵局、平衡', reversed: '优柔寡断、逃避选择、不平衡', keywords: ['选择', '僵局', '平衡'] },
  { id: 52, name: 'Three of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_3.png', upright: '心碎、悲伤、分离', reversed: '恢复、宽恕、情感愈合', keywords: ['心碎', '悲伤', '分离'] },
  { id: 53, name: 'Four of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_4.png', upright: '休息、恢复、冥想', reversed: '疲惫、缺乏休息、过度工作', keywords: ['休息', '恢复', '冥想'] },
  { id: 54, name: 'Five of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_5.png', upright: '冲突、背叛、不公', reversed: '和解、宽恕、解决冲突', keywords: ['冲突', '背叛', '不公'] },
  { id: 55, name: 'Six of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_6.png', upright: '过渡、离开、前进', reversed: '无法前进、困在过去、延迟', keywords: ['过渡', '离开', '前进'] },
  { id: 56, name: 'Seven of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_7.png', upright: '欺骗、策略、逃避', reversed: '诚实、面对后果、承担责任', keywords: ['欺骗', '策略', '逃避'] },
  { id: 57, name: 'Eight of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_8.png', upright: '限制、自我怀疑、被困', reversed: '自由、自我接受、新视角', keywords: ['限制', '怀疑', '被困'] },
  { id: 58, name: 'Nine of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_9.png', upright: '焦虑、噩梦、恐惧', reversed: '希望、恢复、面对恐惧', keywords: ['焦虑', '噩梦', '恐惧'] },
  { id: 59, name: 'Ten of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_10.png', upright: '背叛、结束、痛苦', reversed: '恢复、新开始、释放', keywords: ['背叛', '结束', '痛苦'] },
  { id: 60, name: 'Page of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_page.png', upright: '好奇心、新想法、沟通', reversed: '缺乏焦点、八卦、错误信息', keywords: ['好奇', '想法', '沟通'] },
  { id: 61, name: 'Knight of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_knight.png', upright: '行动、冲动、直接', reversed: '鲁莽、缺乏方向、延迟', keywords: ['行动', '冲动', '直接'] },
  { id: 62, name: 'Queen of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_queen.png', upright: '清晰思考、独立、诚实', reversed: '冷酷、缺乏同情、偏见', keywords: ['清晰', '独立', '诚实'] },
  { id: 63, name: 'King of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_king.png', upright: '真理、公正、权威', reversed: '操纵、不公、滥用权力', keywords: ['真理', '公正', '权威'] },
  // ========== 小阿尔卡那 - 星币（Pentacles）14张 ==========
  { id: 64, name: 'Ace of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_ace.png', upright: '新机会、物质开始、潜力', reversed: '错失机会、缺乏规划、不稳定', keywords: ['机会', '物质', '潜力'] },
  { id: 65, name: 'Two of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_2.png', upright: '平衡优先、时间管理、适应', reversed: '不平衡、缺乏优先、过度承诺', keywords: ['平衡', '管理', '适应'] },
  { id: 66, name: 'Three of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_3.png', upright: '团队合作、协作、技能', reversed: '缺乏合作、不专业、孤立', keywords: ['合作', '协作', '技能'] },
  { id: 67, name: 'Four of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_4.png', upright: '控制、安全、节俭', reversed: '贪婪、物质主义、缺乏控制', keywords: ['控制', '安全', '节俭'] },
  { id: 68, name: 'Five of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_5.png', upright: '物质困难、孤立、贫困', reversed: '恢复、寻求帮助、新开始', keywords: ['困难', '孤立', '贫困'] },
  { id: 69, name: 'Six of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_6.png', upright: '慷慨、分享、给予', reversed: '自私、不平衡、债务', keywords: ['慷慨', '分享', '给予'] },
  { id: 70, name: 'Seven of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_7.png', upright: '长期观点、评估、耐心', reversed: '缺乏进展、挫折、不耐烦', keywords: ['长期', '评估', '耐心'] },
  { id: 71, name: 'Eight of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_8.png', upright: '技能发展、质量、专注', reversed: '缺乏质量、匆忙、缺乏技能', keywords: ['技能', '质量', '专注'] },
  { id: 72, name: 'Nine of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_9.png', upright: '财务独立、自给自足、享受', reversed: '缺乏独立、过度依赖、财务困难', keywords: ['独立', '自给', '享受'] },
  { id: 73, name: 'Ten of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_10.png', upright: '财富、家庭安全、长期成功', reversed: '财务损失、缺乏安全、家庭冲突', keywords: ['财富', '安全', '成功'] },
  { id: 74, name: 'Page of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_page.png', upright: '新机会、学习、务实', reversed: '缺乏机会、不切实际、拖延', keywords: ['机会', '学习', '务实'] },
  { id: 75, name: 'Knight of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_knight.png', upright: '效率、责任、方法', reversed: '懒惰、缺乏责任、拖延', keywords: ['效率', '责任', '方法'] },
  { id: 76, name: 'Queen of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_queen.png', upright: '实用、关怀、财务安全', reversed: '自我中心、物质主义、缺乏关怀', keywords: ['实用', '关怀', '安全'] },
  { id: 77, name: 'King of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_king.png', upright: '财务安全、实用、慷慨', reversed: '财务不稳定、贪婪、缺乏慷慨', keywords: ['安全', '实用', '慷慨'] },
];

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const shuffleCards = (cards: TarotCard[]): ShuffledTarotCard[] => {
  const cardsWithOrientation = cards.map(card => ({
    ...card,
    orientation: (Math.random() >= 0.5 ? 'upright' : 'reversed') as 'upright' | 'reversed',
  }));
  return shuffleArray(cardsWithOrientation);
};

const STORAGE_KEY = 'wealth_current_status_result';

const SLOT_CONFIG = [
  { id: "p1", name: "当前的财运状态", meaning: "你现在整体的金钱状况与能量基调，反映你当下与财富的关系。" },
  { id: "p2", name: "正在影响你财运的因素", meaning: "无论是外在环境、现实条件，还是你的选择与心态，正在对财运产生作用的关键因素。" },
  { id: "p3", name: "近期的财运走向与提醒", meaning: "接下来一段时间财运的整体趋势，以及你需要留意或调整的方向。" }
];

export default function CurrentWealthStatusDraw() {
  const router = useRouter();
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollValue, setScrollValue] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  
  const [selectedCards, setSelectedCards] = useState<(ShuffledTarotCard | null)[]>([null, null, null]);
  const [isAnimating, setIsAnimating] = useState<boolean[]>([false, false, false]);
  const [uiSlots, setUiSlots] = useState<(ShuffledTarotCard | null)[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // 图片预加载逻辑
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 分批预加载图片，避免瞬间占用过多带宽
    const preloadImages = async () => {
      // 优先预加载可能被抽到的前 20 张
      const cardsToPreload = tarotCards.map(c => c.image);
      
      for (let i = 0; i < cardsToPreload.length; i++) {
        const img = new Image();
        img.src = cardsToPreload[i];
        // 每加载 5 张稍微停顿一下，不阻塞主线程
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 100));
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setHasDrawn(true);
      setSelectedCards(parsed.cards);
    } else {
      setUiSlots(shuffleCards(tarotCards)); 
    }
  }, []);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;
    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 3) return;

    const card = uiSlots[slotIndex];
    if (!card) return;

    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

    const newSelectedCards = [...selectedCards];
    newSelectedCards[emptySlotIndex] = card;
    setSelectedCards(newSelectedCards);
    
    const newIsAnimating = [...isAnimating];
    newIsAnimating[emptySlotIndex] = true;
    setIsAnimating(newIsAnimating);
    
    setUiSlots(prev => prev.map((c, i) => (i === slotIndex ? null : c)));

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    newIsAnimating[emptySlotIndex] = false;
    setIsAnimating([...newIsAnimating]);
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoading(false);

    if (newSelectedCards.filter(c => c !== null).length === 3) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: Date.now(),
        cards: newSelectedCards
      }));
      setHasDrawn(true);
    }
  };

  const handleStartReading = () => {
    router.push('/themed-readings/wealth/current-wealth-status/reading');
  };

  const handleReset = () => {
    if (!confirm('确定要重新开始吗？当前结果将被清空。')) return;
    localStorage.removeItem(STORAGE_KEY);
    setHasDrawn(false);
    setSelectedCards([null, null, null]);
    setIsAnimating([false, false, false]);
    setUiSlots(shuffleCards(tarotCards));
    setScrollValue(0);
  };

  return (
    <div className="dark">
      <Head>
        <title>我现在的财运如何？ - 抽牌</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
      </Head>

      <div className="font-display bg-[#191022] min-h-screen text-white">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 sm:px-8 py-3 bg-[#191022]/80 backdrop-blur-sm">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="text-sm font-medium">返回</span>
          </button>
          <h2 className="text-lg font-bold">Mystic Insights</h2>
          <button onClick={handleReset} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">refresh</span>
            <span className="text-sm font-medium hidden sm:inline">重置</span>
          </button>
        </header>

        <main className="px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary mb-3">Wealth Readings</p>
              <h1 className="text-3xl sm:text-5xl font-black mb-4">
                {hasDrawn ? '财运牌阵已完成' : '我现在的财运如何？'}
              </h1>
              <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                {hasDrawn ? '卡牌已就位，点击下方按钮开始深度解读。' : '用三张牌快速看清你当前的财运状态、影响因素与近期走向。请从下方牌堆中抽取 3 张牌。'}
              </p>
            </div>

            {!hasDrawn && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <div className="card-container-wrapper w-full mb-6">
                  <div 
                    ref={containerRef} 
                    onScroll={() => {
                      if (!containerRef.current) return;
                      const max = containerRef.current.scrollWidth - containerRef.current.clientWidth;
                      setScrollValue((containerRef.current.scrollLeft / max) * 100);
                    }} 
                    className="card-container flex flex-row overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide"
                  >
                    {uiSlots.map((card, index) => card ? (
                      <CardItem key={card.id} card={card} index={index} onClick={drawCard} isDisabled={isLoading} isSelected={false} />
                    ) : (
                      <EmptySlot key={`empty-${index}`} index={index} />
                    ))}
                  </div>
                </div>
                <ScrollBar value={scrollValue} onChange={(val) => {
                  if (!containerRef.current) return;
                  const max = containerRef.current.scrollWidth - containerRef.current.clientWidth;
                  containerRef.current.scrollLeft = (val / 100) * max;
                  setScrollValue(val);
                }} disabled={isLoading} />
                <div className="mt-6 text-center text-white/40 text-sm font-medium">
                  已抽牌：{selectedCards.filter(c => c !== null).length} / 3
                </div>
              </motion.div>
            )}

            <WealthThreeCardSlots
              cards={selectedCards}
              isAnimating={isAnimating}
              showLoadingText={!hasDrawn}
              forceFlipped={hasDrawn}
              slotConfig={SLOT_CONFIG}
            />

            {hasDrawn && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-16 pb-20">
                <button
                  onClick={handleStartReading}
                  className="px-12 py-4 rounded-xl bg-primary text-white font-bold text-xl shadow-glow transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#7f13ec' }}
                >
                  开始解读
                </button>
                <p className="text-white/40 text-sm mt-6">
                  ✨ 深度洞察金钱能量，把握财富机遇
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="px-6 py-3 rounded-full bg-background-dark/90 border border-white/10 backdrop-blur-md text-white shadow-glow flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">info</span>
          <span className="text-sm font-bold">解读功能即将上线</span>
        </div>
      </div>

      <style jsx global>{`
        .card-container::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
