import { type FormEvent, useCallback, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const errorMapZh: Record<string, string> = {
  'New password should be different from the old password': '新密码不能与旧密码相同',
  'Password should be at least 6 characters': '密码至少需要 6 个字符',
  'Auth session missing': '登录状态已过期，请重新登录',
  'Email rate limit exceeded': '发送邮件次数过多，请稍后再试',
  'Too many requests': '请求过于频繁，请稍后再试',
  'For security purposes, you can only request this after': '操作过于频繁，请稍后再试',
}

const errorMapEn: Record<string, string> = {
  'New password should be different from the old password': 'New password must be different from your current password.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
  'Auth session missing': 'Your session has expired. Please sign in again.',
  'Email rate limit exceeded': 'Too many emails sent. Please try again later.',
  'Too many requests': 'Too many requests. Please try again later.',
  'For security purposes, you can only request this after': 'Too many attempts. Please try again later.',
}

function toLocalizedError(msg: string, isEn: boolean): string {
  const lower = msg.toLowerCase()
  const map = isEn ? errorMapEn : errorMapZh
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key.toLowerCase())) return val
  }
  return msg
}

type PageState = 'loading' | 'ready' | 'unauthenticated'

export default function ChangePasswordPage() {
  const router = useRouter()
  const isEn = router.locale === 'en'
  const [user, setUser] = useState<User | null>(null)
  const [state, setState] = useState<PageState>('loading')
  const [isVerified, setIsVerified] = useState(false)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [sendingVerification, setSendingVerification] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const texts = isEn ? {
    title: 'Change Password — FateAura',
    metaDesc: 'Change your FateAura account password',
    back: 'Back to Account',
    heading: 'Change Password',
    subtitle: 'Set a new login password.',
    successTitle: 'Password changed successfully.',
    successSub: 'Your password has been updated.',
    backToAccount: 'Back to Account',
    unverifiedWarning: 'Your email is not verified. We recommend verifying your email before changing your password.',
    sendingVerification: 'Sending…',
    sendVerificationBtn: 'Send Verification Email',
    verificationSent: 'Verification email sent. Please check your inbox.',
    labelPassword: 'New Password',
    placeholderPassword: 'At least 6 characters',
    labelConfirm: 'Confirm New Password',
    placeholderConfirm: 'Re-enter new password',
    submitting: 'Saving…',
    submit: 'Save New Password',
    validatePassword: 'Please enter your new password.',
    validatePasswordLen: 'Password must be at least 6 characters.',
    validatePasswordMatch: 'Passwords do not match.',
  } : {
    title: '修改密码 - FateAura',
    metaDesc: '修改你的 FateAura 账号密码',
    back: '返回个人中心',
    heading: '修改密码',
    subtitle: '设置一个新的登录密码',
    successTitle: '密码修改成功',
    successSub: '你的密码已更新',
    backToAccount: '返回个人中心',
    unverifiedWarning: '你的邮箱尚未验证，建议先完成验证再修改密码。',
    sendingVerification: '发送中...',
    sendVerificationBtn: '发送验证邮件',
    verificationSent: '验证邮件已发送，请前往邮箱查看',
    labelPassword: '新密码',
    placeholderPassword: '至少 6 位',
    labelConfirm: '确认新密码',
    placeholderConfirm: '再次输入新密码',
    submitting: '提交中...',
    submit: '确认修改',
    validatePassword: '请输入新密码',
    validatePasswordLen: '密码至少需要 6 位',
    validatePasswordMatch: '两次输入的密码不一致',
  }

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setState('unauthenticated')
        return
      }
      setUser(currentUser)
      const isGoogle = currentUser.app_metadata?.provider === 'google' ||
        (Array.isArray(currentUser.app_metadata?.providers) && currentUser.app_metadata.providers.includes('google'))
      setIsVerified(isGoogle || !!currentUser.email_confirmed_at)
      setState('ready')
    }
    load()
  }, [])

  useEffect(() => {
    if (state === 'unauthenticated') {
      router.replace('/login')
    }
  }, [state, router])

  const handleSendVerification = useCallback(async () => {
    if (!user?.email) return
    setSendingVerification(true)
    setVerificationResult(null)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    setSendingVerification(false)
    if (resendError) {
      setVerificationResult({ type: 'error', text: toLocalizedError(resendError.message, isEn) })
    } else {
      setVerificationResult({ type: 'success', text: texts.verificationSent })
    }
  }, [user?.email, isEn, texts.verificationSent])

  function validate(): string | null {
    if (!password) return texts.validatePassword
    if (password.length < 6) return texts.validatePasswordLen
    if (password !== confirmPassword) return texts.validatePasswordMatch
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

    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) {
      setError(toLocalizedError(updateError.message, isEn))
      return
    }

    setSuccess(true)
  }

  if (state === 'loading' || state === 'unauthenticated') {
    return (
      <>
        <Head>
          <title>{texts.title}</title>
        </Head>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <span className="material-symbols-outlined text-primary/60 text-3xl animate-spin">
            progress_activity
          </span>
        </div>
      </>
    )
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
              href="/account"
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
                  check_circle
                </span>
                <h2 className="text-xl font-semibold text-white mb-2">{texts.successTitle}</h2>
                <p className="text-white/60 text-sm">{texts.successSub}</p>
                <Link
                  href="/account"
                  className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-sm font-medium transition-colors"
                >
                  {texts.backToAccount}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isVerified && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-amber-400/90 text-xs leading-relaxed animate-fade-in">
                    <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">info</span>
                    <div className="space-y-1.5">
                      <span>{texts.unverifiedWarning}</span>
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        disabled={sendingVerification}
                        className="block text-amber-400 underline hover:text-amber-300 disabled:opacity-50 transition-colors"
                      >
                        {sendingVerification ? texts.sendingVerification : texts.sendVerificationBtn}
                      </button>
                      {verificationResult && (
                        <p className={verificationResult.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                          {verificationResult.text}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="password" className="block text-sm text-white/70 mb-1.5">
                    {texts.labelPassword}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={texts.placeholderPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-white/70 mb-1.5">
                    {texts.labelConfirm}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={texts.placeholderConfirm}
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
                  {loading ? texts.submitting : texts.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
