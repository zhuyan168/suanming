import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profile {
  username: string | null
  is_member: boolean
  created_at: string | null
}

type PageState = 'loading' | 'ready' | 'unauthenticated'

function formatDate(iso: string | null): string {
  if (!iso) return '未知'
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>({
    username: null,
    is_member: false,
    created_at: null,
  })
  const [state, setState] = useState<PageState>('loading')

  const [isEditing, setIsEditing] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setState('unauthenticated')
        return
      }

      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, is_member, created_at')
        .eq('id', currentUser.id)
        .single()

      if (profileData) {
        setProfile({
          username: profileData.username ?? null,
          is_member: profileData.is_member === true,
          created_at: profileData.created_at ?? currentUser.created_at ?? null,
        })
      } else {
        setProfile({
          username: null,
          is_member: false,
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
      setToast({ type: 'error', text: '昵称不能为空' })
      return
    }

    if (trimmed.length < 2 || trimmed.length > 20) {
      setToast({ type: 'error', text: '昵称长度需为 2-20 个字符' })
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
      setToast({ type: 'error', text: `保存失败: ${error.message}` })
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
        setToast({ type: 'error', text: `保存失败: ${insertError.message}` })
        return
      }
    }

    setProfile((prev) => ({ ...prev, username: trimmed }))
    setIsEditing(false)
    setToast({ type: 'success', text: '昵称已更新' })
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
          <title>个人中心 - FateAura</title>
        </Head>
        <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
          <span className="material-symbols-outlined text-primary/60 text-3xl animate-spin">
            progress_activity
          </span>
        </div>
      </>
    )
  }

  const displayNickname = profile.username || '未设置昵称'
  const displayMembership = profile.is_member ? '会员用户' : '普通用户'
  const displayDate = formatDate(profile.created_at)

  return (
    <>
      <Head>
        <title>个人中心 - FateAura</title>
        <meta name="description" content="管理你的 FateAura 账户" />
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
                <span className="text-xs font-medium">返回首页</span>
              </button>

              <div className="flex flex-col gap-1">
                <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
                  个人中心
                </h1>
                <p className="text-white/60 text-sm font-normal leading-snug">
                  查看和管理你的账户信息
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
                  <p className={`text-lg font-semibold truncate ${profile.username ? 'text-white' : 'text-white/40'}`}>
                    {displayNickname}
                  </p>
                  <p className="text-white/40 text-sm truncate">{user?.email ?? ''}</p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Info rows */}
              <div className="space-y-4">
                <InfoRow label="邮箱" value={user?.email ?? '未知'} icon="mail" />
                <InfoRow
                  label="昵称"
                  value={displayNickname}
                  icon="badge"
                  dimValue={!profile.username}
                  action={
                    !isEditing ? (
                      <button
                        onClick={startEdit}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        编辑
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
                      placeholder="请输入新昵称"
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
                        {saving ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="rounded-lg bg-white/5 border border-white/10 px-4 py-1.5 text-white/60 text-xs font-medium hover:bg-white/10 disabled:opacity-50 transition-colors"
                      >
                        取消
                      </button>
                      <span className="text-white/30 text-[11px] ml-auto">{nicknameInput.length}/20</span>
                    </div>
                  </div>
                )}

                <InfoRow label="会员状态" value={displayMembership} icon="card_membership" dimValue={!profile.is_member} />
                <InfoRow label="注册时间" value={displayDate} icon="calendar_today" />
              </div>
            </div>

            {/* 我的占卜记录 */}
            <div className="mt-6">
              <Link
                href="/history"
                className="w-full rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm px-6 py-3.5 text-white text-sm font-medium hover:bg-primary/20 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">auto_stories</span>
                我的占卜记录
              </Link>
            </div>

            {/* 退出登录 */}
            <div className="mt-3">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-6 py-3.5 text-white/70 text-sm font-medium hover:bg-white/[0.06] hover:text-white/90 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                {signingOut ? '退出中...' : '退出登录'}
              </button>
            </div>

            {/* 返回首页 */}
            <div className="mt-4 flex justify-center">
              <Link
                href="/"
                className="text-white/40 text-xs hover:text-primary transition-colors"
              >
                返回首页
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
