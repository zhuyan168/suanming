import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import CardItem, { TarotCard } from '../../../../components/fortune/CardItem';
import EmptySlot from '../../../../components/fortune/EmptySlot';
import ScrollBar from '../../../../components/fortune/ScrollBar';
import SixCardSlots from '../../../../components/fortune/SixCardSlots';

// 完整的78张塔罗牌数据
const tarotCards = [
  { id: 0, name: '0. The Fool', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fool.png', upright: '新的开始、信任直觉、勇敢冒险', reversed: '冲动行事、犹豫不决、方向不明', keywords: ['纯真', '自由', '机会'] },
  { id: 1, name: 'I. The Magician', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_magician.png', upright: '资源整合、贯彻执行、影响力', reversed: '分散注意、欺骗、缺乏计划', keywords: ['行动', '意志', '显化'] },
  { id: 2, name: 'II. The High Priestess', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_priestess.png', upright: '内在智慧、直觉洞察、保持沉静', reversed: '忽略直觉、情绪混乱、资讯不明', keywords: ['直觉', '秘密', '平衡'] },
  { id: 3, name: 'III. The Empress', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_empress.png', upright: '丰盛富足、创造力、母性关怀', reversed: '过度依赖、创造力受阻、缺乏滋养', keywords: ['丰盛', '创造', '滋养'] },
  { id: 4, name: 'IV. The Emperor', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_emperor.png', upright: '权威领导、逻辑思考、确立秩序', reversed: '控制过度、缺乏弹性、专制', keywords: ['权威', '结构', '掌控'] },
  { id: 5, name: 'V. The Hierophant', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hierophant.png', upright: '传统价值、精神指引、学习', reversed: '僵化守旧、叛逆、质疑', keywords: ['传统', '信仰', '教导'] },
  { id: 6, name: 'VI. The Lovers', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_lovers.png', upright: '爱的抉择、深层联结、价值统一', reversed: '关系失衡、价值冲突、错误选择', keywords: ['爱情', '选择', '连结'] },
  { id: 7, name: 'VII. The Chariot', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_chariot.png', upright: '意志前进、克服困难、决心', reversed: '失去方向、自我挫败、缺乏控制', keywords: ['胜利', '意志', '前进'] },
  { id: 8, name: 'VIII. Strength', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_strength.png', upright: '内在力量、勇气、温柔', reversed: '自我怀疑、缺乏信心、失控', keywords: ['勇气', '耐心', '温柔'] },
  { id: 9, name: 'IX. The Hermit', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hermit.png', upright: '内省寻找、独处静思、智慧觉醒', reversed: '孤独封闭、逃避现实、过度孤立', keywords: ['内省', '智慧', '独处'] },
  { id: 10, name: 'X. Wheel of Fortune', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fortune.png', upright: '命运转折、好运到来、循环', reversed: '坏运气、抗拒改变、失控', keywords: ['命运', '变化', '循环'] },
  { id: 11, name: 'XI. Justice', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_justice.png', upright: '公平正义、因果法则、真相', reversed: '不公平、偏见、逃避责任', keywords: ['正义', '平衡', '真相'] },
  { id: 12, name: 'XII. The Hanged Man', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hanged.png', upright: '换个角度、暂停等待、牺牲', reversed: '徒劳无功、拖延、抗拒', keywords: ['等待', '换位', '牺牲'] },
  { id: 13, name: 'XIII. Death', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_death.png', upright: '结束转化、重生、放下', reversed: '抗拒变化、停滞不前、恐惧', keywords: ['转化', '结束', '重生'] },
  { id: 14, name: 'XIV. Temperance', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_temperance.png', upright: '平衡和谐、节制、整合', reversed: '失衡、过度、缺乏耐心', keywords: ['平衡', '节制', '和谐'] },
  { id: 15, name: 'XV. The Devil', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_devil.png', upright: '束缚依赖、诱惑、物质', reversed: '解脱自由、觉察、打破枷锁', keywords: ['诱惑', '束缚', '欲望'] },
  { id: 16, name: 'XVI. The Tower', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_tower.png', upright: '突然变故、破坏重建、启示', reversed: '避免灾难、内部危机、恐惧', keywords: ['崩溃', '启示', '重建'] },
  { id: 17, name: 'XVII. The Star', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_star.png', upright: '希望重生、信心、灵感', reversed: '失去信心、绝望、缺乏目标', keywords: ['希望', '灵感', '信心'] },
  { id: 18, name: 'XVIII. The Moon', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_moon.png', upright: '潜意识、幻觉、直觉', reversed: '释放恐惧、直面真相、清晰', keywords: ['幻觉', '直觉', '未知'] },
  { id: 19, name: 'XIX. The Sun', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_sun.png', upright: '成功喜悦、光明、活力', reversed: '暂时挫折、过度乐观、延迟', keywords: ['成功', '喜悦', '活力'] },
  { id: 20, name: 'XX. Judgement', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_judgement.png', upright: '觉醒反思、救赎、新生', reversed: '自我批判、逃避、内疚', keywords: ['觉醒', '反思', '重生'] },
  { id: 21, name: 'XXI. The World', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_world.png', upright: '完成圆满、成就、整合', reversed: '未完成、缺乏收尾、延迟', keywords: ['完成', '成就', '圆满'] },
  
  // Minor Arcana - Cups (圣杯)
  { id: 22, name: 'Ace of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_ace.png', upright: '新的情感、爱的开始、直觉', reversed: '情感封闭、失去爱、空虚', keywords: ['爱', '直觉', '情感'] },
  { id: 23, name: 'Two of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_2.png', upright: '伙伴关系、相互吸引、连结', reversed: '关系失衡、分离、误解', keywords: ['伙伴', '连结', '平衡'] },
  { id: 24, name: 'Three of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_3.png', upright: '友谊庆祝、合作、社交', reversed: '孤立、过度放纵、三角关系', keywords: ['庆祝', '友谊', '创造'] },
  { id: 25, name: 'Four of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_4.png', upright: '冷漠、沉思、重新评估', reversed: '觉醒、新机会、动力', keywords: ['沉思', '不满', '内省'] },
  { id: 26, name: 'Five of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_5.png', upright: '失望悲伤、失去、遗憾', reversed: '接受、前进、宽恕', keywords: ['失去', '悲伤', '遗憾'] },
  { id: 27, name: 'Six of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_6.png', upright: '怀旧、童年、纯真', reversed: '活在过去、理想化、向前看', keywords: ['回忆', '纯真', '怀旧'] },
  { id: 28, name: 'Seven of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_7.png', upright: '选择太多、幻想、迷惑', reversed: '清晰、决心、专注', keywords: ['幻想', '选择', '迷惑'] },
  { id: 29, name: 'Eight of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_8.png', upright: '离开、寻找、放弃', reversed: '停滞、害怕改变、回归', keywords: ['离开', '寻找', '放弃'] },
  { id: 30, name: 'Nine of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_9.png', upright: '愿望实现、满足、幸福', reversed: '贪婪、不满足、虚荣', keywords: ['满足', '愿望', '幸福'] },
  { id: 31, name: 'Ten of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_10.png', upright: '家庭和谐、幸福、圆满', reversed: '家庭失和、价值观冲突、不稳定', keywords: ['家庭', '和谐', '幸福'] },
  { id: 32, name: 'Page of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_page.png', upright: '情感消息、创意、好奇', reversed: '情绪不稳、不成熟、逃避', keywords: ['创意', '直觉', '消息'] },
  { id: 33, name: 'Knight of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_knight.png', upright: '浪漫追求、魅力、理想', reversed: '不切实际、情绪化、虚假', keywords: ['浪漫', '追求', '理想'] },
  { id: 34, name: 'Queen of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_queen.png', upright: '同理心、直觉、情感成熟', reversed: '情绪不稳、依赖、不真诚', keywords: ['同理心', '直觉', '关怀'] },
  { id: 35, name: 'King of Cups', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_king.png', upright: '情感掌控、平衡、智慧', reversed: '情感压抑、冷漠、操控', keywords: ['平衡', '智慧', '掌控'] },
  
  // Minor Arcana - Pentacles (星币)
  { id: 36, name: 'Ace of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_ace.png', upright: '新机会、繁荣、物质', reversed: '失去机会、贪婪、不稳定', keywords: ['机会', '繁荣', '物质'] },
  { id: 37, name: 'Two of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_2.png', upright: '平衡、适应、多任务', reversed: '失衡、压力、混乱', keywords: ['平衡', '适应', '灵活'] },
  { id: 38, name: 'Three of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_3.png', upright: '团队合作、技能、学习', reversed: '缺乏团队、技能不足、低质量', keywords: ['合作', '技能', '学习'] },
  { id: 39, name: 'Four of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_4.png', upright: '安全、控制、保守', reversed: '贪婪、放手、失控', keywords: ['安全', '控制', '保守'] },
  { id: 40, name: 'Five of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_5.png', upright: '困难、贫困、疾病', reversed: '复苏、改善、希望', keywords: ['困难', '贫困', '孤立'] },
  { id: 41, name: 'Six of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_6.png', upright: '慷慨、施予、平衡', reversed: '自私、债务、单向', keywords: ['慷慨', '施予', '平衡'] },
  { id: 42, name: 'Seven of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_7.png', upright: '等待收获、投资、耐心', reversed: '没有收获、浪费、不耐烦', keywords: ['等待', '投资', '耐心'] },
  { id: 43, name: 'Eight of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_8.png', upright: '努力、技艺、投入', reversed: '粗心、缺乏野心、重复', keywords: ['努力', '技艺', '专注'] },
  { id: 44, name: 'Nine of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_9.png', upright: '独立、富足、优雅', reversed: '过度工作、物质主义、孤独', keywords: ['独立', '富足', '优雅'] },
  { id: 45, name: 'Ten of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_10.png', upright: '财富、家族、传承', reversed: '财务问题、家庭失和、不稳定', keywords: ['财富', '家族', '传承'] },
  { id: 46, name: 'Page of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_page.png', upright: '学习、计划、实用', reversed: '拖延、缺乏进展、不切实际', keywords: ['学习', '计划', '机会'] },
  { id: 47, name: 'Knight of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_knight.png', upright: '勤奋、责任、可靠', reversed: '懒惰、固执、无聊', keywords: ['勤奋', '责任', '可靠'] },
  { id: 48, name: 'Queen of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_queen.png', upright: '养育、实际、安全', reversed: '过度保护、物质主义、自私', keywords: ['养育', '实际', '安全'] },
  { id: 49, name: 'King of Pentacles', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_king.png', upright: '财富、成功、领导', reversed: '贪婪、物质主义、固执', keywords: ['财富', '成功', '领导'] },
  
  // Minor Arcana - Swords (宝剑)
  { id: 50, name: 'Ace of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_ace.png', upright: '新想法、清晰、突破', reversed: '困惑、混乱、误解', keywords: ['清晰', '突破', '真相'] },
  { id: 51, name: 'Two of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_2.png', upright: '僵局、逃避、决择', reversed: '混乱、信息过载、决定', keywords: ['僵局', '抉择', '平衡'] },
  { id: 52, name: 'Three of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_3.png', upright: '心碎、悲伤、痛苦', reversed: '恢复、宽恕、前进', keywords: ['心碎', '悲伤', '痛苦'] },
  { id: 53, name: 'Four of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_4.png', upright: '休息、恢复、沉思', reversed: '倦怠、压力、不安', keywords: ['休息', '恢复', '沉思'] },
  { id: 54, name: 'Five of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_5.png', upright: '冲突、失败、不和', reversed: '和解、宽恕、前进', keywords: ['冲突', '失败', '不和'] },
  { id: 55, name: 'Six of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_6.png', upright: '过渡、离开、前进', reversed: '困住、抗拒、停滞', keywords: ['过渡', '离开', '前进'] },
  { id: 56, name: 'Seven of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_7.png', upright: '欺骗、策略、逃避', reversed: '诚实、坦白、改过', keywords: ['欺骗', '策略', '逃避'] },
  { id: 57, name: 'Eight of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_8.png', upright: '束缚、限制、受困', reversed: '释放、自由、新视角', keywords: ['束缚', '限制', '受困'] },
  { id: 58, name: 'Nine of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_9.png', upright: '焦虑、担忧、噩梦', reversed: '希望、恢复、接受', keywords: ['焦虑', '担忧', '噩梦'] },
  { id: 59, name: 'Ten of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_10.png', upright: '结束、背叛、崩溃', reversed: '恢复、重生、逃脱', keywords: ['结束', '背叛', '崩溃'] },
  { id: 60, name: 'Page of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_page.png', upright: '好奇、警觉、新想法', reversed: '八卦、欺骗、草率', keywords: ['好奇', '警觉', '新想法'] },
  { id: 61, name: 'Knight of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_knight.png', upright: '雄心、冲动、快速', reversed: '鲁莽、不耐烦、咄咄逼人', keywords: ['雄心', '冲动', '快速'] },
  { id: 62, name: 'Queen of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_queen.png', upright: '独立、清晰、客观', reversed: '冷酷、苦涩、偏见', keywords: ['独立', '清晰', '客观'] },
  { id: 63, name: 'King of Swords', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_king.png', upright: '权威、真相、道德', reversed: '操控、残忍、专制', keywords: ['权威', '真相', '道德'] },
  
  // Minor Arcana - Wands (权杖)
  { id: 64, name: 'Ace of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_ace.png', upright: '新开始、灵感、创造', reversed: '缺乏方向、延迟、挫折', keywords: ['灵感', '创造', '开始'] },
  { id: 65, name: 'Two of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_2.png', upright: '计划、决定、发现', reversed: '犹豫、害怕未知、缺乏计划', keywords: ['计划', '决定', '发现'] },
  { id: 66, name: 'Three of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_3.png', upright: '扩展、远见、领导', reversed: '缺乏远见、延迟、障碍', keywords: ['扩展', '远见', '领导'] },
  { id: 67, name: 'Four of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_4.png', upright: '庆祝、和谐、家', reversed: '不稳定、缺乏支持、过渡', keywords: ['庆祝', '和谐', '家'] },
  { id: 68, name: 'Five of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_5.png', upright: '竞争、冲突、紧张', reversed: '和解、避免冲突、内心冲突', keywords: ['竞争', '冲突', '紧张'] },
  { id: 69, name: 'Six of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_6.png', upright: '胜利、成功、认可', reversed: '失败、缺乏认可、自负', keywords: ['胜利', '成功', '认可'] },
  { id: 70, name: 'Seven of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_7.png', upright: '挑战、坚持、防御', reversed: '压倒、放弃、退缩', keywords: ['挑战', '坚持', '防御'] },
  { id: 71, name: 'Eight of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_8.png', upright: '快速行动、进展、变化', reversed: '延迟、沮丧、失控', keywords: ['快速', '进展', '变化'] },
  { id: 72, name: 'Nine of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_9.png', upright: '韧性、勇气、坚持', reversed: '精疲力尽、偏执、放弃', keywords: ['韧性', '勇气', '坚持'] },
  { id: 73, name: 'Ten of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_10.png', upright: '负担、责任、压力', reversed: '释放、授权、放手', keywords: ['负担', '责任', '压力'] },
  { id: 74, name: 'Page of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_page.png', upright: '热情、探索、消息', reversed: '缺乏方向、拖延、坏消息', keywords: ['热情', '探索', '消息'] },
  { id: 75, name: 'Knight of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_knight.png', upright: '冒险、精力、冲动', reversed: '鲁莽、不耐烦、冲动', keywords: ['冒险', '精力', '冲动'] },
  { id: 76, name: 'Queen of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_queen.png', upright: '自信、独立、热情', reversed: '自私、嫉妒、不安', keywords: ['自信', '独立', '热情'] },
  { id: 77, name: 'King of Wands', image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_king.png', upright: '领导、愿景、企业家', reversed: '专制、冲动、控制', keywords: ['领导', '愿景', '企业家'] },
];

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

// Fisher-Yates 洗牌算法
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 洗牌函数：打乱卡牌顺序并为每张牌分配正逆位
const shuffleCards = (cards: TarotCard[]): ShuffledTarotCard[] => {
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
  
  return shuffleArray(cardsWithOrientation);
};

// 生成唯一的 session ID
const generateSessionId = (): string => {
  return `future-lover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// LocalStorage key
const STORAGE_KEY = 'future_lover_result';

// 结果数据接口
interface FutureLoverResult {
  sessionId: string;
  timestamp: number;
  cards: ShuffledTarotCard[];
}

// 保存结果到 localStorage
const saveFutureLoverResult = (data: FutureLoverResult) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 从 localStorage 读取结果
const loadFutureLoverResult = (): FutureLoverResult | null => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load future lover result:', error);
    return null;
  }
};

export default function FutureLoverDraw() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>('');
  
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedResult, setSavedResult] = useState<FutureLoverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(true);
  const [scrollValue, setScrollValue] = useState(0);
  
  // 6张卡槽的状态
  const initialSlots: (ShuffledTarotCard | null)[] = Array(6).fill(null);
  const [selectedCards, setSelectedCards] = useState<(ShuffledTarotCard | null)[]>(initialSlots);
  const [isAnimating, setIsAnimating] = useState<boolean[]>(Array(6).fill(false));
  
  // deck: 实际剩余可抽的牌
  const [deck, setDeck] = useState<ShuffledTarotCard[]>([]);
  // uiSlots: 用于页面卡背渲染的数组
  const [uiSlots, setUiSlots] = useState<(ShuffledTarotCard | null)[]>([]);
  
  // 卡牌容器引用，用于滚动同步
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollValueRef = useRef(scrollValue);

  // 更新 scrollValueRef
  useEffect(() => {
    scrollValueRef.current = scrollValue;
  }, [scrollValue]);

  // 容器滚动处理
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || isScrollingRef.current) return;
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    const value = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
    setScrollValue(value);
  };

  // 初始化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 尝试加载已保存的结果
    const saved = loadFutureLoverResult();
    if (saved) {
      setSavedResult(saved);
      setHasDrawn(true);
      setSessionId(saved.sessionId);
      setSelectedCards(saved.cards);
    } else {
      // 生成新的 session ID
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      
      // 洗牌
      const shuffled = shuffleCards(tarotCards);
      setDeck(shuffled);
      setUiSlots(shuffled);
    }
  }, []);

  const drawCard = async (slotIndex: number) => {
    if (isLoading || hasDrawn) return;

    const currentCardCount = selectedCards.filter(c => c !== null).length;
    if (currentCardCount >= 6) return;

    const card = uiSlots[slotIndex];
    if (!card) return;

    const emptySlotIndex = selectedCards.findIndex(c => c === null);
    if (emptySlotIndex === -1) return;

    const orientation = card.orientation;
    console.log(`🎴 抽到第${emptySlotIndex + 1}张卡牌: ${card.name}, 正逆位: ${orientation === 'upright' ? '正位' : '逆位'}`);
    
    const newSelectedCards = [...selectedCards];
    newSelectedCards[emptySlotIndex] = card;
    setSelectedCards(newSelectedCards);
    
    const newIsAnimating = [...isAnimating];
    newIsAnimating[emptySlotIndex] = true;
    setIsAnimating(newIsAnimating);
    
    setDeck(prev => prev.filter(c => c.id !== card.id));
    setUiSlots(prev => prev.map((c, i) => (i === slotIndex ? null : c)));

    setIsLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 150));
    newIsAnimating[emptySlotIndex] = false;
    setIsAnimating([...newIsAnimating]);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsLoading(false);

    const updatedCardCount = newSelectedCards.filter(c => c !== null).length;
    // 当抽满6张时保存
    if (updatedCardCount === 6) {
      const result: FutureLoverResult = {
        sessionId,
        timestamp: Date.now(),
        cards: newSelectedCards as ShuffledTarotCard[],
      };
      saveFutureLoverResult(result);
      setSavedResult(result);
      setHasDrawn(true);
    }
  };

  // 滚动条拖动处理
  const handleScrollBarChange = (value: number) => {
    const container = containerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.scrollLeft = (value / 100) * maxScroll;
    setScrollValue(value);

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 100);
  };

  const handleViewResult = () => {
    router.push('/themed-readings/love/future-lover/result');
  };

  const handleReturnToList = () => {
    router.back();
  };

  const handleReset = () => {
    if (typeof window === 'undefined') return;
    if (!confirm('确定要重新开始吗？当前结果将被清空。')) return;

    localStorage.removeItem(STORAGE_KEY);
    
    // 重置状态
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setHasDrawn(false);
    setSavedResult(null);
    setSelectedCards(Array(6).fill(null));
    setIsAnimating(Array(6).fill(false));
    
    // 重新洗牌
    const shuffled = shuffleCards(tarotCards);
    setDeck(shuffled);
    setUiSlots(shuffled);
  };

  return (
    <>
      <Head>
        <title>未来恋人牌阵 - 抽牌</title>
        <meta name="description" content="探索你的未来恋人" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                          }
                        }
                      };
                    }
                  };
                  document.head.appendChild(script);
                })();
              }
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          html.dark, html.dark body { background-color: #191022; }
        ` }} />
      </Head>

      <div className="dark">
        <div className="font-display bg-background-dark min-h-screen text-white" style={{ backgroundColor: '#191022' }}>
          {/* 顶部导航 */}
          <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 py-3 bg-background-dark/80 backdrop-blur-sm" style={{ backgroundColor: 'rgba(25, 16, 34, 0.8)' }}>
            <button
              onClick={handleReturnToList}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">返回</span>
            </button>
            
            <div className="flex items-center gap-4 text-white">
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Mystic Insights</h2>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span className="text-sm font-medium hidden sm:inline">重置</span>
            </button>
          </header>

          {/* 主内容 */}
          <main className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 sm:py-16">
            <div className="mx-auto max-w-7xl">
              {/* 标题介绍区域 */}
              <div className="text-center mb-12">
                <p className="text-base font-semibold uppercase tracking-[0.35em] text-primary mb-4">Future Lover Spread</p>
                <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                  {hasDrawn ? '未来恋人牌阵已完成' : '抽取六张塔罗牌'}
                </h1>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  {hasDrawn 
                    ? '你已完成抽牌，点击下方按钮查看详细解读。' 
                    : '静心感受，从下方78张牌中选择6张，探索你的未来恋人与相遇路径。'}
                </p>
              </div>

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
                    
                    {/* 牌堆区域 */}
                    <div className="card-container-wrapper w-full mb-4">
                      <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="card-container flex flex-row overflow-x-scroll overflow-y-hidden pb-2 px-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
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
                      <style jsx>{` .card-container::-webkit-scrollbar { display: none; } `}</style>
                    </div>

                    {/* 滚动条 */}
                    <ScrollBar value={scrollValue} onChange={handleScrollBarChange} disabled={isLoading} />

                    <div className="mt-4 sm:mt-8 mb-2 sm:mb-4 text-center text-white/50 text-xs sm:text-sm">
                      <p>已抽牌：{selectedCards.filter(c => c !== null).length} / 6</p>
                    </div>

                    {/* 卡槽区域 */}
                    <SixCardSlots
                      cards={selectedCards}
                      isAnimating={isAnimating}
                      showLoadingText={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 已完成状态 */}
              {hasDrawn && savedResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-5xl mx-auto"
                >
                  <SixCardSlots
                    cards={selectedCards}
                    isAnimating={Array(6).fill(false)}
                    showLoadingText={false}
                    forceFlipped={true}
                  />

                  <div className="text-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleViewResult}
                      className="px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(127,19,236,0.5)]"
                      style={{ backgroundColor: '#7f13ec' }}
                    >
                      查看解读
                    </motion.button>
                  </div>

                  <div className="text-center text-white/50 text-sm mt-6">
                    <p>✨ 已完成抽牌，可随时重新占卜</p>
                  </div>
                </motion.div>
              )}

              {/* 抽完6张后的查看按钮 */}
              {!hasDrawn && selectedCards.filter(c => c !== null).length === 6 && (
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
                    style={{ backgroundColor: '#7f13ec' }}
                  >
                    查看解读
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

