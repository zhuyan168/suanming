import { type FormEvent, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

function getSafeNextPath(next: unknown): string {
  const value = Array.isArray(next) ? next[0] : next
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

function isInvalidCredentials(message: string): boolean {
  return message.toLowerCase().includes('invalid login credentials')
}

function isAlreadyRegistered(message: string): boolean {
  return message.toLowerCase().includes('user already registered')
}

function isEmailNotConfirmed(message: string): boolean {
  return message.toLowerCase().includes('email not confirmed')
}

function toFriendlyAuthError(message: string, isEn: boolean): string {
  const lower = message.toLowerCase()

  if (isEmailNotConfirmed(message)) {
    return isEn
      ? 'Please check your inbox and confirm your email before continuing.'
      : '请先到邮箱完成验证后再继续。'
  }

  if (lower.includes('too many requests') || lower.includes('email rate limit exceeded')) {
    return isEn
      ? 'Too many attempts. Please wait a few minutes and try again.'
      : '操作过于频繁，请稍等几分钟后再试。'
  }

  if (lower.includes('password should be at least 6 characters') || lower.includes('signup requires a valid password')) {
    return isEn
      ? 'Password must be at least 6 characters.'
      : '密码至少需要 6 个字符。'
  }

  if (isInvalidCredentials(message)) {
    return isEn
      ? 'Incorrect password. You can try again or reset your password.'
      : '密码不正确。你可以重试，或通过邮箱找回密码。'
  }

  return message || (isEn ? 'Unable to continue. Please try again.' : '暂时无法继续，请稍后再试。')
}

export default function LoginPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'
  const nextPath = getSafeNextPath(router.query.next)
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const texts = isEn ? {
    title: 'Sign in or Sign up - FateAura',
    metaDesc: 'Sign in or create a FateAura account',
    back: 'Back to Home',
    heading: 'Sign in / Sign up',
    subtitle: 'Use Google or email. If you are new, we will create your account automatically.',
    privacyNote: 'Use an email you can access. Password reset links will be sent there if you ever need them.',
    googleBtn: 'Use Google',
    googleLoading: 'Redirecting...',
    divider: 'or',
    labelEmail: 'Email',
    emailPlaceholder: 'your@email.com',
    emailContinue: 'Use Email',
    labelPassword: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    passwordContinue: 'Sign in / Sign up',
    passwordHelp: "If this email already has an account, we'll sign you in. If not, we'll create one.",
    forgotPassword: 'Forgot password?',
    changeEmail: 'Use a different email',
    submitting: 'Processing...',
    successTitle: 'Done.',
    successSub: 'Returning to your reading...',
    validateEmail: 'Please enter your email.',
    validateEmailFormat: 'Please enter a valid email address.',
    validatePassword: 'Please enter your password.',
    validatePasswordLen: 'Password must be at least 6 characters.',
    createdNotice: 'Account created. Returning to your reading...',
    signedInNotice: 'Signed in. Returning to your reading...',
  } : {
    title: '登录 / 注册 - FateAura',
    metaDesc: '登录或创建 FateAura 账号',
    back: '返回首页',
    heading: '登录 / 注册',
    subtitle: '使用 Google 或邮箱。如果你是新用户，系统会自动创建账号。',
    privacyNote: '请填写你能收到邮件的邮箱，忘记密码时会用它找回账号。',
    googleBtn: '使用 Google',
    googleLoading: '正在跳转...',
    divider: '或',
    labelEmail: '邮箱',
    emailPlaceholder: 'your@email.com',
    emailContinue: '使用邮箱',
    labelPassword: '密码',
    passwordPlaceholder: '至少 6 个字符',
    passwordContinue: '登录 / 注册',
    passwordHelp: '如果这个邮箱已有账号，我们会为你登录；如果还没有账号，我们会自动创建。',
    forgotPassword: '忘记密码？',
    changeEmail: '换一个邮箱',
    submitting: '正在处理...',
    successTitle: '完成',
    successSub: '正在返回你的解读...',
    validateEmail: '请输入邮箱。',
    validateEmailFormat: '请输入有效的邮箱地址。',
    validatePassword: '请输入密码。',
    validatePasswordLen: '密码至少需要 6 个字符。',
    createdNotice: '账号已创建，正在返回你的解读...',
    signedInNotice: '已登录，正在返回你的解读...',
  }

  function validateEmail(): string | null {
    if (!email.trim()) return texts.validateEmail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return texts.validateEmailFormat
    return null
  }

  function validatePassword(): string | null {
    if (!password) return texts.validatePassword
    if (password.length < 6) return texts.validatePasswordLen
    return null
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    sessionStorage.setItem('auth_redirect_next', nextPath)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (oauthError) {
      setGoogleLoading(false)
      setError(toFriendlyAuthError(oauthError.message, isEn))
    }
  }

  function handleEmailStep(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    const validationError = validateEmail()
    if (validationError) {
      setError(validationError)
      return
    }

    setStep('password')
  }

  async function handlePasswordStep(e: FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    const emailError = validateEmail()
    if (emailError) {
      setError(emailError)
      setStep('email')
      return
    }

    const passwordError = validatePassword()
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    const normalizedEmail = email.trim()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (!signInError) {
      setNotice(texts.signedInNotice)
      setStep('success')
      router.replace(nextPath)
      return
    }

    if (!isInvalidCredentials(signInError.message)) {
      setLoading(false)
      setError(toFriendlyAuthError(signInError.message, isEn))
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (signUpError) {
      setLoading(false)
      if (isAlreadyRegistered(signUpError.message)) {
        setError(toFriendlyAuthError(signInError.message, isEn))
      } else {
        setError(toFriendlyAuthError(signUpError.message, isEn))
      }
      return
    }

    void import('../lib/readingQuestionEvents').then(({ trackReadingFunnelEvent }) =>
      trackReadingFunnelEvent('signup_after_result')
    )

    const fbq = (window as typeof window & {
      fbq?: (action: string, event: string, params?: Record<string, number>) => void
    }).fbq
    fbq?.('track', 'Subscribe', { value: 1 })

    if (data.session) {
      setNotice(texts.createdNotice)
      setStep('success')
      router.replace(nextPath)
      return
    }

    setLoading(false)
    setNotice(isEn
      ? 'Account created. Please check your email, then come back to continue.'
      : '账号已创建。请查看邮箱后回来继续。')
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
      </Head>

      <div className="min-h-screen bg-background flex items-start justify-center px-4 py-10 sm:py-14 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 hidden h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none sm:block" />
        <div className="absolute bottom-1/4 right-1/4 hidden h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[100px] pointer-events-none sm:block" />

        <div className="relative z-10 w-full max-w-[430px]">
          <div className="mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {texts.back}
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#181226] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-7">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white tracking-wide">{texts.heading}</h1>
              <p className="mt-2 text-white/60 text-sm">{texts.subtitle}</p>
              <p className="mx-auto mt-2 max-w-[320px] text-white/40 text-xs leading-relaxed">{texts.privacyNote}</p>
            </div>

            {step === 'success' ? (
              <div className="text-center py-6 animate-fade-in">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                  check_circle
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">{texts.successTitle}</h2>
                <p className="text-white/60 text-sm">{notice || texts.successSub}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-white/10 bg-white/5 py-3 text-white text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {googleLoading ? (
                    texts.googleLoading
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      {texts.googleBtn}
                    </>
                  )}
                </button>

                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">{texts.divider}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {step === 'email' ? (
                  <form onSubmit={handleEmailStep} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm text-white/70 mb-1.5">
                        {texts.labelEmail}
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder={texts.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm animate-fade-in">
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={googleLoading}
                      className="w-full rounded-lg bg-primary py-3 text-white text-sm font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {texts.emailContinue}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordStep} className="space-y-5">
                    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs text-white/40">{texts.labelEmail}</p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm text-white/80">{email}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setStep('email')
                            setPassword('')
                            setError('')
                            setNotice('')
                          }}
                          className="shrink-0 text-xs text-secondary hover:text-accent transition-colors"
                        >
                          {texts.changeEmail}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="block text-sm text-white/70">
                          {texts.labelPassword}
                        </label>
                        <Link
                          href={{ pathname: '/forgot-password', query: { next: nextPath } }}
                          className="text-xs text-white/40 hover:text-secondary transition-colors"
                        >
                          {texts.forgotPassword}
                        </Link>
                      </div>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder={texts.passwordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                      />
                      <p className="mt-2 text-xs leading-relaxed text-white/40">{texts.passwordHelp}</p>
                    </div>

                    {notice && (
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-emerald-300 text-sm animate-fade-in">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        {notice}
                      </div>
                    )}

                    {error && (
                      <div className="space-y-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm animate-fade-in">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">error</span>
                          {error}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full rounded-lg bg-primary py-3 text-white text-sm font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? texts.submitting : texts.passwordContinue}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
