/**
 * 统一会员访问控制工具
 *
 * 会员判断依据：以 membership_expires_at 字段为准，而非 is_member。
 * 原因：is_member 可能因数据同步延迟而不准确，过期时间是最可靠的判断标准。
 *
 * canUseSpread 为纯函数，不直接查询数据库。
 * 原因：保持函数职责单一，便于测试和复用；数据获取由调用方负责。
 */

export type AccessCheckReason = 'member_only' | 'daily_limit';

export type AccessCheckResult = {
  allowed: boolean;
  reason?: AccessCheckReason;
};

/**
 * 判断用户是否为有效会员
 * 以 membership_expires_at 是否晚于当前时间为准
 */
export function isUserMember(
  user: {
    membership_expires_at?: string | null;
    is_member?: boolean | null;
  } | null | undefined
): boolean {
  if (!user) {
    return false;
  }

  const expiresAt = user.membership_expires_at;

  if (!expiresAt) {
    return false;
  }

  const expiresDate = new Date(expiresAt);

  if (isNaN(expiresDate.getTime())) {
    return false;
  }

  return expiresDate > new Date();
}

/**
 * 判断用户是否可以使用指定牌阵
 * 纯函数，不访问数据库，由调用方传入所需参数
 */
export function canUseSpread(params: {
  spreadAccess: 'free' | 'member';
  isMember: boolean;
  todayFreeUsageCount: number;
  freeDailyLimit?: number;
}): AccessCheckResult {
  const { spreadAccess, isMember, todayFreeUsageCount, freeDailyLimit = 3 } = params;

  // 会员专属牌阵，非会员不可用
  if (spreadAccess === 'member' && !isMember) {
    return { allowed: false, reason: 'member_only' };
  }

  // 免费牌阵，非会员检查每日限制
  if (spreadAccess === 'free' && !isMember && todayFreeUsageCount >= freeDailyLimit) {
    return { allowed: false, reason: 'daily_limit' };
  }

  return { allowed: true };
}

/**
 * 查询用户今日免费占卜使用次数
 * 从 reading_history 表统计当前用户今天创建的占卜记录数量
 */
export async function getTodayFreeUsageCount(params: {
  supabase: {
    from: (table: string) => {
      select: (
        columns: string,
        options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }
      ) => {
        eq: (column: string, value: string) => {
          gte: (column: string, value: string) => Promise<{ count: number | null; error: unknown }>;
        };
      };
    };
  };
  userId: string;
}): Promise<number> {
  const { supabase, userId } = params;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('reading_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString());

  if (error) {
    console.error('[getTodayFreeUsageCount] 查询失败:', error);
    return 0;
  }

  return count ?? 0;
}

/**
 * 检查非会员用户在解读阶段是否还有免费次数
 * 返回 { canProceed, isMember } 用于前端判断
 */
export interface ReadingAccessCheckResult {
  canProceed: boolean;
  isMember: boolean;
  reason?: 'daily_limit' | 'not_logged_in';
}

export async function checkReadingAccess(params: {
  supabase: {
    auth: {
      getUser: () => Promise<{ data: { user: { id: string } | null } }>;
    };
    from: (table: string) => {
      select: (columns: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => {
        eq: (column: string, value: string) => {
          gte: (column: string, value: string) => Promise<{ count: number | null; error: unknown }>;
          single: () => Promise<{ data: { membership_expires_at?: string | null } | null; error: unknown }>;
        };
        single: () => Promise<{ data: { membership_expires_at?: string | null } | null; error: unknown }>;
      };
    };
  };
  freeDailyLimit?: number;
}): Promise<ReadingAccessCheckResult> {
  const { supabase, freeDailyLimit = 3 } = params;

  const { data: { user } } = await supabase.auth.getUser();

  // 未登录用户直接放行（让 saveReadingHistory 自己跳过保存）
  if (!user) {
    return { canProceed: true, isMember: false, reason: 'not_logged_in' };
  }

  // 检查会员状态
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', user.id)
    .single();

  const isMember = isUserMember(profile);

  // 会员直接放行
  if (isMember) {
    return { canProceed: true, isMember: true };
  }

  // 非会员检查今日已完成的解读次数
  const todayCount = await getTodayFreeUsageCount({ supabase, userId: user.id });

  if (todayCount >= freeDailyLimit) {
    return { canProceed: false, isMember: false, reason: 'daily_limit' };
  }

  return { canProceed: true, isMember: false };
}
