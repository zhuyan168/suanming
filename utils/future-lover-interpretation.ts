/**
 * 未来恋人牌阵 - 基础解读生成工具
 * 使用牌义关键词 + 牌位模板生成可读的基础解读
 */

import { TarotCard } from '../components/fortune/CardItem';

interface ShuffledTarotCard extends TarotCard {
  orientation: 'upright' | 'reversed';
}

interface BasicInterpretation {
  slotKey: string;
  title: string;
  text: string;
}

// 牌位配置（与结果页保持一致）
const SLOT_CONFIG = [
  { 
    key: 'guide', 
    title: '指引牌',
    promptTemplates: [
      '这张牌提醒你，当下需要{keywords}的心态来面对感情。{orientation}的能量指向{suggestion}。保持这样的状态，有助于你在关系中更加{benefit}。',
      '在这段探索未来恋人的过程中，{keywords}是你当前最需要的能量。{orientation}意味着{implication}，建议你{action}。',
      '{keywords}的特质将引导你的感情方向。{orientation}显示{situation}，你可以尝试{recommendation}来调整状态。',
    ]
  },
  { 
    key: 'type', 
    title: '他 / 她是什么类型',
    promptTemplates: [
      'TA 可能是一个{keywords}的人。{orientation}暗示TA 在外显行为上{behavior}，在情感表达方面{expression}。你们的相遇可能带有{quality}的色彩。',
      '从牌面来看，TA 的性格特质偏向{keywords}。{orientation}表明TA {trait}，在关系中TA 倾向于{tendency}。',
      '你的未来恋人可能具备{keywords}的气质。{orientation}说明TA {characteristic}，你们之间的吸引力源自{attraction}。',
    ]
  },
  { 
    key: 'appeared', 
    title: '他 / 她已经出现了吗？',
    promptTemplates: [
      '{keywords}的能量显示，TA {appearanceStatus}。{orientation}意味着{timing}。注意观察{signal}，这些可能是识别的信号。',
      '关于TA 是否已经出现，牌面呈现{keywords}的状态。{orientation}暗示{status}。你可以留意{area}这些生活场景。',
      '这个牌位上的{keywords}能量表明{presence}。{orientation}显示{phase}，建议你{advice}。',
    ]
  },
  { 
    key: 'obstacle', 
    title: '遇到的阻力',
    promptTemplates: [
      '当前的主要阻力来自{keywords}层面。{orientation}指出{source}可能会成为障碍。温和提醒你：{reminder}。',
      '{keywords}的能量揭示了潜在的阻碍因素。{orientation}说明{challenge}，你需要意识到{awareness}。',
      '你们之间可能遇到{keywords}方面的阻力。{orientation}表明{blockage}，建议你{approach}来化解。',
    ]
  },
  { 
    key: 'pattern', 
    title: '相处模式',
    promptTemplates: [
      '你们的相处模式可能呈现{keywords}的特点。{orientation}显示互动节奏{rhythm}，在沟通方式上{communication}。建议你{tip}。',
      '{keywords}的能量勾勒出你们的相处画面。{orientation}意味着关系的进展{pace}，情感表达{emotion}。',
      '关系的节奏会是{keywords}的。{orientation}暗示你们{dynamic}，在日常互动中{interaction}。',
    ]
  },
  { 
    key: 'how_to_meet', 
    title: '怎样才能遇到他 / 她',
    promptTemplates: [
      '要更接近相遇，你需要{keywords}的状态和行动。{orientation}建议你{action}。具体来说，可以尝试{scenario}这样的场景或活动。',
      '{keywords}是遇到TA 的关键。{orientation}指出{path}，你可以在{location}增加相遇的可能性。同时，保持{mindset}的心态。',
      '相遇的路径与{keywords}相关。{orientation}显示{method}。建议你主动{initiative}，并在{context}中保持开放和真诚。',
    ]
  },
];

