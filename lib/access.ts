/**
 * 会员状态判断工具（纯函数，客户端 / 服务端均可使用）
 *
 * 仅保留 isUserMember，供 hooks/useMembership.ts 和 lib/accessServer.ts 共用。
 * 其余 access 逻辑统一由 lib/accessServer.ts 处理。
 */

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
  if (!user) return false;

  const expiresAt = user.membership_expires_at;
  if (!expiresAt) return false;

  const expiresDate = new Date(expiresAt);
  if (isNaN(expiresDate.getTime())) return false;

  return expiresDate > new Date();
}
