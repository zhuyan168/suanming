/**
 * 会员系统占位模块
 * 
 * ⚠️ 重要：这是占位代码，不是真实实现
 * 当前项目尚未实现会员系统，这里只是预留接口位
 */

/**
 * 检查用户是否为会员（占位函数）
 * 
 * TODO: 替换为真实会员检查逻辑
 * - 需要接入用户系统
 * - 需要检查订阅状态
 * - 需要验证会员有效期
 * 
 * @returns 永远返回 false（当前阶段）
 */
export function isMemberPlaceholder(): boolean {
  // TODO: replace with real membership check when membership system is implemented
  return false;
}

/**
 * 获取用户 ID（占位函数）
 * 
 * TODO: 替换为真实用户 ID 获取逻辑
 * 
 * @returns 永远返回 null（当前阶段）
 */
export function getUserIdPlaceholder(): string | null {
  // TODO: replace with real user ID when authentication is implemented
  return null;
}

/**
 * 检查用户是否可以使用年度运势功能（占位函数）
 * 
 * TODO: 替换为真实权限检查
 * - 检查是否登录
 * - 检查会员状态
 * - 检查功能权限
 * 
 * @returns 永远返回 true（当前阶段，允许所有人使用）
 */
export function canAccessAnnualFortunePlaceholder(): boolean {
  // TODO: replace with real access control when membership system is implemented
  // For now, allow everyone to access (entry control is handled elsewhere)
  return true;
}

/**
 * 会员功能标记
 * 用于标识哪些功能需要会员权限
 */
export const MEMBER_FEATURES = {
  // LLM 增强解读（需要会员）
  LLM_INTERPRETATION: false, // TODO: set to true when membership is implemented
  
  // 下载图片（需要会员）
  DOWNLOAD_IMAGE: false, // TODO: set to true when membership is implemented
  
  // 分享到社交媒体（需要会员）
  SOCIAL_SHARE: false, // TODO: set to true when membership is implemented
  
  // 历史记录查看（需要会员）
  VIEW_HISTORY: false, // TODO: set to true when membership is implemented
} as const;

/**
 * 获取会员功能状态
 * 
 * @param feature 功能标识
 * @returns 是否启用（当前阶段全部为 false）
 */
export function isMemberFeatureEnabled(feature: keyof typeof MEMBER_FEATURES): boolean {
  return MEMBER_FEATURES[feature];
}

