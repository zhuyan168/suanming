import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface EmailVerificationState {
  user: User | null
  email: string | null
  isVerified: boolean | null
  loading: boolean
  sending: boolean
  sendResult: { type: 'success' | 'error'; text: string } | null
  sendVerificationEmail: () => Promise<void>
  refresh: () => Promise<void>
}

const resendErrorMap: Record<string, string> = {
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'Too many requests': '请求过于频繁，请稍后再试',
  'For security purposes, you can only request this after': '操作过于频繁，请稍后再试',
}

function toChineseResendError(msg: string): string {
  const lower = msg.toLowerCase()
  for (const [en, zh] of Object.entries(resendErrorMap)) {
    if (lower.includes(en.toLowerCase())) return zh
  }
  return `发送失败：${msg}`
}

export function useEmailVerification(): EmailVerificationState {
  const [user, setUser] = useState<User | null>(null)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadUser = useCallback(async () => {
    setLoading(true)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)
    if (currentUser) {
      setIsVerified(!!currentUser.email_confirmed_at)
    } else {
      setIsVerified(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const sendVerificationEmail = useCallback(async () => {
    if (!user?.email) return
    setSending(true)
    setSendResult(null)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    setSending(false)

    if (error) {
      setSendResult({ type: 'error', text: toChineseResendError(error.message) })
    } else {
      setSendResult({ type: 'success', text: '验证邮件已发送，请前往邮箱查看' })
    }
  }, [user?.email])

  return {
    user,
    email: user?.email ?? null,
    isVerified,
    loading,
    sending,
    sendResult,
    sendVerificationEmail,
    refresh: loadUser,
  }
}
