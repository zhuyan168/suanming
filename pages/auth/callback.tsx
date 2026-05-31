import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'

const callbackErrorMap: Record<string, { zh: string; en: string }> = {
  'invalid request': { zh: '授权请求无效，请重新登录', en: 'The authorization request is invalid. Please sign in again.' },
  'code verifier': { zh: '验证信息已过期，请重新登录', en: 'The verification information has expired. Please sign in again.' },
  'expired': { zh: '授权已过期，请重新登录', en: 'The authorization has expired. Please sign in again.' },
  'invalid grant': { zh: '授权凭证无效，请重新登录', en: 'The authorization credential is invalid. Please sign in again.' },
}

function toFriendlyError(msg: string, isEn: boolean): string {
  const lower = msg.toLowerCase()
  for (const [key, value] of Object.entries(callbackErrorMap)) {
    if (lower.includes(key)) return isEn ? value.en : value.zh
  }
  return isEn ? 'Something went wrong during sign-in. Please try again.' : '登录过程中出现问题，请重新尝试'
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
  const isEn = router.locale === 'en'
  const text = isEn ? {
    failedTitle: 'Sign-In Failed - FateAura',
    failedHeading: 'Sign-In Failed',
    returnLogin: 'Back to Sign In',
    loadingTitle: 'Signing In... - FateAura',
    loading: 'Completing sign-in. Please wait...',
    networkError: 'A network error occurred during sign-in. Please try again.',
    noAuth: 'No authorization information was found. Please sign in again.',
  } : {
    failedTitle: '登录失败 - FateAura',
    failedHeading: '登录失败',
    returnLogin: '返回登录',
    loadingTitle: '登录中… - FateAura',
    loading: '正在完成登录，请稍候…',
    networkError: '登录过程中出现网络异常，请重新尝试',
    noAuth: '未获取到授权信息，请重新登录',
  }
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      if (!router.isReady) return

      const code = router.query.code as string | undefined

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setError(toFriendlyError(exchangeError.message, isEn))
            return
          }
        } catch {
          setError(text.networkError)
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

      setError(text.noAuth)
    }

    handleCallback()
  }, [router.isReady, router.query.code, router, isEn, text.networkError, text.noAuth])

  if (error) {
    return (
      <>
        <Head>
          <title>{text.failedTitle}</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-400 text-5xl mb-4 block">error</span>
            <h1 className="text-xl font-semibold text-white mb-2">{text.failedHeading}</h1>
            <p className="text-white/60 text-sm mb-6">{error}</p>
            <a
              href="/login"
              className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
            >
              {text.returnLogin}
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{text.loadingTitle}</title>
      </Head>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 block animate-spin">progress_activity</span>
          <p className="text-white/60 text-sm">{text.loading}</p>
        </div>
      </div>
    </>
  )
}
