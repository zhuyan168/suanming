// Yes/No塔罗牌判断逻辑
// 基于塔罗牌的传统牌意和能量倾向

export type YesNoAnswer = 'YES' | 'NO' | 'MAYBE';

export interface YesNoResult {
  answer: YesNoAnswer;
  reason: string;
}

// 塔罗牌Yes/No映射表
// 基于传统塔罗牌意和能量倾向
const yesNoMap: Record<string, { upright: YesNoAnswer; reversed: YesNoAnswer; uprightReason: string; reversedReason: string }> = {
  // 大阿尔卡那
  '0. The Fool': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '愚者正位带来新开始的能量，鼓励你勇敢前行，信任直觉会带来积极的结果。',
    reversedReason: '愚者逆位提示你可能过于冲动或方向不明，现在可能不是最佳时机，建议三思而行。'
  },
  'I. The Magician': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '魔术师正位象征你拥有所需的资源和能力，现在是行动的好时机，结果会如你所愿。',
    reversedReason: '魔术师逆位暗示计划不周或存在欺骗，目前可能缺乏必要条件，不建议贸然行动。'
  },
  'II. The High Priestess': {
    upright: 'MAYBE',
    reversed: 'MAYBE',
    uprightReason: '女祭司正位提示你倾听内在智慧，答案可能需要时间显现，保持静心观察。',
    reversedReason: '女祭司逆位表明直觉混乱或信息不明，建议等待更清晰的时机再做决定。'
  },
  'III. The Empress': {
    upright: 'YES',
    reversed: 'MAYBE',
    uprightReason: '皇后正位带来丰盛和滋养的能量，这是成长和创造的好时机，结果会令人满意。',
    reversedReason: '皇后逆位可能表示创造力受阻或过度依赖，需要先解决内在问题再做决定。'
  },
  'IV. The Emperor': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '皇帝正位象征秩序和权威，你拥有掌控局面的能力，稳步前进会带来成功。',
    reversedReason: '皇帝逆位可能意味着控制过度或缺乏灵活性，目前的方式可能不适合，需要调整策略。'
  },
  'V. The Hierophant': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '教皇正位建议遵循传统和规范，在既定框架内行动会得到支持和认可。',
    reversedReason: '教皇逆位暗示僵化守旧或叛逆，现有的方式可能不合适，建议重新思考路径。'
  },
  'VI. The Lovers': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '恋人正位代表深层连结和正确的选择，跟随内心会带来和谐的结果。',
    reversedReason: '恋人逆位表明关系失衡或价值冲突，目前可能不是做出承诺的好时机。'
  },
  'VII. The Chariot': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '战车正位象征意志和决心，你有能力克服障碍，坚定前行会取得胜利。',
    reversedReason: '战车逆位提示失去方向或缺乏控制，现在可能不是推进计划的好时机。'
  },
  'VIII. Strength': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '力量正位展现内在勇气和温柔的力量，耐心和坚持会带来积极的结果。',
    reversedReason: '力量逆位暗示自我怀疑或失控，建议先恢复内在信心再做决定。'
  },
  'IX. The Hermit': {
    upright: 'MAYBE',
    reversed: 'NO',
    uprightReason: '隐士正位建议你需要更多时间内省和思考，答案会在独处中显现。',
    reversedReason: '隐士逆位表明过度孤立或逃避现实，现在不是行动的好时机，需要先走出困境。'
  },
  'X. Wheel of Fortune': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '命运之轮正位带来转折和好运，顺应变化会带来积极的结果。',
    reversedReason: '命运之轮逆位暗示坏运气或抗拒改变，时机尚未成熟，建议等待。'
  },
  'XI. Justice': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '正义正位象征公平和因果，如果你的行为正当，会得到应有的回报。',
    reversedReason: '正义逆位提示不公或逃避责任，结果可能不如预期，需要先解决遗留问题。'
  },
  'XII. The Hanged Man': {
    upright: 'MAYBE',
    reversed: 'NO',
    uprightReason: '吊人正位建议暂停和等待，换个角度看问题，答案会在适当时机出现。',
    reversedReason: '吊人逆位表明徒劳或抗拒，继续等待可能没有结果，建议重新评估。'
  },
  'XIII. Death': {
    upright: 'MAYBE',
    reversed: 'NO',
    uprightReason: '死神正位代表转化和重生，旧的结束会带来新的开始，但需要时间过渡。',
    reversedReason: '死神逆位暗示抗拒改变或停滞，现在不是前进的好时机，需要先放下过去。'
  },
  'XIV. Temperance': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '节制正位象征平衡和耐心，温和的方式会带来和谐的结果。',
    reversedReason: '节制逆位提示失衡或过度，需要先恢复内在平衡再做决定。'
  },
  'XV. The Devil': {
    upright: 'NO',
    reversed: 'YES',
    uprightReason: '恶魔正位警示束缚和依赖，这可能不是自由和健康的选择，建议重新考虑。',
    reversedReason: '恶魔逆位象征解脱和觉察，你正在打破束缚，这是积极的转变。'
  },
  'XVI. The Tower': {
    upright: 'NO',
    reversed: 'MAYBE',
    uprightReason: '高塔正位预示突然变故和破坏，现在可能不是稳定前进的时机。',
    reversedReason: '高塔逆位表明危机可能被避免或延迟，但仍需谨慎评估。'
  },
  'XVII. The Star': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '星星正位带来希望和信心，跟随灵感和直觉会带来美好的结果。',
    reversedReason: '星星逆位暗示失去信心或缺乏目标，建议先恢复内在希望再行动。'
  },
  'XVIII. The Moon': {
    upright: 'MAYBE',
    reversed: 'MAYBE',
    uprightReason: '月亮正位提示情况尚不明朗，可能存在幻觉或潜意识因素，建议等待真相浮现。',
    reversedReason: '月亮逆位表明困惑正在解除，但仍需要更多时间才能看清全貌。'
  },
  'XIX. The Sun': {
    upright: 'YES',
    reversed: 'MAYBE',
    uprightReason: '太阳正位象征成功和喜悦，这是充满光明和活力的时刻，结果会积极圆满。',
    reversedReason: '太阳逆位可能意味着暂时挫折或延迟，但整体趋势仍是积极的。'
  },
  'XX. Judgement': {
    upright: 'YES',
    reversed: 'NO',
    uprightReason: '审判正位代表觉醒和新生，这是重要的转折点，会带来积极的结果。',
    reversedReason: '审判逆位提示自我批判或错过机会，建议先处理内在问题再做决定。'
  },
  'XXI. The World': {
    upright: 'YES',
    reversed: 'MAYBE',
    uprightReason: '世界正位象征完成和成就，你已具备所需条件，会获得圆满的结果。',
    reversedReason: '世界逆位暗示尚未完成或缺乏收尾，建议先完善细节再做最后决定。'
  },
  // 圣杯牌组（Cups）- 情感和关系倾向积极
  'Ace of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯王牌正位带来新的情感和直觉的开始，充满爱与可能性。', reversedReason: '圣杯王牌逆位暗示情感空虚或失去连接，目前可能不是好时机。' },
  'Two of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯二正位象征伙伴关系和相互吸引，关系和谐会带来积极结果。', reversedReason: '圣杯二逆位表明关系破裂或不平衡，需要先修复关系。' },
  'Three of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯三正位代表庆祝和友谊，社交和合作会带来喜悦。', reversedReason: '圣杯三逆位提示孤立或冲突，可能不利于当前计划。' },
  'Four of Cups': { upright: 'NO', reversed: 'YES', uprightReason: '圣杯四正位显示冷漠和沉思，你可能忽视了眼前的机会。', reversedReason: '圣杯四逆位表明觉醒和新机会，是时候接受新的可能性了。' },
  'Five of Cups': { upright: 'NO', reversed: 'YES', uprightReason: '圣杯五正位象征失落和遗憾，目前情绪可能影响判断。', reversedReason: '圣杯五逆位代表接受和前进，你正在走出阴影。' },
  'Six of Cups': { upright: 'MAYBE', reversed: 'NO', uprightReason: '圣杯六正位带来怀旧和纯真，但可能过于理想化，需要现实考量。', reversedReason: '圣杯六逆位暗示困在过去，建议放下回忆向前看。' },
  'Seven of Cups': { upright: 'MAYBE', reversed: 'NO', uprightReason: '圣杯七正位显示选择太多和幻想，需要更清晰的判断。', reversedReason: '圣杯七逆位表明混乱和错误选择，不建议现在做决定。' },
  'Eight of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯八正位象征放弃和寻找更深意义，离开是为了更好的未来。', reversedReason: '圣杯八逆位暗示停滞或恐惧改变，可能不是离开的好时机。' },
  'Nine of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯九正位代表满足和愿望实现，这是充满幸福的时刻。', reversedReason: '圣杯九逆位提示缺乏满足或过度，需要调整期望。' },
  'Ten of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯十正位象征和谐和家庭幸福，会带来圆满的结果。', reversedReason: '圣杯十逆位表明不和谐或家庭冲突，可能影响结果。' },
  'Page of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯侍从正位带来创意灵感和新感情，充满可能性。', reversedReason: '圣杯侍从逆位暗示情感不成熟或拒绝直觉，需要成长。' },
  'Knight of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯骑士正位象征浪漫和追求理想，跟随内心会带来美好。', reversedReason: '圣杯骑士逆位提示不切实际或逃避，建议脚踏实地。' },
  'Queen of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯王后正位代表同情和直觉，情感成熟会带来积极结果。', reversedReason: '圣杯王后逆位表明情绪不稳定或依赖，需要先稳定情绪。' },
  'King of Cups': { upright: 'YES', reversed: 'NO', uprightReason: '圣杯国王正位象征情感平衡和智慧，冷静处理会得到好结果。', reversedReason: '圣杯国王逆位暗示情绪失控或冷漠，可能不利于当前情况。' },

  // 星币牌组（Pentacles）- 物质和实际倾向
  'Ace of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币王牌正位带来新机会和物质开始，充满繁荣的潜力。', reversedReason: '星币王牌逆位暗示错失机会或不稳定，可能不是好时机。' },
  'Two of Pentacles': { upright: 'MAYBE', reversed: 'NO', uprightReason: '星币二正位显示平衡和适应，虽然忙碌但可以掌控。', reversedReason: '星币二逆位表明失衡或过度承诺，建议减轻负担。' },
  'Three of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币三正位象征团队合作和技能，协作会带来成功。', reversedReason: '星币三逆位提示缺乏合作或不专业，可能影响结果。' },
  'Four of Pentacles': { upright: 'NO', reversed: 'YES', uprightReason: '星币四正位显示控制和保守，过于谨慎可能限制发展。', reversedReason: '星币四逆位代表放手和解脱，打破限制会带来新机会。' },
  'Five of Pentacles': { upright: 'NO', reversed: 'YES', uprightReason: '星币五正位象征困难和贫困，目前可能不是好时机。', reversedReason: '星币五逆位表明恢复和寻求帮助，情况正在改善。' },
  'Six of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币六正位代表慷慨和分享，给予会带来平衡和回报。', reversedReason: '星币六逆位暗示自私或不平衡，可能不利于互惠关系。' },
  'Seven of Pentacles': { upright: 'MAYBE', reversed: 'NO', uprightReason: '星币七正位显示等待收获和耐心，需要更多时间才能看到结果。', reversedReason: '星币七逆位提示缺乏进展或挫折，可能不是投资的好时机。' },
  'Eight of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币八正位象征努力和专注，勤奋会带来质量和成功。', reversedReason: '星币八逆位表明缺乏质量或匆忙，建议提高标准。' },
  'Nine of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币九正位代表独立和富足，自给自足会带来优雅的生活。', reversedReason: '星币九逆位暗示缺乏独立或财务困难，需要先稳定基础。' },
  'Ten of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币十正位象征财富和长期成功，家庭和事业都会稳定。', reversedReason: '星币十逆位提示财务损失或家庭冲突，可能影响计划。' },
  'Page of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币侍从正位带来新机会和学习，务实的态度会带来成长。', reversedReason: '星币侍从逆位暗示缺乏机会或拖延，建议更加实际。' },
  'Knight of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币骑士正位象征效率和责任，稳步前进会取得成功。', reversedReason: '星币骑士逆位表明懒惰或缺乏责任，可能影响结果。' },
  'Queen of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币王后正位代表实用和关怀，财务安全会得到保障。', reversedReason: '星币王后逆位暗示自我中心或物质主义，需要调整价值观。' },
  'King of Pentacles': { upright: 'YES', reversed: 'NO', uprightReason: '星币国王正位象征财务安全和慷慨，实用的方式会带来成功。', reversedReason: '星币国王逆位提示财务不稳定或贪婪，可能不是好时机。' },

  // 宝剑牌组（Swords）- 思考和挑战倾向
  'Ace of Swords': { upright: 'YES', reversed: 'NO', uprightReason: '宝剑王牌正位带来新想法和清晰，突破会带来真相。', reversedReason: '宝剑王牌逆位暗示混乱或误解，建议等待更清晰的时机。' },
  'Two of Swords': { upright: 'MAYBE', reversed: 'NO', uprightReason: '宝剑二正位显示僵局和困难选择，需要更多信息才能决定。', reversedReason: '宝剑二逆位表明优柔寡断或逃避，不是做决定的好时机。' },
  'Three of Swords': { upright: 'NO', reversed: 'MAYBE', uprightReason: '宝剑三正位象征心碎和悲伤，可能会带来痛苦的结果。', reversedReason: '宝剑三逆位代表恢复和宽恕，伤口正在愈合。' },
  'Four of Swords': { upright: 'MAYBE', reversed: 'NO', uprightReason: '宝剑四正位建议休息和恢复，需要时间才能继续前进。', reversedReason: '宝剑四逆位提示疲惫或缺乏休息，不是行动的好时机。' },
  'Five of Swords': { upright: 'NO', reversed: 'MAYBE', uprightReason: '宝剑五正位显示冲突和不和，可能不是达成共识的好时机。', reversedReason: '宝剑五逆位表明和解和解决冲突，情况正在改善。' },
  'Six of Swords': { upright: 'YES', reversed: 'NO', uprightReason: '宝剑六正位象征过渡和前进，离开困境会带来更好的未来。', reversedReason: '宝剑六逆位暗示无法前进或困在过去，建议先解决问题。' },
  'Seven of Swords': { upright: 'NO', reversed: 'YES', uprightReason: '宝剑七正位提示欺骗或逃避，可能不是诚实的选择。', reversedReason: '宝剑七逆位代表诚实和面对后果，是时候承担责任了。' },
  'Eight of Swords': { upright: 'NO', reversed: 'YES', uprightReason: '宝剑八正位显示限制和被困，目前可能感到无能为力。', reversedReason: '宝剑八逆位象征自由和新视角，你正在打破限制。' },
  'Nine of Swords': { upright: 'NO', reversed: 'MAYBE', uprightReason: '宝剑九正位表明焦虑和恐惧，情绪可能影响判断。', reversedReason: '宝剑九逆位代表希望和面对恐惧，情况正在好转。' },
  'Ten of Swords': { upright: 'NO', reversed: 'MAYBE', uprightReason: '宝剑十正位象征背叛和结束，可能会带来痛苦的结局。', reversedReason: '宝剑十逆位表明恢复和新开始，最坏的时刻已经过去。' },
  'Page of Swords': { upright: 'MAYBE', reversed: 'NO', uprightReason: '宝剑侍从正位带来好奇心和新想法，但需要谨慎沟通。', reversedReason: '宝剑侍从逆位暗示八卦或错误信息，建议谨慎评估。' },
  'Knight of Swords': { upright: 'YES', reversed: 'NO', uprightReason: '宝剑骑士正位象征行动和直接，快速前进会带来结果。', reversedReason: '宝剑骑士逆位提示鲁莽或缺乏方向，建议放慢步伐。' },
  'Queen of Swords': { upright: 'YES', reversed: 'NO', uprightReason: '宝剑王后正位代表清晰思考和独立，理性判断会带来好结果。', reversedReason: '宝剑王后逆位暗示冷酷或偏见，可能不利于关系和合作。' },
  'King of Swords': { upright: 'YES', reversed: 'NO', uprightReason: '宝剑国王正位象征真理和公正，理性和权威会带来正确的结果。', reversedReason: '宝剑国王逆位表明操纵或滥用权力，建议重新评估动机。' },

  // 权杖牌组（Wands）- 行动和创造倾向
  'Ace of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖王牌正位带来新开始和灵感，创造力会带来成功。', reversedReason: '权杖王牌逆位暗示缺乏方向或延迟，可能不是开始的好时机。' },
  'Two of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖二正位象征计划和探索，有远见的行动会带来成功。', reversedReason: '权杖二逆位提示犹豫或害怕未知，建议先做好准备。' },
  'Three of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖三正位代表扩展和远见，领导力会带来积极结果。', reversedReason: '权杖三逆位表明缺乏远见或延迟，可能遇到障碍。' },
  'Four of Wands': { upright: 'YES', reversed: 'MAYBE', uprightReason: '权杖四正位象征庆祝和稳定，和谐的环境会带来成功。', reversedReason: '权杖四逆位暗示不稳定或缺乏支持，可能需要更多时间。' },
  'Five of Wands': { upright: 'NO', reversed: 'YES', uprightReason: '权杖五正位显示竞争和冲突，可能面临阻力和挑战。', reversedReason: '权杖五逆位代表和解和避免冲突，是时候合作了。' },
  'Six of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖六正位象征胜利和成功，你会得到认可和赞赏。', reversedReason: '权杖六逆位提示失败或缺乏认可，建议调整期望。' },
  'Seven of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖七正位代表坚持和防御，你有能力应对挑战。', reversedReason: '权杖七逆位暗示压倒或放弃，可能不是坚持的好时机。' },
  'Eight of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖八正位象征快速行动和进展，事情会迅速发展。', reversedReason: '权杖八逆位表明延迟或失控，建议放慢节奏。' },
  'Nine of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖九正位显示韧性和坚持，最后的努力会带来成功。', reversedReason: '权杖九逆位提示精疲力尽或放弃，建议先恢复能量。' },
  'Ten of Wands': { upright: 'NO', reversed: 'YES', uprightReason: '权杖十正位象征负担和压力，可能承担太多责任。', reversedReason: '权杖十逆位代表释放和放手，减轻负担会带来解脱。' },
  'Page of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖侍从正位带来热情和探索，新想法会带来机会。', reversedReason: '权杖侍从逆位暗示缺乏方向或拖延，建议更加专注。' },
  'Knight of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖骑士正位象征冒险和精力，冲劲会带来进展。', reversedReason: '权杖骑士逆位提示鲁莽或不耐烦，建议谨慎行事。' },
  'Queen of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖王后正位代表自信和独立，热情会带来成功。', reversedReason: '权杖王后逆位暗示自私或嫉妒，需要调整心态。' },
  'King of Wands': { upright: 'YES', reversed: 'NO', uprightReason: '权杖国王正位象征领导力和愿景，企业家精神会带来成就。', reversedReason: '权杖国王逆位表明专制或冲动，可能不利于合作和成功。' }
};

/**
 * 根据塔罗牌和正逆位判断Yes/No答案
 * @param cardName - 塔罗牌名称
 * @param orientation - 正逆位
 * @returns Yes/No结果和原因
 */
export function getYesNoByCard(
  cardName: string,
  orientation: 'upright' | 'reversed'
): YesNoResult {
  const mapping = yesNoMap[cardName];
  
  if (!mapping) {
    // 如果没有映射，返回MAYBE作为降级方案
    return {
      answer: 'MAYBE',
      reason: '这张牌的能量较为复杂，建议结合自身情况和直觉来判断。保持开放的心态，答案会在适当的时机显现。'
    };
  }

  if (orientation === 'upright') {
    return {
      answer: mapping.upright,
      reason: mapping.uprightReason
    };
  } else {
    return {
      answer: mapping.reversed,
      reason: mapping.reversedReason
    };
  }
}

/**
 * 将答案转换为中文显示
 */
export function getAnswerText(answer: YesNoAnswer): string {
  switch (answer) {
    case 'YES':
      return '是';
    case 'NO':
      return '否';
    case 'MAYBE':
      return '不确定';
  }
}
