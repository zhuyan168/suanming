import { TarotCard } from '../components/fortune/CardItem';

/**
 * 完整的78张塔罗牌静态数据
 * 每张牌包含正位和逆位的关键词与含义
 * 含义规则：
 * - 只是一句话（不换行、不分段）
 * - 不重复关键词本身
 * - 描述一种常见状态/处境/心理感受
 * - 不使用"代表/象征/意味着命运/注定"等绝对或教材化表述
 */
export const tarotCards: TarotCard[] = [
  // Major Arcana (大阿尔克那)
  { 
    id: 0, 
    name: '0. The Fool', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fool.png',
    upright: {
      keywords: ['纯真', '自由', '机会'],
      meaning: '通常与全新开始、冒险尝试，以及对未知保持开放好奇的心态有关。'
    },
    reversed: {
      keywords: ['冲动', '犹豫', '方向不明'],
      meaning: '多指行动前缺乏准备、犹豫不决，或是对风险的恐惧阻碍了行动。'
    }
  },
  { 
    id: 1, 
    name: 'I. The Magician', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_magician.png',
    upright: {
      keywords: ['行动', '意志', '显化'],
      meaning: '常与资源整合、将想法付诸实践，以及运用技能达成目标有关。'
    },
    reversed: {
      keywords: ['分散', '欺骗', '缺乏计划'],
      meaning: '多指注意力分散、操控手段的使用，或是计划执行上的阻滞。'
    }
  },
  { 
    id: 2, 
    name: 'II. The High Priestess', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_priestess.png',
    upright: {
      keywords: ['直觉', '秘密', '平衡'],
      meaning: '通常涉及隐藏的信息、内在智慧的倾听，以及在行动前保持静观的状态。'
    },
    reversed: {
      keywords: ['忽略直觉', '情绪混乱', '资讯不明'],
      meaning: '多与内在声音被压抑、信息混乱不清，或是被表象干扰判断有关。'
    }
  },
  { 
    id: 3, 
    name: 'III. The Empress', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_empress.png',
    upright: {
      keywords: ['丰盛', '创造', '滋养'],
      meaning: '常与富足生机、创造力的自然流动，以及被温暖滋养的感受有关。'
    },
    reversed: {
      keywords: ['过度依赖', '创造力受阻', '缺乏滋养'],
      meaning: '多指对外界支持的过度依赖、创造力的阻滞，或是缺少滋养的环境。'
    }
  },
  { 
    id: 4, 
    name: 'IV. The Emperor', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_emperor.png',
    upright: {
      keywords: ['权威', '结构', '掌控'],
      meaning: '通常涉及秩序建立、理性决策，以及通过规则和计划掌握局面。'
    },
    reversed: {
      keywords: ['控制过度', '缺乏弹性', '专制'],
      meaning: '多指过度管控、僵化的规则，或是权威使用不当带来的压迫感。'
    }
  },
  { 
    id: 5, 
    name: 'V. The Hierophant', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hierophant.png',
    upright: {
      keywords: ['传统', '信仰', '教导'],
      meaning: '常与既有体系的遵循、精神层面的指引，以及向经验学习有关。'
    },
    reversed: {
      keywords: ['僵化守旧', '叛逆', '质疑'],
      meaning: '多指对传统规则的质疑、打破常规的冲动，或是陈旧体系的僵化。'
    }
  },
  { 
    id: 6, 
    name: 'VI. The Lovers', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_lovers.png',
    upright: {
      keywords: ['爱情', '选择', '连结'],
      meaning: '通常涉及重要的抉择时刻、深层情感连结，以及价值观的统一与确认。'
    },
    reversed: {
      keywords: ['关系失衡', '价值冲突', '错误选择'],
      meaning: '多指关系中的不对等感、价值观分歧，或是决策失误后的后果。'
    }
  },
  { 
    id: 7, 
    name: 'VII. The Chariot', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_chariot.png',
    upright: {
      keywords: ['胜利', '意志', '前进'],
      meaning: '常与坚定的意志驱动、克服障碍推进，以及即将到来的成功有关。'
    },
    reversed: {
      keywords: ['失去方向', '自我挫败', '缺乏控制'],
      meaning: '多指方向感的丧失、内在矛盾导致的停滞，或是掌控力的缺失。'
    }
  },
  { 
    id: 8, 
    name: 'VIII. Strength', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_strength.png',
    upright: {
      keywords: ['勇气', '耐心', '温柔'],
      meaning: '通常涉及内在力量的展现、以温柔驯服冲动，以及耐心应对挑战。'
    },
    reversed: {
      keywords: ['自我怀疑', '缺乏信心', '失控'],
      meaning: '多指自信心的动摇、被负面情绪压倒，或是对自身力量的怀疑。'
    }
  },
  { 
    id: 9, 
    name: 'IX. The Hermit', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hermit.png',
    upright: {
      keywords: ['内省', '智慧', '独处'],
      meaning: '常与暂时退隐、通过独处寻找答案，以及内在智慧的觉醒有关。'
    },
    reversed: {
      keywords: ['孤独封闭', '逃避现实', '过度孤立'],
      meaning: '多指过度封闭自我、用孤立逃避问题，或是在独处中迷失方向。'
    }
  },
  { 
    id: 10, 
    name: 'X. Wheel of Fortune', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_fortune.png',
    upright: {
      keywords: ['命运', '变化', '循环'],
      meaning: '通常涉及事态转折、生命周期的自然流转，以及时机的到来。'
    },
    reversed: {
      keywords: ['坏运气', '抗拒改变', '失控'],
      meaning: '多指不利时期的经历、对变化的抗拒，或是失去对局势的掌控感。'
    }
  },
  { 
    id: 11, 
    name: 'XI. Justice', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_justice.png',
    upright: {
      keywords: ['正义', '平衡', '真相'],
      meaning: '常与因果法则、客观评判，以及真相被揭示的时刻有关。'
    },
    reversed: {
      keywords: ['不公平', '偏见', '逃避责任'],
      meaning: '多指不公正感的体验、偏见影响判断，或是回避应负的责任。'
    }
  },
  { 
    id: 12, 
    name: 'XII. The Hanged Man', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_hanged.png',
    upright: {
      keywords: ['等待', '换位', '牺牲'],
      meaning: '通常涉及暂停行动、从不同视角观察，以及通过放下获得领悟。'
    },
    reversed: {
      keywords: ['徒劳无功', '拖延', '抗拒'],
      meaning: '多指无意义的等待、拒绝放手，或是在停滞中消耗能量。'
    }
  },
  { 
    id: 13, 
    name: 'XIII. Death', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_death.png',
    upright: {
      keywords: ['转化', '结束', '重生'],
      meaning: '常与彻底的结束、深层转化，以及为新生腾出空间的过程有关。'
    },
    reversed: {
      keywords: ['抗拒变化', '停滞不前', '恐惧'],
      meaning: '多指对放手的抗拒、因恐惧而停滞，或是紧抓旧有模式不放。'
    }
  },
  { 
    id: 14, 
    name: 'XIV. Temperance', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_temperance.png',
    upright: {
      keywords: ['平衡', '节制', '和谐'],
      meaning: '通常涉及不同元素的调和、适度的掌握，以及耐心维持平衡的过程。'
    },
    reversed: {
      keywords: ['失衡', '过度', '缺乏耐心'],
      meaning: '多指某方面的过度或不足、平衡感的丧失，或是急躁情绪的干扰。'
    }
  },
  { 
    id: 15, 
    name: 'XV. The Devil', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_devil.png',
    upright: {
      keywords: ['诱惑', '束缚', '欲望'],
      meaning: '常与欲望的沉溺、依赖关系，以及明知不利却难以挣脱的困境有关。'
    },
    reversed: {
      keywords: ['解脱自由', '觉察', '打破枷锁'],
      meaning: '多指对束缚的觉察、挣脱枷锁的契机，或是从依赖中解放的过程。'
    }
  },
  { 
    id: 16, 
    name: 'XVI. The Tower', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_tower.png',
    upright: {
      keywords: ['崩溃', '启示', '重建'],
      meaning: '通常涉及假象的突然破碎、震荡性的真相揭示，以及在混乱中重建的开端。'
    },
    reversed: {
      keywords: ['避免灾难', '内部危机', '恐惧'],
      meaning: '多指对崩溃的提前警觉、内部的暗流涌动，或是极力避免震荡发生。'
    }
  },
  { 
    id: 17, 
    name: 'XVII. The Star', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_star.png',
    upright: {
      keywords: ['希望', '灵感', '信心'],
      meaning: '常与困境后的希望重现、内心平静的恢复，以及对未来的信心有关。'
    },
    reversed: {
      keywords: ['失去信心', '绝望', '缺乏目标'],
      meaning: '多指方向感和希望的丧失、信心的动摇，或是在困境中看不到出路。'
    }
  },
  { 
    id: 18, 
    name: 'XVIII. The Moon', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_moon.png',
    upright: {
      keywords: ['幻觉', '直觉', '未知'],
      meaning: '通常涉及迷雾笼罩的状态、依赖直觉辨别真实，以及未知领域的探索。'
    },
    reversed: {
      keywords: ['释放恐惧', '直面真相', '清晰'],
      meaning: '多指焦虑想象的消散、隐藏真相逐渐清晰，或是从迷雾中走出。'
    }
  },
  { 
    id: 19, 
    name: 'XIX. The Sun', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_sun.png',
    upright: {
      keywords: ['成功', '喜悦', '活力'],
      meaning: '常与事态的积极发展、充沛的生命能量，以及发自内心的喜悦有关。'
    },
    reversed: {
      keywords: ['暂时挫折', '过度乐观', '延迟'],
      meaning: '多指对形势的过度乐观、期待结果的延迟，或是暂时性的受挫。'
    }
  },
  { 
    id: 20, 
    name: 'XX. Judgement', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_judgement.png',
    upright: {
      keywords: ['觉醒', '反思', '重生'],
      meaning: '通常涉及对过往的重新审视、从经历中获得教训，以及迎接新生的准备。'
    },
    reversed: {
      keywords: ['自我批判', '逃避', '内疚'],
      meaning: '多指过度的自我苛责、对问题的回避，或是内疚情绪的纠缠。'
    }
  },
  { 
    id: 21, 
    name: 'XXI. The World', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/major_arcana_world.png',
    upright: {
      keywords: ['完成', '成就', '圆满'],
      meaning: '常与重要阶段的圆满结束、成就的达成，以及整合后的完整感有关。'
    },
    reversed: {
      keywords: ['未完成', '缺乏收尾', '延迟'],
      meaning: '多指事项的未完成状态、缺少收尾环节，或是成功感的缺失。'
    }
  },

  // Minor Arcana - Cups (圣杯)
  { 
    id: 22, 
    name: 'Ace of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_ace.png',
    upright: {
      keywords: ['爱', '直觉', '情感'],
      meaning: '常与新情感关系的萌芽、创意灵感的涌现，以及内心被爱意填满有关。'
    },
    reversed: {
      keywords: ['情感封闭', '失去爱', '空虚'],
      meaning: '多指情感的封闭状态、爱意的缺失，或是内心空洞感的体验。'
    }
  },
  { 
    id: 23, 
    name: 'Two of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_2.png',
    upright: {
      keywords: ['伙伴', '连结', '平衡'],
      meaning: '通常涉及深刻的情感连结、彼此尊重的关系，以及相互吸引的能量。'
    },
    reversed: {
      keywords: ['关系失衡', '分离', '误解'],
      meaning: '多指关系中的不平衡、误解导致的距离，或是连结的断裂。'
    }
  },
  { 
    id: 24, 
    name: 'Three of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_3.png',
    upright: {
      keywords: ['庆祝', '友谊', '创造'],
      meaning: '常与共享快乐的时刻、友谊中的放松氛围，以及集体创造有关。'
    },
    reversed: {
      keywords: ['孤立', '过度放纵', '三角关系'],
      meaning: '多指社交中的被排斥感、过度狂欢失去界限，或是复杂关系的介入。'
    }
  },
  { 
    id: 25, 
    name: 'Four of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_4.png',
    upright: {
      keywords: ['沉思', '不满', '内省'],
      meaning: '通常涉及对现状的倦怠感、重新思考价值，以及内在评估的过程。'
    },
    reversed: {
      keywords: ['觉醒', '新机会', '动力'],
      meaning: '多指从倦怠中苏醒、重新看见机会，或是动力的恢复。'
    }
  },
  { 
    id: 26, 
    name: 'Five of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_5.png',
    upright: {
      keywords: ['失去', '悲伤', '遗憾'],
      meaning: '常与沉浸于失去的痛苦、只关注已逝去的部分，以及忽略仍存在的事物有关。'
    },
    reversed: {
      keywords: ['接受', '前进', '宽恕'],
      meaning: '多指开始接受失去、准备放下过去，或是将注意力转向未来。'
    }
  },
  { 
    id: 27, 
    name: 'Six of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_6.png',
    upright: {
      keywords: ['回忆', '纯真', '怀旧'],
      meaning: '通常涉及美好记忆的浮现、温暖的怀旧感，或是旧人旧事的重现。'
    },
    reversed: {
      keywords: ['活在过去', '理想化', '向前看'],
      meaning: '多指过度美化过去、被回忆束缚，或是将眼光投向当下的时机。'
    }
  },
  { 
    id: 28, 
    name: 'Seven of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_7.png',
    upright: {
      keywords: ['幻想', '选择', '迷惑'],
      meaning: '常与过多诱人选项、难以辨别真实可行性，以及在幻想中迷失有关。'
    },
    reversed: {
      keywords: ['清晰', '决心', '专注'],
      meaning: '多指虚幻选项的消散、看清真正值得追求的目标，或是专注力的恢复。'
    }
  },
  { 
    id: 29, 
    name: 'Eight of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_8.png',
    upright: {
      keywords: ['离开', '寻找', '放弃'],
      meaning: '通常涉及意识到现状无法满足、决定离开，以及寻找更深层意义的旅程。'
    },
    reversed: {
      keywords: ['停滞', '害怕改变', '回归'],
      meaning: '多指因恐惧未知而不敢离开、在离开后选择回头，或是停滞不前的状态。'
    }
  },
  { 
    id: 30, 
    name: 'Nine of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_9.png',
    upright: {
      keywords: ['满足', '愿望', '幸福'],
      meaning: '常与愿望的实现、内心满足感，以及幸福感受的获得有关。'
    },
    reversed: {
      keywords: ['贪婪', '不满足', '虚荣'],
      meaning: '多指对表面满足的追求、得到后仍不满足，或是虚荣心的驱使。'
    }
  },
  { 
    id: 31, 
    name: 'Ten of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_10.png',
    upright: {
      keywords: ['家庭', '和谐', '幸福'],
      meaning: '通常涉及深厚的情感纽带、归属感的获得，以及完整的幸福体验。'
    },
    reversed: {
      keywords: ['家庭失和', '价值观冲突', '不稳定'],
      meaning: '多指价值观的分歧、家庭关系中的矛盾，或是稳定感的缺失。'
    }
  },
  { 
    id: 32, 
    name: 'Page of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_page.png',
    upright: {
      keywords: ['创意', '直觉', '消息'],
      meaning: '常与情感相关的消息、新创意想法的涌现，以及直觉的萌发有关。'
    },
    reversed: {
      keywords: ['情绪不稳', '不成熟', '逃避'],
      meaning: '多指情绪的起伏不定、面对情感问题时的幼稚表现，或是逃避的倾向。'
    }
  },
  { 
    id: 33, 
    name: 'Knight of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_knight.png',
    upright: {
      keywords: ['浪漫', '追求', '理想'],
      meaning: '通常涉及带有浪漫幻想的追求、充满诗意和热情的行动。'
    },
    reversed: {
      keywords: ['不切实际', '情绪化', '虚假'],
      meaning: '多指追求缺乏实际基础、虚假浪漫的掩饰，或是过度情绪化的表现。'
    }
  },
  { 
    id: 34, 
    name: 'Queen of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_queen.png',
    upright: {
      keywords: ['同理心', '直觉', '关怀'],
      meaning: '常与深刻感受他人情绪、以温柔提供支持，以及直觉敏锐有关。'
    },
    reversed: {
      keywords: ['情绪不稳', '依赖', '不真诚'],
      meaning: '多指被情绪淹没、过度依赖他人支持，或是缺乏真诚的关怀。'
    }
  },
  { 
    id: 35, 
    name: 'King of Cups', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_cups_king.png',
    upright: {
      keywords: ['平衡', '智慧', '掌控'],
      meaning: '通常涉及情感丰富与理性并存、以智慧处理关系，以及情绪的稳定掌控。'
    },
    reversed: {
      keywords: ['情感压抑', '冷漠', '操控'],
      meaning: '多指过度压抑情感、对他人的冷漠，或是利用情感操控他人。'
    }
  },

  // Minor Arcana - Pentacles (星币)
  { 
    id: 36, 
    name: 'Ace of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_ace.png',
    upright: {
      keywords: ['机会', '繁荣', '物质'],
      meaning: '常与新机会的出现、物质收获的可能，以及稳定开端有关。'
    },
    reversed: {
      keywords: ['失去机会', '贪婪', '不稳定'],
      meaning: '多指机会的错失、对物质的过度追求，或是稳定性的缺失。'
    }
  },
  { 
    id: 37, 
    name: 'Two of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_2.png',
    upright: {
      keywords: ['平衡', '适应', '灵活'],
      meaning: '通常涉及多任务间的平衡努力、保持灵活适应性，以及事务的并行处理。'
    },
    reversed: {
      keywords: ['失衡', '压力', '混乱'],
      meaning: '多指在多事务间手忙脚乱、无法维持平衡，或是压力导致的混乱。'
    }
  },
  { 
    id: 38, 
    name: 'Three of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_3.png',
    upright: {
      keywords: ['合作', '技能', '学习'],
      meaning: '常与团队协作、通过学习提升技能，以及获得认可有关。'
    },
    reversed: {
      keywords: ['缺乏团队', '技能不足', '低质量'],
      meaning: '多指合作中的问题、技能的不足，或是工作质量的下降。'
    }
  },
  { 
    id: 39, 
    name: 'Four of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_4.png',
    upright: {
      keywords: ['安全', '控制', '保守'],
      meaning: '通常涉及紧紧抓住所拥有的、因害怕失去而不敢冒险的状态。'
    },
    reversed: {
      keywords: ['贪婪', '放手', '失控'],
      meaning: '多指对资源的过度执着、终于愿意放手，或是掌控感的丧失。'
    }
  },
  { 
    id: 40, 
    name: 'Five of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_5.png',
    upright: {
      keywords: ['困难', '贫困', '孤立'],
      meaning: '常与物质或精神困境、被排斥在温暖之外的感受有关。'
    },
    reversed: {
      keywords: ['复苏', '改善', '希望'],
      meaning: '多指困难时期的好转、改善迹象的出现，或是新希望的看见。'
    }
  },
  { 
    id: 41, 
    name: 'Six of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_6.png',
    upright: {
      keywords: ['慷慨', '施予', '平衡'],
      meaning: '通常涉及给予或接受帮助、资源的流动，以及关系中的平衡感。'
    },
    reversed: {
      keywords: ['自私', '债务', '单向'],
      meaning: '多指付出或接受中的不平等感、过于计较得失，或是单向的资源流动。'
    }
  },
  { 
    id: 42, 
    name: 'Seven of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_7.png',
    upright: {
      keywords: ['等待', '投资', '耐心'],
      meaning: '常与已付出努力后的等待、耐心守候收获时机有关。'
    },
    reversed: {
      keywords: ['没有收获', '浪费', '不耐烦'],
      meaning: '多指投入未见回报的感受、等待中失去耐心，或是资源的浪费。'
    }
  },
  { 
    id: 43, 
    name: 'Eight of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_8.png',
    upright: {
      keywords: ['努力', '技艺', '专注'],
      meaning: '通常涉及专注打磨技能、通过不断练习追求卓越的过程。'
    },
    reversed: {
      keywords: ['粗心', '缺乏野心', '重复'],
      meaning: '多指工作中的专注缺失、陷入机械重复，或是热情的丧失。'
    }
  },
  { 
    id: 44, 
    name: 'Nine of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_9.png',
    upright: {
      keywords: ['独立', '富足', '优雅'],
      meaning: '常与通过努力获得的独立、自给自足的满足感，以及物质精神的富足有关。'
    },
    reversed: {
      keywords: ['过度工作', '物质主义', '孤独'],
      meaning: '多指为追求物质忽略其他、在独立中感到孤独，或是过度工作的状态。'
    }
  },
  { 
    id: 45, 
    name: 'Ten of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_10.png',
    upright: {
      keywords: ['财富', '家族', '传承'],
      meaning: '通常涉及稳定的物质基础、家族支持，以及长久安全感的体验。'
    },
    reversed: {
      keywords: ['财务问题', '家庭失和', '不稳定'],
      meaning: '多指财务或家庭关系中的问题、曾经稳定的失去。'
    }
  },
  { 
    id: 46, 
    name: 'Page of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_page.png',
    upright: {
      keywords: ['学习', '计划', '机会'],
      meaning: '常与学习新技能、制定计划，以及对未来发展的好奇和热情有关。'
    },
    reversed: {
      keywords: ['拖延', '缺乏进展', '不切实际'],
      meaning: '多指学习或计划上的行动缺失、不切实际的目标设定。'
    }
  },
  { 
    id: 47, 
    name: 'Knight of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_knight.png',
    upright: {
      keywords: ['勤奋', '责任', '可靠'],
      meaning: '通常涉及踏实稳定的前进、虽缓慢但扎实的每一步。'
    },
    reversed: {
      keywords: ['懒惰', '固执', '无聊'],
      meaning: '多指陷入懒散状态、过于固执不愿改变，或是单调乏味的感受。'
    }
  },
  { 
    id: 48, 
    name: 'Queen of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_queen.png',
    upright: {
      keywords: ['养育', '实际', '安全'],
      meaning: '常与用务实方式照顾他人、创造温暖稳定环境有关。'
    },
    reversed: {
      keywords: ['过度保护', '物质主义', '自私'],
      meaning: '多指过度关注物质层面、在照顾他人时失去对自己的关注。'
    }
  },
  { 
    id: 49, 
    name: 'King of Pentacles', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_pentacles_king.png',
    upright: {
      keywords: ['财富', '成功', '领导'],
      meaning: '通常涉及物质世界的成功、稳健管理资源，以及引领他人的能力。'
    },
    reversed: {
      keywords: ['贪婪', '物质主义', '固执'],
      meaning: '多指过度追求物质财富、管理上的僵化控制。'
    }
  },

  // Minor Arcana - Swords (宝剑)
  { 
    id: 50, 
    name: 'Ace of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_ace.png',
    upright: {
      keywords: ['清晰', '突破', '真相'],
      meaning: '常与新想法或洞察的突然出现、看清事情本质有关。'
    },
    reversed: {
      keywords: ['困惑', '混乱', '误解'],
      meaning: '多指被错误信息误导、思路混乱难以判断的状态。'
    }
  },
  { 
    id: 51, 
    name: 'Two of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_2.png',
    upright: {
      keywords: ['僵局', '抉择', '平衡'],
      meaning: '通常涉及两难的选择、暂时回避现实，以及在对立中寻求平衡的状态。'
    },
    reversed: {
      keywords: ['混乱', '信息过载', '决定'],
      meaning: '多指愿意面对现实的时刻、在混乱中被迫决定，或是信息过载的困扰。'
    }
  },
  { 
    id: 52, 
    name: 'Three of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_3.png',
    upright: {
      keywords: ['心碎', '悲伤', '痛苦'],
      meaning: '常与深刻的情感伤痛、分离背叛，以及某种失去的经历有关。'
    },
    reversed: {
      keywords: ['恢复', '宽恕', '前进'],
      meaning: '多指从伤痛中慢慢恢复、放下怨恨原谅，以及开始治愈的过程。'
    }
  },
  { 
    id: 53, 
    name: 'Four of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_4.png',
    upright: {
      keywords: ['休息', '恢复', '沉思'],
      meaning: '通常涉及暂时停下来休息、给自己充电时间，以及恢复和反思的状态。'
    },
    reversed: {
      keywords: ['倦怠', '压力', '不安'],
      meaning: '多指精疲力尽却还在强撑、无法真正放松，或是不安情绪的持续。'
    }
  },
  { 
    id: 54, 
    name: 'Five of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_5.png',
    upright: {
      keywords: ['冲突', '失败', '不和'],
      meaning: '常与争执中的空虚胜利、人际关系的破裂，以及冲突带来的失落有关。'
    },
    reversed: {
      keywords: ['和解', '宽恕', '前进'],
      meaning: '多指放下无谓争执、愿意和解，或是从失败中吸取教训。'
    }
  },
  { 
    id: 55, 
    name: 'Six of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_6.png',
    upright: {
      keywords: ['过渡', '离开', '前进'],
      meaning: '通常涉及离开困难处境、虽不舍但必要的过渡，以及向前的移动。'
    },
    reversed: {
      keywords: ['困住', '抗拒', '停滞'],
      meaning: '多指抗拒离开当前环境、在过渡中遇到阻碍，或是陷入停滞。'
    }
  },
  { 
    id: 56, 
    name: 'Seven of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_7.png',
    upright: {
      keywords: ['欺骗', '策略', '逃避'],
      meaning: '常与使用不光彩手段、选择逃避而非正面应对有关。'
    },
    reversed: {
      keywords: ['诚实', '坦白', '改过'],
      meaning: '多指意识到欺骗代价、愿意诚实面对，以及改正错误的转机。'
    }
  },
  { 
    id: 57, 
    name: 'Eight of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_8.png',
    upright: {
      keywords: ['束缚', '限制', '受困'],
      meaning: '通常涉及被困住的感受、很多限制来自内在思维而非外界的状况。'
    },
    reversed: {
      keywords: ['释放', '自由', '新视角'],
      meaning: '多指开始摘下蒙眼布、意识到可以挣脱束缚，以及新视角的获得。'
    }
  },
  { 
    id: 58, 
    name: 'Nine of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_9.png',
    upright: {
      keywords: ['焦虑', '担忧', '噩梦'],
      meaning: '常与被焦虑和恐惧包围、夜深时担忧格外沉重的体验有关。'
    },
    reversed: {
      keywords: ['希望', '恢复', '接受'],
      meaning: '多指开始从焦虑中走出、意识到很多担忧可能不会发生。'
    }
  },
  { 
    id: 59, 
    name: 'Ten of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_10.png',
    upright: {
      keywords: ['结束', '背叛', '崩溃'],
      meaning: '通常涉及某阶段走到尽头、直面失去，或是情绪低谷的经历。'
    },
    reversed: {
      keywords: ['恢复', '重生', '逃脱'],
      meaning: '多指最糟时刻已过、从崩溃中站起，以及逐渐恢复的过程。'
    }
  },
  { 
    id: 60, 
    name: 'Page of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_page.png',
    upright: {
      keywords: ['好奇', '警觉', '新想法'],
      meaning: '常与对周围保持敏锐观察、充满好奇心和探索欲望有关。'
    },
    reversed: {
      keywords: ['八卦', '欺骗', '草率'],
      meaning: '多指传播不实信息、在思考和行动上过于草率的倾向。'
    }
  },
  { 
    id: 61, 
    name: 'Knight of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_knight.png',
    upright: {
      keywords: ['雄心', '冲动', '快速'],
      meaning: '通常涉及带着强烈决心快速前进、可能忽略细节和他人感受。'
    },
    reversed: {
      keywords: ['鲁莽', '不耐烦', '咄咄逼人'],
      meaning: '多指行动过于冲动激进、因不耐烦而伤害他人的情况。'
    }
  },
  { 
    id: 62, 
    name: 'Queen of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_queen.png',
    upright: {
      keywords: ['独立', '清晰', '客观'],
      meaning: '常与用清晰思维和客观态度看待问题、不被情绪左右有关。'
    },
    reversed: {
      keywords: ['冷酷', '苦涩', '偏见'],
      meaning: '多指过于冷漠尖刻、被过去伤痛影响判断的状态。'
    }
  },
  { 
    id: 63, 
    name: 'King of Swords', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_swords_king.png',
    upright: {
      keywords: ['权威', '真相', '道德'],
      meaning: '通常涉及用理性和公正做出决策、坚守道德和原则。'
    },
    reversed: {
      keywords: ['操控', '残忍', '专制'],
      meaning: '多指滥用权力、过于冷酷无情对待他人的情况。'
    }
  },

  // Minor Arcana - Wands (权杖)
  { 
    id: 64, 
    name: 'Ace of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_ace.png',
    upright: {
      keywords: ['灵感', '创造', '开始'],
      meaning: '常与新热情和灵感的涌现、充满活力准备新冒险有关。'
    },
    reversed: {
      keywords: ['缺乏方向', '延迟', '挫折'],
      meaning: '多指缺乏明确方向、在起步阶段遇到阻碍和挫折。'
    }
  },
  { 
    id: 65, 
    name: 'Two of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_2.png',
    upright: {
      keywords: ['计划', '决定', '发现'],
      meaning: '通常涉及站在新起点、规划未来方向和可能性。'
    },
    reversed: {
      keywords: ['犹豫', '害怕未知', '缺乏计划'],
      meaning: '多指在犹豫不决中错过机会、因害怕而不敢制定计划。'
    }
  },
  { 
    id: 66, 
    name: 'Three of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_3.png',
    upright: {
      keywords: ['扩展', '远见', '领导'],
      meaning: '常与视野的扩展、为未来做好准备，以及等待机会到来有关。'
    },
    reversed: {
      keywords: ['缺乏远见', '延迟', '障碍'],
      meaning: '多指在扩展计划时遇到阻碍、缺乏长远眼光的情况。'
    }
  },
  { 
    id: 67, 
    name: 'Four of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_4.png',
    upright: {
      keywords: ['庆祝', '和谐', '家'],
      meaning: '通常涉及达到值得庆祝的里程碑、感受和谐与归属的喜悦。'
    },
    reversed: {
      keywords: ['不稳定', '缺乏支持', '过渡'],
      meaning: '多指在稳定性上感到不安、缺少家人朋友支持的状态。'
    }
  },
  { 
    id: 68, 
    name: 'Five of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_5.png',
    upright: {
      keywords: ['竞争', '冲突', '紧张'],
      meaning: '常与处于竞争激烈的环境、到处都是意见碰撞和冲突有关。'
    },
    reversed: {
      keywords: ['和解', '避免冲突', '内心冲突'],
      meaning: '多指开始选择避免无谓争执、意识到真正冲突来自内心。'
    }
  },
  { 
    id: 69, 
    name: 'Six of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_6.png',
    upright: {
      keywords: ['胜利', '成功', '认可'],
      meaning: '通常涉及努力得到认可、享受成功带来的荣耀和肯定。'
    },
    reversed: {
      keywords: ['失败', '缺乏认可', '自负'],
      meaning: '多指未得到期待的认可、因过度自负失去他人支持的情况。'
    }
  },
  { 
    id: 70, 
    name: 'Seven of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_7.png',
    upright: {
      keywords: ['挑战', '坚持', '防御'],
      meaning: '常与面对来自各方的挑战、坚守立场和信念有关。'
    },
    reversed: {
      keywords: ['压倒', '放弃', '退缩'],
      meaning: '多指感到被压力压倒、选择放弃抵抗而退缩的状态。'
    }
  },
  { 
    id: 71, 
    name: 'Eight of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_8.png',
    upright: {
      keywords: ['快速', '进展', '变化'],
      meaning: '通常涉及事情的快速发展、收到一连串消息或经历迅速变化。'
    },
    reversed: {
      keywords: ['延迟', '沮丧', '失控'],
      meaning: '多指进展被延误、事情发展速度超出掌控的感受。'
    }
  },
  { 
    id: 72, 
    name: 'Nine of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_9.png',
    upright: {
      keywords: ['韧性', '勇气', '坚持'],
      meaning: '常与经历很多挑战后、虽疲惫但依然坚持，以及胜利在眼前有关。'
    },
    reversed: {
      keywords: ['精疲力尽', '偏执', '放弃'],
      meaning: '多指已经精疲力竭、过度防备陷入偏执状态的情况。'
    }
  },
  { 
    id: 73, 
    name: 'Ten of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_10.png',
    upright: {
      keywords: ['负担', '责任', '压力'],
      meaning: '通常涉及肩负沉重的责任和压力、可能需要放下不必要负担。'
    },
    reversed: {
      keywords: ['释放', '授权', '放手'],
      meaning: '多指开始意识到需要放下负担、学会将责任分给他人。'
    }
  },
  { 
    id: 74, 
    name: 'Page of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_page.png',
    upright: {
      keywords: ['热情', '探索', '消息'],
      meaning: '常与充满热情和好奇心、准备探索新领域和可能性有关。'
    },
    reversed: {
      keywords: ['缺乏方向', '拖延', '坏消息'],
      meaning: '多指在热情中缺乏实际行动、收到令人失望消息的情况。'
    }
  },
  { 
    id: 75, 
    name: 'Knight of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_knight.png',
    upright: {
      keywords: ['冒险', '精力', '冲动'],
      meaning: '通常涉及充满冒险精神和旺盛精力、渴望快速行动追求目标。'
    },
    reversed: {
      keywords: ['鲁莽', '不耐烦', '冲动'],
      meaning: '多指过于冲动和鲁莽、在行动前缺乏足够思考和计划。'
    }
  },
  { 
    id: 76, 
    name: 'Queen of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_queen.png',
    upright: {
      keywords: ['自信', '独立', '热情'],
      meaning: '常与充满自信和魅力、能够独立自主追求目标有关。'
    },
    reversed: {
      keywords: ['自私', '嫉妒', '不安'],
      meaning: '多指过于以自我为中心、因缺乏安全感而产生嫉妒的状态。'
    }
  },
  { 
    id: 77, 
    name: 'King of Wands', 
    image: 'https://utmlglwizzoofkbmlnbs.supabase.co/storage/v1/object/public/tarotimage/minor_arcana_wands_king.png',
    upright: {
      keywords: ['领导', '愿景', '企业家'],
      meaning: '通常涉及拥有清晰愿景和领导力、能够激励他人实现宏大目标。'
    },
    reversed: {
      keywords: ['专制', '冲动', '控制'],
      meaning: '多指过于专制和控制欲强、在领导中过于冲动缺乏计划。'
    }
  },
];
