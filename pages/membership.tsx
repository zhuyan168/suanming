import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useMembership } from '../hooks/useMembership'
import { getAuthHeaders } from '../lib/apiHeaders'

function formatMembershipDate(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === '') return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function MembershipPage() {
  const { isMember, loading, userProfile, userId, refetch } = useMembership()
  const [code, setCode] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const handleRedeemClick = async () => {
    const trimmed = code.trim()
    if (!trimmed || redeemLoading) return

    setRedeemError(null)
    setRedeemSuccess(false)
    setRedeemLoading(true)

    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/membership/redeem', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: trimmed }),
      })

      let payload: { success?: boolean; newMembershipExpiresAt?: string; error?: string } = {}
      try {
        payload = await res.json()
      } catch {
        setRedeemError('服务暂时不可用，请稍后再试')
        return
      }

      if (!res.ok) {
        setRedeemError(typeof payload.error === 'string' ? payload.error : '兑换失败，请稍后再试')
        return
      }

      if (payload.success && payload.newMembershipExpiresAt) {
        setRedeemSuccess(true)
        await refetch()
      } else {
        setRedeemError('兑换失败，请稍后再试')
      }
    } catch {
      setRedeemError('网络异常，请检查连接后重试')
    } finally {
      setRedeemLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>开通会员 - Mystic Insights</title>
        <meta name="description" content="解锁高级牌阵与更完整的占卜体验" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-lg px-4 sm:px-6 py-10 sm:py-14">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-5">
              <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">开通会员</h1>
            <p className="mt-3 text-white/60 text-sm sm:text-base leading-relaxed">
              解锁高级牌阵与更完整的占卜体验
            </p>
          </header>

          {!loading && isMember && (
            <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200/90 space-y-1">
              <p className="font-medium text-center">你当前已是会员用户</p>
              <p className="text-center text-emerald-200/75">
                会员到期时间：{formatMembershipDate(userProfile?.membership_expires_at)}
              </p>
            </div>
          )}

          {!loading && userId && !isMember && (
            <div className="mb-8 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 text-center">
              当前账号未开通会员，兑换会员码或后续支付开通后即可享受会员权益
            </div>
          )}

          {!loading && !userId && (
            <div className="mb-8 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90 text-center">
              <p>登录后即可兑换会员码</p>
              <Link href="/login" className="mt-2 inline-block text-primary hover:underline font-medium">
                去登录
              </Link>
            </div>
          )}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
              会员权益
            </h2>
            <ul className="space-y-3 text-white/70 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">style</span>
                <span>会员专属高级牌阵，含六芒星、马蹄铁、凯尔特十字等深度牌阵</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">psychology</span>
                <span>更深度的解读内容，看清复杂议题与长期走向</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">update</span>
                <span>后续持续扩展更多会员功能与体验优化</span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/90 mb-3">支付开通</h2>
            <p className="text-white/45 text-sm leading-relaxed text-center py-6">
              支付功能即将上线
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
            <h2 className="text-sm font-semibold text-white/90 mb-4">会员码兑换</h2>
            <label htmlFor="membership-code" className="sr-only">
              会员码
            </label>
            <input
              id="membership-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="请输入会员码"
              value={code}
              disabled={redeemLoading}
              onChange={(e) => {
                setCode(e.target.value)
                setRedeemError(null)
                setRedeemSuccess(false)
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors mb-4 disabled:opacity-50"
            />
            {redeemSuccess && (
              <p className="mb-3 text-sm text-center text-emerald-300/95" role="status">
                兑换成功
              </p>
            )}
            {redeemError && (
              <p className="mb-3 text-sm text-center text-red-300/90" role="alert">
                {redeemError}
              </p>
            )}
            <button
              type="button"
              onClick={handleRedeemClick}
              disabled={redeemLoading || !code.trim()}
              className="w-full rounded-xl bg-primary/90 hover:bg-primary disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold py-3 transition-colors"
            >
              {redeemLoading ? '兑换中…' : '兑换'}
            </button>
          </section>

          <footer className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center text-sm">
            <Link
              href="/"
              className="text-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              返回首页
            </Link>
            <Link
              href="/account"
              className="text-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              返回个人中心
            </Link>
          </footer>
        </div>
      </div>
    </>
  )
}
