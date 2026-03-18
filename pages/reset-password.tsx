import { type FormEvent, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const errorMap: Record<string, string> = {
  'New password should be different from the old password': '新密码不能与旧密码相同',
  'Password should be at least 6 characters': '密码至少需要 6 个字符',
  'Auth session missing': '重置链接已过期，请重新申请',
  'Token has expired or is invalid': '重置链接已过期，请重新申请',
}

function toChineseError(msg: string): string {
  for (const [en, zh] of Object.entries(errorMap)) {
    if (msg.toLowerCase().includes(en.toLowerCase())) return zh
  }
  return msg
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      }
    })

    const timeout = setTimeout(() => {
      setSessionReady((ready) => {
        if (!ready) setSessionError(true)
        return ready
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  function validate(): string | null {
    if (!password) return '请输入新密码'
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

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      setError(toChineseError(updateError.message))
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (sessionError) {
    return (
      <>
        <Head>
          <title>链接无效 - FateAura</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-4 block">link_off</span>
            <h1 className="text-xl font-semibold text-white mb-2">重置链接无效或已过期</h1>
            <p className="text-white/60 text-sm mb-6">请重新申请密码重置</p>
            <Link
              href="/forgot-password"
              className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
            >
              重新申请
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (!sessionReady) {
    return (
      <>
        <Head>
          <title>重置密码 - FateAura</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-5xl mb-4 block animate-spin">progress_activity</span>
            <p className="text-white/60 text-sm">正在验证重置链接…</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>重置密码 - FateAura</title>
        <meta name="description" content="设置你的新密码" />
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-wide">重置密码</h1>
            <p className="mt-2 text-white/50 text-sm">请输入你的新密码</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                  check_circle
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">密码重置成功</h2>
                <p className="text-white/60 text-sm">正在跳转到登录页…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm text-white/70 mb-1.5">
                    新密码
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
                    确认新密码
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="再次输入新密码"
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
                  {loading ? '重置中...' : '确认重置'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
