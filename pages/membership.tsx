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
    nameEn: 'Monthly Membership',
    nameZh: 'Monthly / 月度会员',
    price: '$9.90',
    intervalEn: 'month',
    intervalZh: '月',
    noteEn: 'Renews monthly. Cancel anytime.',
    noteZh: '每月自动续费，可随时取消。',
  },
  {
    key: 'quarterly',
    nameEn: 'Quarterly Membership',
    nameZh: 'Quarterly / 季度会员',
    price: '$23.90',
    intervalEn: '3 months',
    intervalZh: '3 个月',
    badgeEn: 'Popular',
    badgeZh: '推荐',
    noteEn: 'Renews every 3 months. Better monthly value.',
    noteZh: '每 3 个月自动续费，月均价格更优惠。',
  },
  {
    key: 'annual',
    nameEn: 'Annual Membership',
    nameZh: 'Annual / 年度会员',
    price: '$86.90',
    intervalEn: 'year',
    intervalZh: '年',
    badgeEn: 'Best value',
    badgeZh: '最划算',
    noteEn: 'Renews yearly. Best long-term value.',
    noteZh: '每年自动续费，适合长期使用。',
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
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const texts = isEn ? {
    title: 'FateAura Membership',
    metaDesc: 'View FateAura membership benefits and pricing before signing up: unlimited daily readings, member-only reading types, and monthly, quarterly, or annual plans.',
    heading: 'FateAura Membership',
    subtitle: 'Unlock deeper tarot readings and enjoy unlimited daily readings. Review pricing and benefits before subscribing.',
    alreadyMember: 'Your membership is active.',
    memberExpires: 'Membership expires on: ',
    notMember: 'Subscribe to unlock unlimited readings and member-only reading types.',
    loginPrompt: 'You can review all prices first. Sign in or create an account only when you subscribe or redeem a code.',
    loginBtn: 'Sign in / Sign up',
    benefitsTitle: 'Member Benefits',
    benefit1Title: 'Unlimited daily readings',
    benefit1: 'Free users can complete 3 readings per day. Members are not limited by the daily free quota.',
    benefit2Title: 'Unlock member-only reading types',
    benefit2: 'Includes Hexagram, Horseshoe, Celtic Cross, relationship readings, career decisions, wealth obstacles, seasonal readings, yearly readings, and more.',
    benefit3Title: 'Built for complex questions',
    benefit3: 'Member readings usually use more cards and fuller layouts for love, career, wealth, and long-term themes.',
    benefit4Title: 'Ongoing member features',
    benefit4: 'Use new member-only experiences and improvements while your membership is active.',
    comparisonTitle: 'Free Plan vs Member Plan',
    freeUserTitle: 'Free User',
    freeUserPoint1: '3 free readings per day',
    freeUserPoint2: 'Use free reading types',
    freeUserPoint3: 'Best for quick daily guidance',
    memberUserTitle: 'Member',
    memberUserPoint1: 'Unlimited daily readings',
    memberUserPoint2: 'Use both free and member-only reading types',
    memberUserPoint3: 'Best for deep questions and long-term trends',
    aiNoticeTitle: 'AI Transparency',
    aiNoticeBody: 'FateAura readings may be generated or assisted by AI. They are provided for entertainment, self-reflection, and personal insight only, and should not be considered medical, legal, financial, or other professional advice.',
    paymentTitle: 'Subscription Plans',
    choosePlan: 'All plans include the same benefits. Only the billing period differs. Subscriptions renew automatically and can be canceled anytime; access remains active until the end of the paid period. Any final tax or payment details are shown by Creem at checkout before payment.',
    activeMemberPlanNotice: 'You already have an active membership. Use subscription management below for renewal or cancellation details.',
    subscribe: 'Subscribe',
    signInToSubscribe: 'Sign in / Sign up to subscribe',
    checkoutLoading: 'Opening...',
    checkoutLoginPrompt: 'Please sign in or create an account before purchasing membership.',
    checkoutError: 'Unable to open checkout. Please try again later.',
    activeMemberCheckoutError: 'You already have an active membership. Please manage your subscription instead of starting a new one.',
    redeemTitle: 'Redeem Code',
    redeemPlaceholder: 'Enter membership code',
    redeemSuccess: 'Redeemed successfully!',
    redeemLoading: 'Redeeming...',
    redeemBtn: 'Redeem',
    supportLine: 'Questions about billing or membership? Contact support@fateaura.com.',
    manageSubscription: 'Manage subscription',
    portalLoading: 'Opening subscription management...',
    portalError: 'Unable to open subscription management. Please contact support@fateaura.com.',
    backHome: 'Back to Home',
    backAccount: 'Back to Account',
    errorServiceUnavailable: 'Service temporarily unavailable. Please try again later.',
    errorRedeemFailed: 'Redemption failed. Please try again.',
    errorNetwork: 'Network error. Please check your connection and try again.',
  } : {
    title: 'FateAura 会员',
    metaDesc: '查看 FateAura 会员权益和订阅价格：不限次数每日解读、会员专享牌阵，以及月度、季度和年度方案。',
    heading: 'FateAura 会员',
    subtitle: '解锁更多深度牌阵，获得不限次数的每日解读体验。你可以先查看价格和权益，再决定是否开通。',
    alreadyMember: '你当前已是会员，会员权益已生效。',
    memberExpires: '会员有效期至：',
    notMember: '开通会员后即可解锁不限次数解读和会员专享牌阵。',
    loginPrompt: '你可以先查看全部价格。只有订阅或兑换会员码时才需要登录或注册。',
    loginBtn: '登录 / 注册',
    benefitsTitle: '会员权益',
    benefit1Title: '每日不限次数解读',
    benefit1: '普通用户每天可免费完成 3 次解读；会员不受每日次数限制。',
    benefit2Title: '解锁会员专享牌阵',
    benefit2: '包含六芒星、马蹄铁、凯尔特十字、关系发展、复合可能、Offer 抉择、去留抉择、财富障碍、四季运、年运等深度牌阵。',
    benefit3Title: '更适合复杂问题',
    benefit3: '会员牌阵通常牌数更多、结构更完整，适合感情、事业、财富和长期趋势类问题。',
    benefit4Title: '持续享受新增会员功能',
    benefit4: '会员期内可使用后续上线的会员专属体验和功能优化。',
    comparisonTitle: '普通用户 vs 会员',
    freeUserTitle: '普通用户',
    freeUserPoint1: '每日 3 次免费解读',
    freeUserPoint2: '可使用免费牌阵',
    freeUserPoint3: '适合日常快速占卜',
    memberUserTitle: '会员用户',
    memberUserPoint1: '每日不限次数解读',
    memberUserPoint2: '可使用免费牌阵 + 会员牌阵',
    memberUserPoint3: '适合深度问题、长期趋势和复杂关系分析',
    aiNoticeTitle: 'AI 透明度说明',
    aiNoticeBody: 'FateAura 的部分解读可能由 AI 生成或辅助生成，仅用于娱乐、自我反思和个人洞察，不构成医疗、法律、财务或其他专业建议。',
    paymentTitle: '订阅方案',
    choosePlan: '所有会员方案享受相同权益，仅订阅周期不同。订阅会自动续费，可随时取消；取消后，当前已付周期内权益仍会保留。税费或支付细节如有变化，会在 Creem 付款页支付前展示。',
    activeMemberPlanNotice: '您当前已经是会员。如需查看续费或取消订阅，请使用下方的管理订阅按钮。',
    subscribe: '订阅',
    signInToSubscribe: '登录 / 注册后订阅',
    checkoutLoading: '打开中...',
    checkoutLoginPrompt: '请先登录或注册后再开通会员。',
    checkoutError: '暂时无法打开支付页面，请稍后再试。',
    activeMemberCheckoutError: '您当前已经是会员，请使用订阅管理，不要重复开通新的自动续费订阅。',
    redeemTitle: '会员码兑换',
    redeemPlaceholder: '请输入会员码',
    redeemSuccess: '兑换成功！',
    redeemLoading: '兑换中...',
    redeemBtn: '兑换',
    supportLine: '如果您有账单或会员问题，请联系 support@fateaura.com。',
    manageSubscription: '管理订阅',
    portalLoading: '正在打开订阅管理...',
    portalError: '暂时无法打开订阅管理，请联系 support@fateaura.com。',
    backHome: '返回首页',
    backAccount: '返回账户',
    errorServiceUnavailable: '服务暂时不可用，请稍后再试。',
    errorRedeemFailed: '兑换失败，请稍后再试。',
    errorNetwork: '网络异常，请检查连接后再试。',
  }

  const handleRedeemClick = async () => {
    const trimmed = code.trim()
    if (!trimmed || redeemLoading) return

    if (!userId) {
      setRedeemError(texts.checkoutLoginPrompt)
      return
    }

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

    if (isMember) {
      setCheckoutError(texts.activeMemberCheckoutError)
      return
    }

    if (!userId) {
      setCheckoutError(texts.checkoutLoginPrompt)
      return
    }

    setCheckoutError(null)
    setCheckoutLoadingPlan(planKey)
    void import('../lib/readingQuestionEvents').then(({ trackReadingFunnelEvent }) =>
      trackReadingFunnelEvent('subscribe_clicked')
    )

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

  const handleManageSubscriptionClick = async () => {
    if (portalLoading || !userId) return

    setPortalError(null)
    setPortalLoading(true)

    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/creem/create-customer-portal', {
        method: 'POST',
        headers,
      })

      let payload: { portalUrl?: string; error?: string } = {}
      try {
        payload = await res.json()
      } catch {
        setPortalError(texts.portalError)
        return
      }

      if (!res.ok || !payload.portalUrl) {
        setPortalError(typeof payload.error === 'string' ? payload.error : texts.portalError)
        return
      }

      window.location.href = payload.portalUrl
    } catch {
      setPortalError(texts.portalError)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
      </Head>

      <div className="min-h-screen bg-[#0f0f23] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-5">
              <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{texts.heading}</h1>
            <p className="mt-3 text-white/65 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {texts.subtitle}
            </p>
          </header>

          <section className="rounded-2xl border border-primary/30 bg-white/[0.04] p-5 sm:p-6 mb-6 shadow-[0_0_44px_-18px_rgba(127,19,236,0.7)]">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-2">{texts.paymentTitle}</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-5">{texts.choosePlan}</p>
            {!loading && isMember && (
              <p className="mb-5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-100/85">
                {texts.activeMemberPlanNotice}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MEMBERSHIP_PLANS.map((plan) => {
                const isLoadingPlan = checkoutLoadingPlan === plan.key
                const planName = isEn ? plan.nameEn : plan.nameZh
                const interval = isEn ? plan.intervalEn : plan.intervalZh
                const badge = isEn ? plan.badgeEn : plan.badgeZh
                const note = isEn ? plan.noteEn : plan.noteZh

                return (
                  <div
                    key={plan.key}
                    className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                      <h3 className="text-white font-semibold">{planName}</h3>
                      {badge && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-white/60">
                      <span className="text-2xl font-bold text-white">{plan.price}</span>
                      <span> / {interval}</span>
                    </p>
                    <p className="mt-3 min-h-[56px] text-xs leading-relaxed text-white/50">{note}</p>
                    <button
                      type="button"
                      onClick={() => handleCheckoutClick(plan.key)}
                      disabled={loading || isMember || !!checkoutLoadingPlan}
                      className="mt-auto w-full rounded-lg bg-primary/90 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoadingPlan ? texts.checkoutLoading : userId ? texts.subscribe : texts.signInToSubscribe}
                    </button>
                  </div>
                )
              })}
            </div>
            {checkoutError && (
              <p className="mt-4 text-center text-sm text-red-300/90" role="alert">
                {checkoutError}
              </p>
            )}
            <p className="mt-5 text-center text-xs sm:text-sm text-white/50">{texts.supportLine}</p>
          </section>

          {!loading && isMember && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200/90 space-y-1">
              <p className="font-medium text-center">{texts.alreadyMember}</p>
              <p className="text-center text-emerald-200/75">
                {texts.memberExpires}{formatMembershipDate(userProfile?.membership_expires_at)}
              </p>
              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={handleManageSubscriptionClick}
                  disabled={portalLoading}
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {portalLoading ? texts.portalLoading : texts.manageSubscription}
                </button>
              </div>
              {portalError && (
                <p className="pt-2 text-center text-xs text-red-200/90" role="alert">
                  {portalError}
                </p>
              )}
            </div>
          )}

          {!loading && userId && !isMember && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70 text-center">
              {texts.notMember}
            </div>
          )}

          {!loading && !userId && (
            <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90 text-center">
              <p>{texts.loginPrompt}</p>
              <Link href="/login" className="mt-2 inline-block text-primary hover:underline font-medium">
                {texts.loginBtn}
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                {texts.benefitsTitle}
              </h2>
              <ul className="space-y-4 text-white/70 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">style</span>
                  <span>
                    <span className="block font-semibold text-white/90">{texts.benefit1Title}</span>
                    <span>{texts.benefit1}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">psychology</span>
                  <span>
                    <span className="block font-semibold text-white/90">{texts.benefit2Title}</span>
                    <span>{texts.benefit2}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">schema</span>
                  <span>
                    <span className="block font-semibold text-white/90">{texts.benefit3Title}</span>
                    <span>{texts.benefit3}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">update</span>
                  <span>
                    <span className="block font-semibold text-white/90">{texts.benefit4Title}</span>
                    <span>{texts.benefit4}</span>
                  </span>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">compare_arrows</span>
                {texts.comparisonTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">{texts.freeUserTitle}</h3>
                  <ul className="space-y-2 text-sm leading-relaxed text-white/65">
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-white/40 text-base shrink-0">check</span>
                      <span>{texts.freeUserPoint1}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-white/40 text-base shrink-0">check</span>
                      <span>{texts.freeUserPoint2}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-white/40 text-base shrink-0">check</span>
                      <span>{texts.freeUserPoint3}</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">{texts.memberUserTitle}</h3>
                  <ul className="space-y-2 text-sm leading-relaxed text-white/75">
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0">check_circle</span>
                      <span>{texts.memberUserPoint1}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0">check_circle</span>
                      <span>{texts.memberUserPoint2}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="material-symbols-outlined text-primary text-base shrink-0">check_circle</span>
                      <span>{texts.memberUserPoint3}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 mb-6">
            <h2 className="text-sm font-semibold text-amber-100/95 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-200 text-lg">policy</span>
              {texts.aiNoticeTitle}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">{texts.aiNoticeBody}</p>
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
