import { type FormEvent, useCallback, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const signUpErrorMap: Record<string, string> = {
  'User already registered': '该邮箱已被注册',
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'Too many requests': '请求过于频繁，请稍后再试',
  'Signup requires a valid password': '请输入有效的密码',
  'Password should be at least 6 characters': '密码至少需要 6 个字符',
}

function toChineseError(msg: string): string {
  const lower = msg.toLowerCase()
  for (const [en, zh] of Object.entries(signUpErrorMap)) {
    if (lower.includes(en.toLowerCase())) return zh
  }
  return msg
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

function toFriendlyRegisterError(error: unknown): string {
  const rawMessage = getErrorMessage(error)
  const message = rawMessage.toLowerCase()

  if (
    message.includes('too many requests') ||
    message.includes('429') ||
    message.includes('status code 429') ||
    message.includes('http 429')
  ) {
    return '当前注册请求过于频繁，请稍等几分钟后再试，或更换网络后重试。'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('typeerror: failed to fetch')
  ) {
    return '网络连接失败，请检查网络、关闭浏览器拦截插件后重试'
  }

  if (
    message.includes('service unavailable') ||
    message.includes('服务不可用') ||
    message.includes('status code 503') ||
    message.includes('http 503') ||
    message.includes('503')
  ) {
    return '服务暂时不可用，请稍后再试'
  }

  if (rawMessage) {
    return toChineseError(rawMessage)
  }

  return '注册失败，请稍后重试'
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function validate(): string | null {
    if (!email.trim()) return '请输入邮箱地址'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return '邮箱格式不正确'
    if (!password) return '请输入密码'
    if (password.length < 6) return '密码至少需要 6 位'
    if (password !== confirmPassword) return '两次输入的密码不一致'
    return null
  }

  const handleResend = useCallback(async () => {
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
      setResendResult({ type: 'error', text: toChineseError(resendError.message) })
    } else {
      setResendResult({ type: 'success', text: '验证邮件已重新发送，请查收' })
    }
  }, [email])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(toChineseError(signUpError.message))
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error('注册请求异常:', err)
      setError(toFriendlyRegisterError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>注册 - FateAura</title>
        <meta name="description" content="创建你的 FateAura 账号" />
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
              返回首页
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">创建账号</h1>
            <p className="mt-2 text-white/50 text-sm">开启你的神秘洞察之旅</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                  mark_email_read
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">注册成功，请验证邮箱</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  我们已向 <span className="text-white/80">{email}</span> 发送了一封验证邮件，请前往邮箱点击验证链接完成注册。
                </p>
                <p className="text-white/40 text-xs leading-relaxed mt-3">
                  验证完成后即可登录，使用历史记录、个人中心等账号功能。
                </p>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/login"
                    className="inline-block w-full px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
                  >
                    返回登录
                  </Link>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resending ? '发送中...' : '重新发送验证邮件'}
                  </button>
                </div>

                {resendResult && (
                  <div className={`mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs animate-fade-in ${
                    resendResult.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    <span className="material-symbols-outlined text-sm">
                      {resendResult.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {resendResult.text}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm text-white/70 mb-1.5">
                    邮箱
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
                  <label htmlFor="password" className="block text-sm text-white/70 mb-1.5">
                    密码
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="至少 6 位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-white/70 mb-1.5">
                    确认密码
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? '注册中...' : '注册'}
                </button>
              </form>
            )}
          </div>

          {!success && (
            <p className="mt-6 text-center text-sm text-white/40">
              已有账号？
              <Link href="/login" className="text-secondary hover:text-accent ml-1 transition-colors">
                去登录
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
