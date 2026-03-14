import { type FormEvent, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!email.trim()) return '请输入邮箱地址'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return '邮箱格式不正确'
    if (!password) return '请输入密码'
    if (password.length < 6) return '密码至少需要 6 位'
    if (password !== confirmPassword) return '两次输入的密码不一致'
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

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setSuccess(true)
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
                  check_circle
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">注册成功</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  你的账号已创建完成，现在可以直接登录。
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
                >
                  前往登录
                </Link>
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
