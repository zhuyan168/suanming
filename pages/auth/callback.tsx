import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'

const callbackErrorMap: Record<string, string> = {
  'invalid request': '授权请求无效，请重新登录',
  'code verifier': '验证信息已过期，请重新登录',
  'expired': '授权已过期，请重新登录',
  'invalid grant': '授权凭证无效，请重新登录',
}

function toFriendlyError(msg: string): string {
  const lower = msg.toLowerCase()
  for (const [key, zh] of Object.entries(callbackErrorMap)) {
    if (lower.includes(key)) return zh
  }
  return '登录过程中出现问题，请重新尝试'
}

async function pollSession(maxAttempts = 5, intervalMs = 400): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase.auth.getSession()
    if (data.session) return true
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return false
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      if (!router.isReady) return

      const code = router.query.code as string | undefined

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setError(toFriendlyError(exchangeError.message))
            return
          }
        } catch {
          setError('登录过程中出现网络异常，请重新尝试')
          return
        }
        router.replace('/')
        return
      }

      // implicit / hash flow: supabase-js 会自动从 URL hash 中提取 token 并建立 session
      // 这里轮询等待 session 就绪
      const hasSession = await pollSession()
      if (hasSession) {
        router.replace('/')
        return
      }

      setError('未获取到授权信息，请重新登录')
    }

    handleCallback()
  }, [router.isReady, router.query.code, router])

  if (error) {
    return (
      <>
        <Head>
          <title>登录失败 - FateAura</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-4 block">error</span>
            <h1 className="text-xl font-semibold text-white mb-2">登录失败</h1>
            <p className="text-white/60 text-sm mb-6">{error}</p>
            <a
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
            >
              返回登录
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>登录中… - FateAura</title>
      </Head>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 block animate-spin">progress_activity</span>
          <p className="text-white/60 text-sm">正在完成登录，请稍候…</p>
        </div>
      </div>
    </>
  )
}
