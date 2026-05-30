import { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const resendErrorMapZh: Record<string, string> = {
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'Too many requests': '请求过于频繁，请稍后再试',
  'For security purposes, you can only request this after': '操作过于频繁，请稍后再试',
}

const resendErrorMapEn: Record<string, string> = {
  'Email rate limit exceeded': 'Too many emails sent. Please try again later.',
  'Too many requests': 'Too many requests. Please try again later.',
  'For security purposes, you can only request this after': 'Too many attempts. Please try again later.',
}

function toLocalizedResendError(msg: string, isEn: boolean): string {
  const lower = msg.toLowerCase()
  const map = isEn ? resendErrorMapEn : resendErrorMapZh
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key.toLowerCase())) return val
  }
  return isEn ? `Failed to send: ${msg}` : `发送失败：${msg}`
}

interface Profile {
  username: string | null
  membership_expires_at: string | null
  created_at: string | null
}

type PageState = 'loading' | 'ready' | 'unauthenticated'

function formatDate(iso: string | null, fallback: string): string {
  if (!iso) return fallback
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 以 profiles.membership_expires_at 为准：有值、可解析且晚于当前时间则为有效会员 */
function isActiveMemberByExpiresAt(expiresAt: string | null | undefined): boolean {
  if (expiresAt == null || String(expiresAt).trim() === '') return false
  const d = new Date(expiresAt)
  if (Number.isNaN(d.getTime())) return false
  return d > new Date()
}

export default function AccountPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>({
    username: null,
    membership_expires_at: null,
    created_at: null,
  })
  const [state, setState] = useState<PageState>('loading')

  const [isEditing, setIsEditing] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)

  const texts = isEn ? {
    title: 'Account - FateAura',
    metaDesc: 'Manage your FateAura account',
    back: 'Back to Home',
    heading: 'Account',
    subtitle: 'View and manage your account details.',
    labelEmail: 'Email',
    labelEmailVerification: 'Email Verification',
    verifiedGoogle: 'Verified (Google)',
    verified: 'Verified',
    unverified: 'Unverified',
    sendingVerification: 'Sending...',
    sendVerificationBtn: 'Send Verification Email',
    verificationSent: 'Verification email sent. Please check your inbox.',
    labelNickname: 'Nickname',
    noNickname: 'Nickname not set',
    edit: 'Edit',
    placeholderNickname: 'Enter new nickname',
    saving: 'Saving...',
    save: 'Save',
    cancel: 'Cancel',
    labelMembership: 'Membership Status',
    memberActive: 'Member',
    memberFree: 'Free User',
    labelMembershipExpires: 'Membership Expires On',
    labelJoined: 'Joined',
    unknown: 'Unknown',
    myReadings: 'My Readings',
    membershipCenter: 'Membership',
    changePassword: 'Change Password',
    signingOut: 'Signing out...',
    signOut: 'Sign Out',
    backToHome: 'Back to Home',
    nicknameEmpty: 'Nickname cannot be empty.',
    nicknameLength: 'Nickname must be 2-20 characters.',
    nicknameSaveFail: (msg: string) => `Failed to save: ${msg}`,
    nicknameSaved: 'Nickname updated.',
  } : {
    title: '个人中心 - FateAura',
    metaDesc: '管理你的 FateAura 账户',
    back: '返回首页',
    heading: '个人中心',
    subtitle: '查看和管理你的账户信息',
    labelEmail: '邮箱',
    labelEmailVerification: '邮箱验证',
    verifiedGoogle: '已验证（Google 登录）',
    verified: '已验证',
    unverified: '未验证',
    sendingVerification: '发送中...',
    sendVerificationBtn: '发送验证邮件',
    verificationSent: '验证邮件已发送，请前往邮箱查看',
    labelNickname: '昵称',
    noNickname: '未设置昵称',
    edit: '编辑',
    placeholderNickname: '请输入新昵称',
    saving: '保存中...',
    save: '保存',
    cancel: '取消',
    labelMembership: '会员状态',
    memberActive: '会员用户',
    memberFree: '普通用户',
    labelMembershipExpires: '会员到期时间',
    labelJoined: '注册时间',
    unknown: '未知',
    myReadings: '我的占卜记录',
    membershipCenter: '会员中心',
    changePassword: '修改密码',
    signingOut: '退出中...',
    signOut: '退出登录',
    backToHome: '返回首页',
    nicknameEmpty: '昵称不能为空',
    nicknameLength: '昵称长度需为 2-20 个字符',
    nicknameSaveFail: (msg: string) => `保存失败: ${msg}`,
    nicknameSaved: '昵称已更新',
  }

  const isGoogleUser = user?.app_metadata?.provider === 'google' ||
    (Array.isArray(user?.app_metadata?.providers) && user.app_metadata.providers.includes('google'))
  const isEmailVerified = isGoogleUser || !!user?.email_confirmed_at

  const handleSendVerification = useCallback(async () => {
    if (!user?.email) return
    setSendingVerification(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    setSendingVerification(false)
    if (error) {
      setToast({ type: 'error', text: toLocalizedResendError(error.message, isEn) })
    } else {
      setToast({ type: 'success', text: texts.verificationSent })
    }
  }, [user?.email, isEn, texts.verificationSent])

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setState('unauthenticated')
        return
      }

      setUser(currentUser)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, created_at, membership_expires_at')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (profileError) {
        console.warn('[account] profiles 读取失败:', profileError.message)
      }

      if (profileData) {
        const exp = profileData.membership_expires_at
        setProfile({
          username: profileData.username != null ? String(profileData.username) : null,
          membership_expires_at:
            exp != null && String(exp).trim() !== '' ? String(exp) : null,
          created_at: profileData.created_at ?? currentUser.created_at ?? null,
        })
      } else {
        setProfile({
          username: null,
          membership_expires_at: null,
          created_at: currentUser.created_at ?? null,
        })
      }

      setState('ready')
    }

    load()
  }, [])

  useEffect(() => {
    if (state === 'unauthenticated') {
      router.replace('/login')
    }
  }, [state, router])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  function startEdit() {
    setNicknameInput(profile.username ?? '')
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setNicknameInput('')
  }

  async function handleSaveNickname() {
    if (!user) return

    const trimmed = nicknameInput.trim()
    if (!trimmed) {
      setToast({ type: 'error', text: texts.nicknameEmpty })
      return
    }

    if (trimmed.length < 2 || trimmed.length > 20) {
      setToast({ type: 'error', text: texts.nicknameLength })
      return
    }

    setSaving(true)

    const payload = { id: user.id, username: trimmed, updated_at: new Date().toISOString() }

    console.log('[account] user.id:', user.id)
    console.log('[account] 准备写入 payload:', JSON.stringify(payload, null, 2))
    console.log('[account] 操作方式: update profiles set username, updated_at where id = user.id')

    const { data, error, status, statusText } = await supabase
      .from('profiles')
      .update({ username: trimmed, updated_at: payload.updated_at })
      .eq('id', user.id)
      .select()

    console.log('[account] Supabase 响应 status:', status, statusText)
    console.log('[account] Supabase 响应 data:', JSON.stringify(data, null, 2))

    setSaving(false)

    if (error) {
      console.error('[account] 昵称保存失败 error 全量:', JSON.stringify(error, null, 2))
      console.error('[account] error.message:', error.message)
      console.error('[account] error.code:', error.code)
      console.error('[account] error.details:', error.details)
      console.error('[account] error.hint:', (error as any).hint)
      setToast({ type: 'error', text: texts.nicknameSaveFail(error.message) })
      return
    }

    if (!data || data.length === 0) {
      console.warn('[account] update 返回 0 行，profiles 中可能不存在 id =', user.id, '的记录，尝试 insert')
      const { data: insertData, error: insertError, status: insertStatus } = await supabase
        .from('profiles')
        .insert(payload)
        .select()

      console.log('[account] insert 响应 status:', insertStatus)
      console.log('[account] insert 响应 data:', JSON.stringify(insertData, null, 2))

      if (insertError) {
        console.error('[account] insert 也失败:', JSON.stringify(insertError, null, 2))
        console.error('[account] insertError.message:', insertError.message)
        console.error('[account] insertError.code:', insertError.code)
        console.error('[account] insertError.details:', insertError.details)
        console.error('[account] insertError.hint:', (insertError as any).hint)
        setToast({ type: 'error', text: texts.nicknameSaveFail(insertError.message) })
        return
      }
    }

    setProfile((prev) => ({ ...prev, username: trimmed }))
    setIsEditing(false)
    setToast({ type: 'success', text: texts.nicknameSaved })
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (state === 'loading' || state === 'unauthenticated') {
    return (
      <>
        <Head>
          <title>{texts.title}</title>
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <span className="material-symbols-outlined text-primary/60 text-3xl animate-spin">
            progress_activity
          </span>
        </div>
      </>
    )
  }

  const nicknameTrimmed = profile.username?.trim() ?? ''
  const displayNickname = nicknameTrimmed || texts.noNickname
  const memberActive = isActiveMemberByExpiresAt(profile.membership_expires_at)
  const displayMembership = memberActive ? texts.memberActive : texts.memberFree
  const displayDate = formatDate(profile.created_at, texts.unknown)
  const displayMembershipExpires = formatDate(profile.membership_expires_at, texts.unknown)

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="mx-auto max-w-lg px-4 sm:px-8 py-6">
            {/* Header */}
            <div className="relative">
              <button
                onClick={() => router.push('/')}
                className="mb-2 flex items-center gap-2 text-white/70 hover:text-primary transition-colors group"
              >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span className="text-xs font-medium">{texts.back}</span>
              </button>

              <div className="flex flex-col gap-1">
                <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
                  {texts.heading}
                </h1>
                <p className="text-white/60 text-sm font-normal leading-snug">
                  {texts.subtitle}
                </p>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            {/* Profile Card */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 space-y-5">
              {/* Avatar placeholder + nickname */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <div className="min-w-0">
                  <p className={`text-lg font-semibold truncate ${nicknameTrimmed ? 'text-white' : 'text-white/40'}`}>
                    {displayNickname}
                  </p>
                  <p className="text-white/40 text-sm truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Info rows */}
              <div className="space-y-4">
                <InfoRow label={texts.labelEmail} value={user?.email ?? texts.unknown} icon="mail" />

                {/* Email verification */}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-white/30 text-lg w-6 text-center shrink-0 mt-0.5">
                    {isEmailVerified ? 'verified_user' : 'gpp_maybe'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/40 text-[11px] leading-none mb-0.5">{texts.labelEmailVerification}</p>
                    {isEmailVerified ? (
                      <p className="text-sm text-emerald-400">
                        {isGoogleUser ? texts.verifiedGoogle : texts.verified}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-amber-400">{texts.unverified}</p>
                        <button
                          onClick={handleSendVerification}
                          disabled={sendingVerification}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-white/50 text-xs font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">send</span>
                          {sendingVerification ? texts.sendingVerification : texts.sendVerificationBtn}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <InfoRow
                  label={texts.labelNickname}
                  value={displayNickname}
                  icon="badge"
                  dimValue={!nicknameTrimmed}
                  action={
                    !isEditing ? (
                      <button
                        onClick={startEdit}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        {texts.edit}
                      </button>
                    ) : undefined
                  }
                />

                {isEditing && (
                  <div className="pl-9 flex flex-col gap-3 animate-fade-in">
                    <input
                      type="text"
                      maxLength={20}
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder={texts.placeholderNickname}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveNickname()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveNickname}
                        disabled={saving}
                        className="rounded-lg bg-primary px-4 py-1.5 text-white text-xs font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? texts.saving : texts.save}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="rounded-lg bg-white/5 border border-white/10 px-4 py-1.5 text-white/60 text-xs font-medium hover:bg-white/10 disabled:opacity-50 transition-colors"
                      >
                        {texts.cancel}
                      </button>
                      <span className="text-white/30 text-[11px] ml-auto">{nicknameInput.length}/20</span>
                    </div>
                  </div>
                )}

                <InfoRow label={texts.labelMembership} value={displayMembership} icon="card_membership" dimValue={!memberActive} />
                {memberActive && (
                  <InfoRow label={texts.labelMembershipExpires} value={displayMembershipExpires} icon="event" />
                )}
                <InfoRow label={texts.labelJoined} value={displayDate} icon="calendar_today" />
              </div>
            </div>

            {/* My Readings */}
            <div className="mt-6">
              <Link
                href="/history"
                className="w-full rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm px-6 py-3.5 text-white text-sm font-medium hover:bg-primary/20 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">auto_stories</span>
                {texts.myReadings}
              </Link>
            </div>

            <div className="mt-3">
              <Link
                href="/membership"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-6 py-3.5 text-white/70 text-sm font-medium hover:bg-white/[0.06] hover:text-white/90 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                {texts.membershipCenter}
              </Link>
            </div>

            {/* Change Password */}
            <div className="mt-3">
              <Link
                href="/change-password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-6 py-3.5 text-white/70 text-sm font-medium hover:bg-white/[0.06] hover:text-white/90 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">lock_reset</span>
                {texts.changePassword}
              </Link>
            </div>

            {/* Sign Out */}
            <div className="mt-3">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-6 py-3.5 text-white/70 text-sm font-medium hover:bg-white/[0.06] hover:text-white/90 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                {signingOut ? texts.signingOut : texts.signOut}
              </button>
            </div>

            {/* Back to Home */}
            <div className="mt-4 flex justify-center">
              <Link
                href="/"
                className="text-white/40 text-xs hover:text-primary transition-colors"
              >
                {texts.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-sm animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border border-red-500/30 text-red-400'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.text}
        </div>
      )}
    </>
  )
}

function InfoRow({
  label,
  value,
  icon,
  dimValue,
  action,
}: {
  label: string
  value: string
  icon: string
  dimValue?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-white/30 text-lg w-6 text-center shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white/40 text-[11px] leading-none mb-0.5">{label}</p>
          <p className={`text-sm truncate ${dimValue ? 'text-white/30 italic' : 'text-white/80'}`}>
            {value}
          </p>
        </div>
        {action}
      </div>
    </div>
  )
}