// 辅助词库：根据牌的正逆位和类型生成动态内容
const getDynamicContent = (
  card: ShuffledTarotCard,
  slotKey: string
): Record<string, string> => {
  const isUpright = card.orientation === 'upright';
  const keywords = card.keywords.join('、');

  // 根据不同牌位返回不同的动态内容
  const contentMap: Record<string, Record<string, string>> = {
    guide: {
      keywords,
      orientation: isUpright ? '正位' : '逆位',
      suggestion: isUpright 
        ? '积极拥抱当下的可能性，相信自己的直觉和感受'
        : '反思过往模式，温和地调整期待与行动方式',
      benefit: isUpright ? '清晰、自信且充满活力' : '更加理性、有边界感',
      implication: isUpright
        ? '你正处于一个适合开放和接纳的阶段'
        : '你可能需要先处理一些内在的困惑或阻碍',
      action: isUpright
        ? '保持好奇心，多接触新的社交圈和活动'
        : '给自己一些独处时间，梳理真正想要的关系状态',
      situation: isUpright
        ? '你的内在能量是流动且积极的'
        : '可能存在一些尚未释放的过往情绪',
      recommendation: isUpright
        ? '主动表达、扩展社交'
        : '整理情绪、设定清晰的关系边界',
    },
    type: {
      keywords,
      orientation: isUpright ? '正位' : '逆位',
      behavior: isUpright
        ? '会比较主动、清晰地表达自己'
        : '可能内敛、需要时间打开心扉',
      expression: isUpright
        ? '相对直接且真诚'
        : '委婉或需要更多安全感',
      quality: isUpright ? '明朗、开放' : '深沉、需要理解',
      trait: isUpright
        ? '展现出这些特质的明亮面'
        : '这些特质可能以较为隐藏或复杂的方式呈现',
      tendency: isUpright
        ? '给予支持、主动投入'
        : '保护自己、需要被看见',
      characteristic: isUpright
        ? '具备这些特质的成熟展现'
        : '这些面向可能尚在发展或有所保留',
      attraction: isUpright
        ? '你们在价值观和生活方式上的契合'
        : '深层的情感共鸣和相互理解的需要',
    },
    appeared: {
      keywords,
      orientation: isUpright ? '正位' : '逆位',
      appearanceStatus: isUpright
        ? '可能已经在你的生活圈中，或即将以自然的方式出现'
        : '可能尚未直接出现，或者你们曾有过交集但未曾注意',
      timing: isUpright
        ? '时机正在成熟，保持开放的态度'
        : '可能需要一些时间或契机，不必着急',
      signal: isUpright
        ? '有共同话题、舒适的相处感、自然的互动'
        : '重复出现的人或场景、意外的连结、被忽略的细节',
      status: isUpright
        ? 'TA 很可能已经在你的视野中，只是尚未被明确识别'
        : 'TA 可能还没有直接进入你的生活，或者需要更多的机缘',
      area: isUpright
        ? '工作场合、兴趣社群、朋友介绍'
        : '陌生社交场景、线上平台、偶然的相遇',
      presence: isUpright
        ? 'TA 出现的概率较高，你们可能有过接触'
        : 'TA 的出现可能需要你更主动地拓展生活圈',
      phase: isUpright
        ? '你们正处于可能建立连接的阶段'
        : '相遇的时机可能尚未完全就绪',
      advice: isUpright
        ? '多观察身边的人，留意那些让你感觉舒适的互动'
        : '扩大社交范围，给自己更多认识新朋友的机会',
    },
    obstacle: {
      keywords,
      orientation: isUpright ? '正位' : '逆位',
      source: isUpright
        ? '外部环境或时机'
        : '内在心态或过往经验',
      reminder: isUpright
        ? '这些障碍是暂时的，保持耐心和积极行动可以化解'
        : '关注自己的内心状态，必要时寻求支持和调整',
      challenge: isUpright
        ? '外在条件（如距离、忙碌、环境）可能带来挑战'
        : '内在恐惧、自我怀疑或过去的伤痛需要被看见',
      awareness: isUpright
        ? '这些实际问题是可以通过沟通和协调解决的'
        : '你的情绪和信念模式对关系的影响',
      blockage: isUpright
        ? '现实层面的限制或节奏不一致'
        : '情感层面的防御或不确定感',
      approach: isUpright
        ? '保持开放的沟通，灵活调整计划'
        : '温柔地面对自己的情绪，给关系更多时间和空间',
    },
    pattern: {
      keywords,
      orientation: isUpright ? '正位' : '逆位',
      rhythm: isUpright
        ? '会相对顺畅、自然'
        : '可能需要更多磨合，节奏较慢或有波动',
      communication: isUpright
        ? '你们能够坦诚交流，相互理解'
        : '可能存在误解或表达不畅，需要耐心',
      tip: isUpright
        ? '享受这份流动感，同时保持真实的自己'
        : '给彼此足够的空间和时间，不急于求成',
      pace: isUpright
        ? '会比较稳定且有明确的方向'
        : '可能时快时慢，需要双方的适应和调整',
      emotion: isUpright
        ? '会相对直接且温暖'
        : '可能需要更多的试探和确认',
      dynamic: isUpright
        ? '能够自然地分享和支持彼此'
        : '可能需要刻意营造安全感和信任',
      interaction: isUpright
        ? '会有很多轻松愉快的时刻'
        : '需要更多的理解和包容',
    },
    how_to_meet: {
      keywords,
      orientation: isUpright ? '正位' : '逆位',
      action: isUpright
        ? '主动扩展社交圈，参与你感兴趣的活动'
        : '先调整自己的状态，让自己变得更加稳定和开放',
      scenario: isUpright
        ? '参加社交活动、兴趣课程、朋友聚会'
        : '独处沉淀、自我成长、在舒适的小圈子中交流',
      path: isUpright
        ? '主动行动是关键，机会往往来自你的尝试'
        : '内在调整是前提，当你准备好了，相遇会自然发生',
      location: isUpright
        ? '热闹的社交场合、兴趣小组、线上社群'
        : '安静的咖啡馆、书店、艺术展览等有深度的空间',
      mindset: isUpright
        ? '轻松、好奇、不设限'
        : '真诚、沉稳、不着急',
      method: isUpright
        ? '通过行动和连接来创造机会'
        : '通过成长和准备来吸引对的人',
      initiative: isUpright
        ? '出门、社交、表达兴趣'
        : '学习、反思、完善自己',
      context: isUpright
        ? '各种新鲜的社交场景'
        : '深度的对话和真实的连接',
    },
  };

  return contentMap[slotKey] || {};
};

