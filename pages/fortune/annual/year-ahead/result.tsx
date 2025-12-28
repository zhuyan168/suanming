import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import YearAheadSlots from '../../../../components/fortune/YearAheadSlots';
import { TarotCard } from '../../../../components/fortune/CardItem';

// 完整的78张塔罗牌数据 (用于数据验证和修复)
const tarotCards: TarotCard[] = [
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
  { id: 36, name: 'Ace of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_ace.png', upright: '新感情、情感开始、直觉', reversed: '情感空虚、失去连接、拒绝爱', keywords: ['情感', '直觉', '开始'] },
  { id: 37, name: 'Two of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_2.png', upright: '伙伴关系、结合、相互吸引', reversed: '关系破裂、不平衡、分离', keywords: ['伙伴', '结合', '吸引'] },
  { id: 38, name: 'Three of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_3.png', upright: '友谊、庆祝、社交', reversed: '孤立、过度社交、冲突', keywords: ['友谊', '庆祝', '社交'] },
  { id: 39, name: 'Four of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_4.png', upright: '沉思、内省、错过机会', reversed: '觉醒、新机会、接受', keywords: ['沉思', '内省', '机会'] },
  { id: 40, name: 'Five of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_5.png', upright: '失落、悲伤、遗憾', reversed: '接受、宽恕、前进', keywords: ['失落', '悲伤', '遗憾'] },
  { id: 41, name: 'Six of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_6.png', upright: '怀旧、回忆、纯真', reversed: '困在过去、拒绝成长、不成熟', keywords: ['怀旧', '回忆', '纯真'] },
  { id: 42, name: 'Seven of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_7.png', upright: '选择、幻想、可能性', reversed: '缺乏焦点、混乱、错误选择', keywords: ['选择', '幻想', '可能'] },
  { id: 43, name: 'Eight of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_8.png', upright: '放弃、寻找更深意义、离开', reversed: '停滞、恐惧改变、逃避', keywords: ['放弃', '寻找', '离开'] },
  { id: 44, name: 'Nine of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_9.png', upright: '满足、情感满足、愿望实现', reversed: '缺乏满足、物质主义、过度', keywords: ['满足', '实现', '愿望'] },
  { id: 45, name: 'Ten of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_10.png', upright: '和谐、家庭幸福、圆满', reversed: '不和谐、家庭冲突、缺乏支持', keywords: ['和谐', '幸福', '圆满'] },
  { id: 46, name: 'Page of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_page.png', upright: '创意灵感、直觉、新感情', reversed: '情感不成熟、缺乏创意、拒绝直觉', keywords: ['创意', '直觉', '感情'] },
  { id: 47, name: 'Knight of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_knight.png', upright: '浪漫、魅力、追求理想', reversed: '情绪化、不切实际、逃避', keywords: ['浪漫', '魅力', '理想'] },
  { id: 48, name: 'Queen of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_queen.png', upright: '同情、直觉、情感支持', reversed: '情绪不稳定、缺乏同情、依赖', keywords: ['同情', '直觉', '支持'] },
  { id: 49, name: 'King of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_king.png', upright: '情感平衡、同情、控制', reversed: '情绪失控、冷漠、缺乏平衡', keywords: ['平衡', '同情', '控制'] },
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

// ============ 工具函数 ============

// 获取当前年份（yyyy格式）
const getCurrentYear = () => {
  const now = new Date();
  return now.getFullYear().toString();
};

// ============ localStorage 存取函数 ============

// 获取年度运势的 key
const getYearAheadKey = (year: string): string => {
  return `year_ahead_${year}`;
};

// API返回的详细解读卡片结构
interface YearAheadResultCard {
  position: string;
  name: string;
  orientation: 'upright' | 'reversed';
  meaning: string;
}

// 年度运势数据接口
interface YearAheadResult {
  userId?: string | null;
  year: string;
  cards: Array<{
    id: number;
    name: string;
    image: string;
    upright: string;
    reversed: string;
    keywords: string[];
    orientation: 'upright' | 'reversed';
  }>;
  result?: {
    year: string;
    summary: string;
    cards: YearAheadResultCard[];
  };
  createdAt: number;
}

// 显示用的卡片类型
interface ShuffledTarotCard {
  id: number;
  name: string;
  image: string;
  upright: string;
  reversed: string;
  keywords: string[];
  orientation: 'upright' | 'reversed';
}

// 加载年度运势数据
const loadYearAheadResult = (year: string): YearAheadResult | null => {
  if (typeof window === 'undefined') return null;
  const key = getYearAheadKey(year);
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    const result = JSON.parse(stored) as YearAheadResult;
    // 验证数据完整性
    if (result.cards && result.cards.length === 13 && result.year) {
      return result;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse year ahead result:', e);
    return null;
  }
};

// 保存年度运势数据
const saveYearAheadResult = (data: YearAheadResult): void => {
  if (typeof window === 'undefined') return;
  const key = getYearAheadKey(data.year);
  
  // 确保 cards 包含 orientation
  const validatedData = {
    ...data,
    cards: data.cards.map(card => ({
      ...card,
      orientation: card.orientation || 'upright'
    }))
  };
  
  localStorage.setItem(key, JSON.stringify(validatedData));
};

// Loading组件
function MagicalLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* 3D 翻转塔罗牌 */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative w-32 h-48 rounded-xl"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* 卡牌正面 */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-amber-600 shadow-2xl flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              boxShadow: '0 0 40px rgba(127, 19, 236, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✨
            </motion.div>
          </motion.div>

          {/* 卡牌背面 */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-600 via-purple-600 to-primary shadow-2xl flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: '0 0 40px rgba(217, 119, 6, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <motion.div
              className="w-20 h-28 border-4 border-white/40 rounded-lg relative overflow-hidden"
              animate={{
                borderColor: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {/* 神秘花纹 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-white/60 text-4xl"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  ☆
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 卡牌下方光晕 */}
        <motion.div
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-primary/30 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* 文字提示 */}
      <div className="text-center space-y-3">
        <motion.p
          className="text-white text-xl font-bold"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          正在为你揭示命运指引...
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-primary/70 text-sm">✦</span>
          <span className="text-white/50 text-sm">连接宇宙能量</span>
          <span className="text-primary/70 text-sm">✦</span>
        </motion.div>
      </div>
    </div>
  );
}

export default function YearAheadResultPage() {
  const router = useRouter();
  const currentYear = getCurrentYear();
  
  const [savedResult, setSavedResult] = useState<YearAheadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化：读取localStorage中的数据
  useEffect(() => {
    const result = loadYearAheadResult(currentYear);

    // 如果没有数据，跳回抽牌页
    if (!result) {
      router.push('/fortune/annual/year-ahead');
      return;
    }

    setSavedResult(result);

    // 如果没有解析结果，调用API生成
    if (!result.result) {
      generateFortune(result);
    } else {
      setIsLoading(false);
    }

  }, [currentYear, router]);

  const generateFortune = async (result: YearAheadResult) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/year-ahead-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: result.cards,
          year: `${currentYear}年`,
          positions: [
            "一月", "二月", "三月", "四月", "五月", "六月",
            "七月", "八月", "九月", "十月", "十一月", "十二月",
            "年度主题牌"
          ]
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '获取运势失败');
      }

      const data = await response.json();
      
      // 更新结果并保存到localStorage
      const updatedResult: YearAheadResult = {
        ...result,
        result: data,
      };

      saveYearAheadResult(updatedResult);
      setSavedResult(updatedResult);
    } catch (err: any) {
      console.error('❌ 生成运势错误:', err);
      setError(err.message || '生成运势失败，请稍后重试');
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleBackToAnnual = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Year Ahead 解析 - Mystic Insights</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <div className="dark">
          <div className="font-display bg-background-dark min-h-screen text-white flex items-center justify-center">
            <MagicalLoading />
          </div>
        </div>
      </>
    );
  }

  if (!savedResult) {
    return null;
  }

  // 准备显示用的卡片数据
  const displayCards: ShuffledTarotCard[] = savedResult.cards.map(card => {
    return {
      id: card.id,
      name: card.name,
      image: card.image,
      upright: card.upright,
      reversed: card.reversed,
      keywords: card.keywords,
      orientation: card.orientation,
    };
  });

  const monthLabels = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
    "年度主题牌"
  ];

  return (
    <>
      <Head>
        <title>Year Ahead 解析 - Mystic Insights</title>
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
          @keyframes breathe-glow {
            0%, 100% {
              box-shadow: 0 0 20px 2px rgba(127, 19, 236, 0.3), 
                          0 0 40px 4px rgba(127, 19, 236, 0.2),
                          inset 0 0 20px 2px rgba(127, 19, 236, 0.1);
            }
            50% {
              box-shadow: 0 0 30px 4px rgba(127, 19, 236, 0.5), 
                          0 0 60px 8px rgba(127, 19, 236, 0.3),
                          inset 0 0 30px 4px rgba(127, 19, 236, 0.15);
            }
          }
          .animate-breathe-glow {
            animation: breathe-glow 3s ease-in-out infinite;
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
        <div className="font-display bg-background-dark min-h-screen text-white">
          {/* 头部 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm">
            <button
              onClick={handleBackToAnnual}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">返回首页</span>
            </button>
            <div className="flex items-center gap-4 text-white">
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Mystic Insights</h2>
            </div>
            <div className="w-20"></div>
          </header>

          {/* 主内容 */}
          <main className="px-2 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-10 md:py-16">
            <div className="mx-auto max-w-7xl">
              {/* 标题区域 */}
              <div className="text-center mb-8 sm:mb-12 px-2">
                <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary mb-3 sm:mb-4">Year Ahead Spread</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3 sm:mb-4">
                  {savedResult.result?.year || `${currentYear}年`} 年度指引
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  洞察未来一年的能量流向，把握每月命运关键。
                </p>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-8 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-center">
                  {error}
                </div>
              )}

              {/* 13张卡牌展示 */}
              <div className="mb-12">
                <YearAheadSlots
                  cards={displayCards}
                  isAnimating={Array(13).fill(false)}
                  showLoadingText={false}
                  forceFlipped={true}
                />
              </div>

              {/* 解析内容 */}
              {isGenerating ? (
                <div className="flex items-center justify-center py-20">
                  <MagicalLoading />
                </div>
              ) : savedResult.result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  {/* 年度总结 */}
                  <div className="p-6 sm:p-8 rounded-3xl border border-primary/30 bg-primary/5 backdrop-blur-sm">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-primary">年度能量概览</h2>
                    <p className="text-white/90 text-lg leading-relaxed whitespace-pre-line">
                      {savedResult.result.summary}
                    </p>
                  </div>

                  {/* 各月详细解析 */}
                  <div className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8">月度详细指引</h2>
                    {savedResult.result.cards.map((cardResult, index) => {
                      const card = savedResult.cards[index];
                      const isYearTheme = index === 12; // 第13张是年度主题牌
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`p-6 rounded-2xl border backdrop-blur-sm ${
                            isYearTheme 
                              ? 'border-primary/50 bg-primary/10 animate-breathe-glow' 
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row gap-6">
                            {/* 卡牌图片 */}
                            <div className="flex-shrink-0 mx-auto sm:mx-0">
                              <div className={`relative rounded-lg overflow-hidden border-2 ${
                                isYearTheme ? 'border-primary w-32 h-48' : 'border-white/20 w-24 h-36'
                              }`}>
                                <img
                                  src={card.image}
                                  alt={card.name}
                                  className={`w-full h-full object-cover ${
                                    card.orientation === 'reversed' ? 'rotate-180' : ''
                                  }`}
                                  style={{
                                    backgroundColor: 'white',
                                    transform: card.orientation === 'reversed' ? 'rotate(180deg)' : 'none'
                                  }}
                                />
                              </div>
                            </div>

                            {/* 卡牌解析 */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                  isYearTheme 
                                    ? 'bg-primary text-white' 
                                    : 'bg-white/10 text-white/70'
                                }`}>
                                  {monthLabels[index]}
                                </span>
                                <span className={`text-sm font-medium ${
                                  card.orientation === 'upright' ? 'text-green-400' : 'text-amber-400'
                                }`}>
                                  {card.orientation === 'upright' ? '正位' : '逆位'}
                                </span>
                              </div>
                              
                              <h3 className={`font-bold mb-2 ${
                                isYearTheme ? 'text-2xl text-primary' : 'text-xl text-white'
                              }`}>
                                {card.name}
                              </h3>
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {card.keywords.map((keyword, kidx) => (
                                  <span
                                    key={kidx}
                                    className="px-2 py-1 text-xs rounded-md bg-white/10 text-white/60 border border-white/10"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                              
                              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                                {cardResult.meaning}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* 底部提示 */}
                  <div className="text-center text-white/50 text-sm mt-12 pt-8 border-t border-white/10">
                    <p>✨ 每年只能抽取一次年度运势</p>
                    <p className="mt-2">祝你{currentYear}年一切顺利，充满机遇与成长</p>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

