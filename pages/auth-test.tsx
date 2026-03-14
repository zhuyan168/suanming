import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getCurrentUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      setMessage(error.message)
      return
    }
    setUser(data.user ?? null)
  }

  async function handleSignUp() {
    setMessage('注册中...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(`注册失败：${error.message}`)
      return
    }

    setMessage('注册成功')
    setUser(data.user ?? null)
  }

  async function handleSignIn() {
    setMessage('登录中...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`登录失败：${error.message}`)
      return
    }

    setMessage('登录成功')
    setUser(data.user ?? null)
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage(`退出失败：${error.message}`)
      return
    }

    setMessage('已退出登录')
    setUser(null)
  }

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h1>Auth 测试页面</h1>

      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <input
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: 'block',
            width: '300px',
            padding: '10px',
            marginBottom: '12px',
            color: '#000',
          }}
        />

        <input
          type="password"
          placeholder="请输入密码（至少6位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: 'block',
            width: '300px',
            padding: '10px',
            marginBottom: '12px',
            color: '#000',
          }}
        />

        <button onClick={handleSignUp} style={{ marginRight: '12px', padding: '8px 16px' }}>
          注册
        </button>

        <button onClick={handleSignIn} style={{ marginRight: '12px', padding: '8px 16px' }}>
          登录
        </button>

        <button onClick={handleSignOut} style={{ padding: '8px 16px' }}>
          退出登录
        </button>
      </div>

      <p>{message}</p>

      <hr style={{ margin: '24px 0' }} />

      <h2>当前用户信息</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}