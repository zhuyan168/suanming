import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMembership } from '../hooks/useMembership'
import { getAuthHeaders } from '../lib/apiHeaders'

type MembershipPlanKey = 'monthly' | 'quarterly' | 'annual'

const MEMBERSHIP_PLANS: Array<{
  key: MembershipPlanKey
  price: string
  intervalEn: string
  intervalZh: string
  nameEn: string
  nameZh: string
  badgeEn?: string
  badgeZh?: string
  noteEn: string
  noteZh: string
}> = [
  {
    key: 'monthly',
    nameEn: 'Monthly',
    nameZh: '月会员',
    price: '$9.90',
    intervalEn: 'month',
    intervalZh: '月',
    noteEn: 'Billed monthly. Cancel anytime.',
    noteZh: '每月自动续费，可随时取消。',
  },
  {
    key: 'quarterly',
    nameEn: 'Quarterly',
    nameZh: '季度会员',
    price: '$23.90',
    intervalEn: '3 months',
    intervalZh: '3 个月',
    badgeEn: 'Popular',
    badgeZh: '推荐',
    noteEn: 'Billed every 3 months. Better monthly value.',
    noteZh: '每 3 个月自动续费，月均价格更优惠。',
  },
  {
    key: 'annual',
    nameEn: 'Annual',
    nameZh: '年会员',
    price: '$86.90',
    intervalEn: 'year',
    intervalZh: '年',
    badgeEn: 'Best value',
    badgeZh: '最划算',
    noteEn: 'Billed yearly. Best long-term value.',
    noteZh: '每年自动续费，长期使用最划算。',
  },
]

function formatMembershipDate(iso: string | null | undefined): string {
  if (iso == null || String(iso).trim() === '') return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
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
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<MembershipPlanKey | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const texts = isEn ? {
    title: 'Membership - FateAura',
    metaDesc: 'Subscribe to FateAura membership for advanced spreads and deeper tarot readings.',
    heading: 'Membership',
    subtitle: 'Unlock advanced spreads and deeper reading experiences.',
    alreadyMember: 'You are already a member.',
    memberExpires: 'Membership expires on: ',
    notMember: 'Your account does not have an active membership yet. Choose a plan below to unlock member benefits.',
    loginPrompt: 'Sign in before subscribing or redeeming a membership code.',
    loginBtn: 'Sign In',
    benefitsTitle: 'Member Benefits',
    benefit1: 'Access advanced spreads including Hexagram, Horseshoe, Celtic Cross, and more.',
    benefit2: 'Receive deeper readings for complex questions and long-term themes.',
    benefit3: 'Keep access to new member features and future experience improvements.',
    paymentTitle: 'Subscription Plans',
    choosePlan: 'Subscriptions renew automatically. You can cancel anytime; paid access remains until the current period ends.',
    subscribe: 'Subscribe',
    checkoutLoading: 'Opening...',
    checkoutLoginPrompt: 'Please sign in before purchasing membership.',
    checkoutError: 'Unable to open checkout. Please try again later.',
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
    title: '会员中心 - FateAura',
    metaDesc: '开通 FateAura 会员，解锁高级牌阵和更深入的塔罗解读体验。',
    heading: '会员中心',
    subtitle: '解锁高级牌阵，获得更完整、更深入的解读体验。',
    alreadyMember: '您当前已经是会员。',
    memberExpires: '会员有效期至：',
    notMember: '当前账号还没有有效会员。请选择下方套餐开通会员权益。',
    loginPrompt: '请先登录，再开通会员或兑换会员码。',
    loginBtn: '去登录',
    benefitsTitle: '会员权益',
    benefit1: '解锁六芒星、马蹄铁、凯尔特十字等高级牌阵。',
    benefit2: '获得更深入的解读内容，适合复杂问题和长期趋势判断。',
    benefit3: '持续享受后续新增的会员功能和体验优化。',
    paymentTitle: '订阅套餐',
    choosePlan: '订阅会自动续费，可随时取消；取消后，已付款周期内的会员权益仍会保留。',
    subscribe: '订阅',
    checkoutLoading: '打开中...',
    checkoutLoginPrompt: '请先登录后再开通会员。',
    checkoutError: '暂时无法打开支付页面，请稍后再试。',
    redeemTitle: '会员码兑换',
    redeemPlaceholder: '请输入会员码',
    redeemSuccess: '兑换成功！',
    redeemLoading: '兑换中...',
    redeemBtn: '兑换',
    backHome: '返回首页',
    backAccount: '返回账户',
    errorServiceUnavailable: '服务暂时不可用，请稍后再试。',
    errorRedeemFailed: '兑换失败，请稍后再试。',
    errorNetwork: '网络异常，请检查连接后再试。',
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

  const handleCheckoutClick = async (planKey: MembershipPlanKey) => {
    if (checkoutLoadingPlan) return

    if (!userId) {
      setCheckoutError(texts.checkoutLoginPrompt)
      return
    }

    setCheckoutError(null)
    setCheckoutLoadingPlan(planKey)

    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/creem/create-checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planKey }),
      })

      let payload: { checkoutUrl?: string; error?: string } = {}
      try {
        payload = await res.json()
      } catch {
        setCheckoutError(texts.checkoutError)
        return
      }

      if (!res.ok || !payload.checkoutUrl) {
        setCheckoutError(typeof payload.error === 'string' ? payload.error : texts.checkoutError)
        return
      }

      window.location.href = payload.checkoutUrl
    } catch {
      setCheckoutError(texts.checkoutError)
    } finally {
      setCheckoutLoadingPlan(null)
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

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-6">
            <h2 className="text-sm font-semibold text-white/90 mb-3">{texts.paymentTitle}</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-5">{texts.choosePlan}</p>
            <div className="space-y-3">
              {MEMBERSHIP_PLANS.map((plan) => {
                const isLoadingPlan = checkoutLoadingPlan === plan.key
                const planName = isEn ? plan.nameEn : plan.nameZh
                const interval = isEn ? plan.intervalEn : plan.intervalZh
                const badge = isEn ? plan.badgeEn : plan.badgeZh
                const note = isEn ? plan.noteEn : plan.noteZh

                return (
                  <div
                    key={plan.key}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-white font-semibold">{planName}</h3>
                          {badge && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                              {badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-white/55">
                          <span className="text-white/90 font-semibold">{plan.price}</span>
                          <span> / {interval}</span>
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/45">{note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckoutClick(plan.key)}
                        disabled={loading || !!checkoutLoadingPlan || !userId}
                        className="shrink-0 rounded-lg bg-primary/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoadingPlan ? texts.checkoutLoading : texts.subscribe}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            {checkoutError && (
              <p className="mt-4 text-center text-sm text-red-300/90" role="alert">
                {checkoutError}
              </p>
            )}
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
