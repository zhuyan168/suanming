const RESTRICTED_QUESTION_PATTERN =
  /(health|medical|medicine|doctor|diagnos|disease|illness|surgery|pregnan|fertility|conceive|birth|legal|lawyer|lawsuit|court|police|missing person|missing child|disappear|where is|gambl|casino|lottery|betting|bet|健康|医疗|医学|医生|诊断|疾病|生病|手术|怀孕|备孕|生育|生子|法律|律师|诉讼|起诉|法院|判刑|案件|警察|失踪|走失|下落|找人|赌博|博彩|彩票|中奖|赌)/i;

export function isRestrictedTarotQuestion(question: string): boolean {
  return RESTRICTED_QUESTION_PATTERN.test(question.trim());
}

export function getTarotQuestionPolicyText(locale?: string) {
  const isEn = locale === 'en';

  return {
    notice: isEn
      ? 'Please do not ask about health, fertility, legal matters, missing persons, or gambling. For these topics, seek qualified professional or real-world help.'
      : '请不要输入健康、生育、法律、失踪、赌博等问题；这些内容不适合占卜，请寻求专业人士或现实渠道帮助。',
    blocked: isEn
      ? 'This question appears to involve a restricted topic. Please change your question before continuing.'
      : '这个问题可能涉及不适合占卜的主题，请修改问题后再继续。',
  };
}
