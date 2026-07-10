import { type FormEvent, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const errorMapZh: Record<string, string> = {
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'Too many requests': '请求过于频繁，请稍后再试',
  'User not found': '该邮箱尚未注册',
}

const errorMapEn: Record<string, string> = {
  'Email rate limit exceeded': 'Too many emails sent. Please try again later.',
  'Too many requests': 'Too many requests. Please try again later.',
  'User not found': 'No account found with this email address.',
}

function toLocalizedError(msg: string, isEn: boolean): string {
  const map = isEn ? errorMapEn : errorMapZh
  for (const [key, val] of Object.entries(map)) {
    if (msg.toLowerCase().includes(key.toLowerCase())) return val
  }
  return msg
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const texts = isEn ? {
    title: 'Forgot Password - FateAura',
    metaDesc: 'Reset your FateAura account password',
    back: 'Back to Sign in / Sign up',
    heading: 'Forgot Password',
    subtitle: 'Enter your registered email and we\'ll send you a reset link.',
    successTitle: 'Email Sent',
    successBody: 'A password reset email has been sent to',
    successBody2: '. Please check your inbox and click the link to reset your password.',
    backToLogin: 'Back to Sign in / Sign up',
    labelEmail: 'Email',
    submitting: 'Sending...',
    submit: 'Send Reset Email',
    rememberPassword: 'Remember your password?',
    login: 'Sign in / Sign up',
    validateEmail: 'Please enter your email.',
    validateEmailFormat: 'Please enter a valid email address.',
  } : {
    title: '忘记密码 - FateAura',
    metaDesc: '重置你的 FateAura 账号密码',
    back: '返回登录 / 注册',
    heading: '忘记密码',
    subtitle: '输入你的注册邮箱，我们将发送重置链接',
    successTitle: '邮件已发送',
    successBody: '重置密码邮件已发送至',
    successBody2: '，请前往邮箱查看并点击链接完成密码重置。',
    backToLogin: '返回登录 / 注册',
    labelEmail: '邮箱',
    submitting: '发送中...',
    submit: '发送重置邮件',
    rememberPassword: '想起密码了？',
    login: '登录 / 注册',
    validateEmail: '请输入邮箱地址',
    validateEmailFormat: '邮箱格式不正确',
  }

  function validate(): string | null {
    if (!email.trim()) return texts.validateEmail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return texts.validateEmailFormat
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password` },
    )

    setLoading(false)

    if (resetError) {
      setError(toLocalizedError(resetError.message, isEn))
      return
    }

    setSuccess(true)
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
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {texts.back}
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">{texts.heading}</h1>
            <p className="mt-2 text-white/50 text-sm">{texts.subtitle}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                  mark_email_read
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">{texts.successTitle}</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  {texts.successBody} <span className="text-white/80">{email}</span>{texts.successBody2}
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
                >
                  {texts.backToLogin}
                </Link>
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

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm animate-fade-in">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 text-white text-sm font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? texts.submitting : texts.submit}
                </button>
              </form>
            )}
          </div>

          {!success && (
            <p className="mt-6 text-center text-sm text-white/40">
              {texts.rememberPassword}
              <Link href="/login" className="text-secondary hover:text-accent ml-1 transition-colors">
                {texts.login}
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
