import { useRouter } from 'next/router'
import { useCallback } from 'react'

export function useHistoryBack() {
  const router = useRouter()
  const isFromHistory = router.query.from === 'history'

  const goBack = useCallback(() => {
    router.push('/history')
  }, [router])

  return { isFromHistory, goBack }
}
