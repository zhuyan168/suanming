import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      setResult({
        data,
        error: error ? error.message : null,
      })

      console.log('Supabase test result:', { data, error })
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <h1>Supabase 测试页面</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}