/**
 * 生成单张牌的基础解读
 */
const generateBasicInterpretation = (
  card: ShuffledTarotCard,
  slotKey: string,
  title: string
): string => {
  const config = SLOT_CONFIG.find(c => c.key === slotKey);
  if (!config) return '解读生成失败，请稍后再试。';

  // 随机选择一个模板
  const template = config.promptTemplates[
    Math.floor(Math.random() * config.promptTemplates.length)
  ];

  // 获取动态内容
  const dynamicContent = getDynamicContent(card, slotKey);

  // 替换模板中的占位符
  let result = template;
  Object.keys(dynamicContent).forEach(key => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), dynamicContent[key]);
  });

  return result;
};

/**
 * 为 6 张牌生成完整的基础解读
 */
export const generateFutureLoverBasicReading = (
  cards: ShuffledTarotCard[]
): BasicInterpretation[] => {
  if (cards.length !== 6) {
    throw new Error('未来恋人牌阵需要 6 张牌');
  }

  return SLOT_CONFIG.map((config, index) => ({
    slotKey: config.key,
    title: config.title,
    text: generateBasicInterpretation(cards[index], config.key, config.title),
  }));
};

/**
 * 生成一句话总结
 */
export const generateBasicSummary = (cards: ShuffledTarotCard[]): string => {
  const guideCard = cards[0];
  const typeCard = cards[1];
  const isGuideUpright = guideCard.orientation === 'upright';
  const isTypeUpright = typeCard.orientation === 'upright';

  const summaries = [
    `带着${guideCard.keywords[0]}的心态，去遇见${typeCard.keywords[0]}的TA。`,
    `${isGuideUpright ? '保持开放' : '温柔调整'}，你的未来恋人${isTypeUpright ? '正在靠近' : '值得等待'}。`,
    `这段关系需要${guideCard.keywords[0]}，而TA 会带来${typeCard.keywords[0]}。`,
    `用${guideCard.keywords[0]}的姿态，迎接${typeCard.keywords[0]}的相遇。`,
  ];

  return summaries[Math.floor(Math.random() * summaries.length)];
};

/**
 * 生成行动建议
 */
export const generateBasicActions = (cards: ShuffledTarotCard[]): string[] => {
  const howToMeetCard = cards[5];
  const isUpright = howToMeetCard.orientation === 'upright';

  const actions = [
    isUpright
      ? '本周参加至少一次社交活动或兴趣小组'
      : '每天留出30分钟独处时间，整理自己的情感状态',
    isUpright
      ? '主动与朋友交流，扩大社交圈'
      : '列出你理想伴侣的5个核心特质，明确自己的期待',
    isUpright
      ? '尝试一个新的兴趣爱好，增加认识新朋友的机会'
      : '完成一件能提升自信的小事，让自己更加从容',
  ];

  return actions;
};

