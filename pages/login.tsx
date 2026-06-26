import { type FormEvent, useCallback, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const authErrorMapZh: Record<string, string> = {
  'Invalid login credentials': '邮箱或密码错误',
  'User not found': '该用户不存在',
  'Too many requests': '请求过于频繁，请稍后再试',
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'User already registered': '该邮箱已被注册',
  'Signup requires a valid password': '请输入有效的密码',
  'Password should be at least 6 characters': '密码至少需要 6 个字符',
}

const authErrorMapEn: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password.',
  'User not found': 'User not found.',
  'Too many requests': 'Too many requests. Please try again later.',
  'Email rate limit exceeded': 'Too many emails sent. Please try again later.',
  'User already registered': 'This email is already registered.',
  'Signup requires a valid password': 'Please enter a valid password.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
}

function isEmailNotConfirmedError(msg: string): boolean {
  return msg.toLowerCase().includes('email not confirmed')
}

function toLocalizedError(msg: string, isEn: boolean): string {
  if (isEmailNotConfirmedError(msg)) {
    return isEn
      ? 'Your email is not verified. Please check your inbox and complete verification before signing in.'
      : '邮箱尚未验证，请先前往邮箱完成验证后再登录'
  }
  const map = isEn ? authErrorMapEn : authErrorMapZh
  for (const [key, val] of Object.entries(map)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val
  }
  return msg
}

export default function LoginPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const texts = isEn ? {
    title: 'Sign In - FateAura',
    metaDesc: 'Sign in to your FateAura account',
    back: 'Back to Home',
    heading: 'Welcome Back',
    subtitle: 'Sign in to save readings and manage your account.',
    privacyNote: 'Email is enough to use your account. No birthday, real name, or extra personal details required.',
    successTitle: 'Signed in successfully.',
    successSub: 'Redirecting to home...',
    labelEmail: 'Email',
    labelPassword: 'Password',
    forgotPassword: 'Forgot password?',
    placeholderPassword: 'Enter your password',
    resending: 'Sending...',
    resendBtn: 'Resend Verification Email',
    resendSuccess: 'Verification email sent. Please check your inbox.',
    submitting: 'Signing in...',
    submit: 'Sign In',
    divider: 'or',
    googleLoading: 'Redirecting...',
    googleBtn: 'Sign in with Google',
    noAccount: "Don't have an account yet?",
    register: 'Sign Up',
    validateEmail: 'Please enter your email.',
    validateEmailFormat: 'Please enter a valid email address.',
    validatePassword: 'Please enter your password.',
  } : {
    title: '登录 - FateAura',
    metaDesc: '登录你的 FateAura 账号',
    back: '返回首页',
    heading: '欢迎回来',
    subtitle: '登录后可继续保存解读记录并管理账号。',
    privacyNote: '只需邮箱即可使用账号，不需要填写生日、真实姓名或其他个人资料。',
    successTitle: '登录成功',
    successSub: '正在跳转到首页…',
    labelEmail: '邮箱',
    labelPassword: '密码',
    forgotPassword: '忘记密码？',
    placeholderPassword: '请输入密码',
    resending: '发送中...',
    resendBtn: '重新发送验证邮件',
    resendSuccess: '验证邮件已发送，请前往邮箱查看',
    submitting: '登录中...',
    submit: '登录',
    divider: '或',
    googleLoading: '跳转中...',
    googleBtn: '使用 Google 登录',
    noAccount: '还没有账号？',
    register: '去注册',
    validateEmail: '请输入邮箱地址',
    validateEmailFormat: '邮箱格式不正确',
    validatePassword: '请输入密码',
  }

  function validate(): string | null {
    if (!email.trim()) return texts.validateEmail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return texts.validateEmailFormat
    if (!password) return texts.validatePassword
    return null
  }

  const handleResendVerification = useCallback(async () => {
    if (!email.trim()) return
    setResending(true)
    setResendResult(null)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    setResending(false)
    if (resendError) {
      setResendResult({ type: 'error', text: toLocalizedError(resendError.message, isEn) })
    } else {
      setResendResult({ type: 'success', text: texts.resendSuccess })
    }
  }, [email, isEn, texts.resendSuccess])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setEmailNotConfirmed(false)
    setResendResult(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      if (isEmailNotConfirmedError(signInError.message)) {
        setEmailNotConfirmed(true)
      }
      setError(toLocalizedError(signInError.message, isEn))
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/'), 800)
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (oauthError) {
      setGoogleLoading(false)
      setError(toLocalizedError(oauthError.message, isEn))
    }
  }

  return (
    <>
      <Head>
        <title>{texts.title}</title>
        <meta name="description" content={texts.metaDesc} />
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {texts.back}
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">{texts.heading}</h1>
            <p className="mt-2 text-white/50 text-sm">
              {texts.subtitle}
            </p>
            <p className="mt-2 text-white/40 text-xs leading-relaxed">{texts.privacyNote}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                  check_circle
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">{texts.successTitle}</h2>
                <p className="text-white/60 text-sm">{texts.successSub}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm text-white/70 mb-1.5">
                    {texts.labelEmail}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm text-white/70">
                      {texts.labelPassword}
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-white/40 hover:text-secondary transition-colors"
                    >
                      {texts.forgotPassword}
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder={texts.placeholderPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm animate-fade-in space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0">error</span>
                      {error}
                    </div>
                    {emailNotConfirmed && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resending}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-white/60 text-xs font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">send</span>
                          {resending ? texts.resending : texts.resendBtn}
                        </button>
                        {resendResult && (
                          <p className={`text-xs ${resendResult.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {resendResult.text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full rounded-lg bg-primary py-3 text-white text-sm font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? texts.submitting : texts.submit}
                </button>

                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">{texts.divider}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

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
              </form>
            )}
          </div>

          {!success && (
            <p className="mt-6 text-center text-sm text-white/40">
              {texts.noAccount}
              <Link href="/register" className="text-secondary hover:text-accent ml-1 transition-colors">
                {texts.register}
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
