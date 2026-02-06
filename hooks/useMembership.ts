/**
 * 会员状态 Hook
 * Membership Status Hook
 * 
 * TODO: 接入真实的会员系统
 * 目前返回 mock 数据，后续需要替换为实际的认证和会员状态检查
 */

export interface MembershipStatus {
  isMember: boolean;
  // 预留字段，后续可扩展
  membershipTier?: 'basic' | 'premium' | 'vip';
  expiresAt?: Date;
  features?: string[];
}

/**
 * 获取用户会员状态
 */
export function useMembership(): MembershipStatus {
  // TODO: 接入真实的会员系统
  // 1. 从 localStorage/sessionStorage 读取用户登录状态
  // 2. 调用后端 API 验证会员状态
  // 3. 处理会员过期、续费等逻辑
  
  // 临时设置为 false，用于显示会员提醒框（但不做拦截）
  const isMember = false;

  return {
    isMember,
    membershipTier: isMember ? 'basic' : undefined,
    expiresAt: undefined,
    features: isMember ? ['themed_readings', 'seasonal_spread', 'annual_fortune'] : [],
  };
}

