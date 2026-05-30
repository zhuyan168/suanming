import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
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
  const router = useRouter()
  const isEn = router.locale === 'en'
  const { isMember, loading, userProfile, userId, refetch } = useMembership()
  const [code, setCode] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemError, setRedeemError] = useState<string | null>(null)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const texts = isEn ? {
    title: 'Membership - FateAura',
    metaDesc: 'Manage membership access and redeem membership codes on FateAura.',
    heading: 'Membership',
    subtitle: 'Use membership access for advanced spreads and deeper reading experiences.',
    alreadyMember: 'You are already a member.',
    memberExpires: 'Membership expires on:',
    notMember: 'Your account does not have an active membership. Redeem a membership code to unlock member benefits.',
    loginPrompt: 'Sign in to redeem a membership code.',
    loginBtn: 'Sign In',
    benefitsTitle: 'Member Benefits',
    benefit1: 'Access to exclusive advanced spreads including Hexagram, Horseshoe, Celtic Cross, and more.',
    benefit2: 'Deeper, more detailed readings to uncover complex issues and long-term trends.',
    benefit3: 'Ongoing access to new member features and experience improvements.',
    paymentTitle: 'Membership Access',
    paymentComingSoon: 'Online payment is coming soon. For now, use a membership code if you have one.',
    redeemTitle: 'Redeem Code',
    redeemPlaceholder: 'Enter membership code',
    redeemSuccess: 'Redeemed successfully!',
    redeemLoading: 'Redeeming...',
    redeemBtn: 'Redeem',
    backHome: 'Back to Home',
    backAccount: 'Back to Account',
    errorServiceUnavailable: 'Service temporarily unavailable. Please try again later.',
    errorRedeemFailed: 'Redemption failed. Please try again.',
    errorNetwork: 'Network error. Please check your connection and try again.',
  } : {
    title: '开通会员 - FateAura',
    metaDesc: '解锁高级牌阵与更完整的占卜体验',
    heading: '开通会员',
    subtitle: '解锁高级牌阵与更完整的占卜体验',
    alreadyMember: '你当前已是会员用户',
    memberExpires: '会员到期时间：',
    notMember: '当前账号未开通会员，兑换会员码或后续支付开通后即可享受会员权益',
    loginPrompt: '登录后即可兑换会员码',
    loginBtn: '去登录',
    benefitsTitle: '会员权益',
    benefit1: '会员专属高级牌阵，含六芒星、马蹄铁、凯尔特十字等深度牌阵',
    benefit2: '更深度的解读内容，看清复杂议题与长期走向',
    benefit3: '后续持续扩展更多会员功能与体验优化',
    paymentTitle: '支付开通',
    paymentComingSoon: '支付功能即将上线',
    redeemTitle: '会员码兑换',
    redeemPlaceholder: '请输入会员码',
    redeemSuccess: '兑换成功',
    redeemLoading: '兑换中…',
    redeemBtn: '兑换',
    backHome: '返回首页',
    backAccount: '返回个人中心',
    errorServiceUnavailable: '服务暂时不可用，请稍后再试',
    errorRedeemFailed: '兑换失败，请稍后再试',
    errorNetwork: '网络异常，请检查连接后重试',
  }

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
        setRedeemError(texts.errorServiceUnavailable)
        return
      }

      if (!res.ok) {
        setRedeemError(typeof payload.error === 'string' ? payload.error : texts.errorRedeemFailed)
        return
      }

      if (payload.success && payload.newMembershipExpiresAt) {
        setRedeemSuccess(true)
        await refetch()
      } else {
        setRedeemError(texts.errorRedeemFailed)
      }
    } catch {
      setRedeemError(texts.errorNetwork)
    } finally {
      setRedeemLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{texts.heading}</h1>
            <p className="mt-3 text-white/60 text-sm sm:text-base leading-relaxed">
              {texts.subtitle}
            </p>
          </header>

          {!loading && isMember && (
            <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200/90 space-y-1">
              <p className="font-medium text-center">{texts.alreadyMember}</p>
              <p className="text-center text-emerald-200/75">
                {texts.memberExpires}{formatMembershipDate(userProfile?.membership_expires_at)}
              </p>
            </div>
          )}

          {!loading && userId && !isMember && (
            <div className="mb-8 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 text-center">
              {texts.notMember}
            </div>
          )}

          {!loading && !userId && (
            <div className="mb-8 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90 text-center">
              <p>{texts.loginPrompt}</p>
              <Link href="/login" className="mt-2 inline-block text-primary hover:underline font-medium">
                {texts.loginBtn}
              </Link>
            </div>
          )}

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
              {texts.benefitsTitle}
            </h2>
            <ul className="space-y-3 text-white/70 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">style</span>
                <span>{texts.benefit1}</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">psychology</span>
                <span>{texts.benefit2}</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">update</span>
                <span>{texts.benefit3}</span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/90 mb-3">{texts.paymentTitle}</h2>
            <p className="text-white/45 text-sm leading-relaxed text-center py-6">
              {texts.paymentComingSoon}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
            <h2 className="text-sm font-semibold text-white/90 mb-4">{texts.redeemTitle}</h2>
            <label htmlFor="membership-code" className="sr-only">
              {texts.redeemTitle}
            </label>
            <input
              id="membership-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder={texts.redeemPlaceholder}
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
                {texts.redeemSuccess}
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
              {redeemLoading ? texts.redeemLoading : texts.redeemBtn}
            </button>
          </section>

          <footer className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center text-sm">
            <Link
              href="/"
              className="text-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              {texts.backHome}
            </Link>
            <Link
              href="/account"
              className="text-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              {texts.backAccount}
            </Link>
          </footer>
        </div>
      </div>
    </>
  )
}
