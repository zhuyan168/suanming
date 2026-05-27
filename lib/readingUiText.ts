export function getReadingUiText(locale: string | undefined) {
  const isEn = locale === 'en';
  return {
    // Error messages
    errorGenerate: isEn ? 'Failed to generate the reading.' : '生成解读失败',
    errorGenerateRetry: isEn ? 'Failed to generate the reading. Please try again.' : '生成解读失败，请重试',
    errorLoad: isEn ? 'Failed to load data. Please go back and draw again.' : '加载数据失败，请返回重新抽牌',
    errorIncomplete: isEn ? 'Your card data is incomplete. Please draw again.' : '抽牌数据不完整，请重新抽牌',
    errorNotFound: isEn ? "We couldn't find your drawn cards. Please go back and draw again." : '没有找到你的抽牌结果，请返回重新抽牌。',
    errorParseFailed: isEn ? 'Failed to parse your card data. Please try drawing again.' : '数据解析失败，请尝试重新抽牌。',
    errorNetwork: isEn ? 'Network error. Please try again.' : '网络异常，请重试',

    // Confirm dialog
    confirmReset: isEn
      ? 'Are you sure you want to draw again? Your current result will be cleared.'
      : '确定要重新抽牌吗？当前结果将被清空。',

    // Loading UI — career/wealth style
    loadingTitle: isEn ? 'Generating your reading...' : '正在生成解读...',
    loadingSubtitle: isEn
      ? 'AI is analyzing your spread in depth. Please wait a moment.'
      : 'AI 正在根据你的牌阵进行深度解析，请稍候',

    // Loading UI — love deep-reading style (future-lover)
    loadingTopHint: isEn ? '✨ AI is generating your deep reading...' : '✨ AI 正在为你生成深度解读...',
    loadingWaitHint: isEn
      ? 'Please wait. Your reading will appear automatically once it is ready.'
      : '请稍候，解读内容生成后将自动展示',
    loadingTimeHint: isEn
      ? 'This may take 10–30 seconds. Please wait a moment.'
      : '这可能需要 10-30 秒，请稍候',

    // Buttons
    btnDrawAgain: isEn ? 'Draw Again' : '重新抽牌',
    btnRetry: isEn ? 'Retry' : '重新生成',
    btnBackList: isEn ? 'Back to Spreads' : '返回列表',
    btnRetryClick: isEn ? 'Click to retry' : '点击重试',

    // Navigation
    backToHistory: isEn ? 'Back to My Readings' : '返回我的占卜记录',
    back: isEn ? 'Back' : '返回',
  };
}
