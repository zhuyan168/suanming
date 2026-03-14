import { type FormEvent, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const authErrorMap: Record<string, string> = {
  'Invalid login credentials': '邮箱或密码错误',
  'Email not confirmed': '邮箱尚未验证，请查收验证邮件',
  'User not found': '该用户不存在',
  'Too many requests': '请求过于频繁，请稍后再试',
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'User already registered': '该邮箱已被注册',
  'Signup requires a valid password': '请输入有效的密码',
  'Password should be at least 6 characters': '密码至少需要 6 个字符',
}

function toChineseError(msg: string): string {
  for (const [en, zh] of Object.entries(authErrorMap)) {
    if (msg.toLowerCase().includes(en.toLowerCase())) return zh
  }
  return msg
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!email.trim()) return '请输入邮箱地址'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return '邮箱格式不正确'
    if (!password) return '请输入密码'
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(toChineseError(signInError.message))
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/'), 800)
  }

  return (
    <>
      <Head>
        <title>登录 - FateAura</title>
        <meta name="description" content="登录你的 FateAura 账号" />
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
            <h1 className="text-3xl font-bold text-white tracking-wide">欢迎回来</h1>
            <p className="mt-2 text-white/50 text-sm">登录以继续你的神秘洞察之旅</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                  check_circle
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">登录成功</h2>
                <p className="text-white/60 text-sm">正在跳转到首页…</p>
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
                    autoComplete="current-password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? '登录中...' : '登录'}
                </button>
              </form>
            )}
          </div>

          {!success && (
            <p className="mt-6 text-center text-sm text-white/40">
              还没有账号？
              <Link href="/register" className="text-secondary hover:text-accent ml-1 transition-colors">
                去注册
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
