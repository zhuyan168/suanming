import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { getSpreadName, getSpreadByKey } from '../lib/spreads'

interface ReadingRecord {
  id: string
  spread_type: string
  question: string | null
  created_at: string
  result_path: string | null
}

type PageState = 'loading' | 'ready' | 'empty' | 'error' | 'unauthenticated'

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function HistoryPage() {
  const router = useRouter()
  const [records, setRecords] = useState<ReadingRecord[]>([])
  const [state, setState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState('unauthenticated')
        return
      }

      const { data, error } = await supabase
        .from('reading_history')
        .select('id, spread_type, question, created_at, result_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMsg(error.message)
        setState('error')
        return
      }

      if (!data || data.length === 0) {
        setState('empty')
        return
      }

      setRecords(data as ReadingRecord[])
      setState('ready')
    }

    load()
  }, [])

  function handleView(record: ReadingRecord) {
    if (record.result_path) {
      const separator = record.result_path.includes('?') ? '&' : '?'
      router.push(`${record.result_path}${separator}from=history`)
    }
  }

  return (
    <>
      <Head>
        <title>我的占卜记录 - FateAura</title>
        <meta name="description" content="查看你的历史占卜记录" />
      </Head>

      <div className="min-h-screen bg-[#0f0f23]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen">
          <div className="mx-auto max-w-3xl px-4 sm:px-8 py-6">
            {/* Header */}
            <div className="relative">
              <button
                onClick={() => router.push('/')}
                className="mb-2 flex items-center gap-2 text-white/70 hover:text-primary transition-colors group"
              >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span className="text-xs font-medium">返回</span>
              </button>

              <div className="flex flex-col gap-1">
                <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
                  我的占卜记录
                </h1>
                <p className="text-white/60 text-sm font-normal leading-snug">
                  回顾你过去的每一次问卜与指引
                </p>
              </div>
              <div className="mt-2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="mt-6">
              {state === 'loading' && <LoadingState />}
              {state === 'unauthenticated' && <UnauthState />}
              {state === 'error' && <ErrorState message={errorMsg} />}
              {state === 'empty' && <EmptyState />}
              {state === 'ready' && (
                <div className="flex flex-col gap-3">
                  {records.map((r) => (
                    <RecordCard key={r.id} record={r} onView={handleView} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function RecordCard({
  record,
  onView,
}: {
  record: ReadingRecord
  onView: (r: ReadingRecord) => void
}) {
  const spreadName = getSpreadName(record.spread_type)
  const meta = getSpreadByKey(record.spread_type)
  const icon = meta?.icon ?? '🔮'

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-5 py-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
      <div className="text-2xl shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/5">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white text-sm font-medium">{spreadName}</span>
          {meta?.category && (
            <span className="text-[10px] text-white/40 border border-white/10 rounded px-1.5 py-0.5 leading-none">
              {categoryLabel(meta.category)}
            </span>
          )}
        </div>

        {record.question && (
          <p className="mt-1 text-white/50 text-xs truncate">{record.question}</p>
        )}

        <p className="mt-1 text-white/30 text-[11px]">{formatTime(record.created_at)}</p>
      </div>

      {record.result_path ? (
        <button
          onClick={() => onView(record)}
          className="shrink-0 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-medium px-3 py-1.5 hover:bg-primary/30 transition-colors"
        >
          查看结果
        </button>
      ) : (
        <span className="shrink-0 text-white/20 text-xs">暂无链接</span>
      )}
    </div>
  )
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    general: '通用',
    love: '爱情',
    career: '事业',
    wealth: '财富',
    fortune: '运势',
    divination: '占卜',
  }
  return map[cat] ?? cat
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <span className="material-symbols-outlined text-primary/60 text-3xl animate-spin">
        progress_activity
      </span>
      <p className="text-white/40 text-sm">加载中…</p>
    </div>
  )
}

function UnauthState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="material-symbols-outlined text-white/20 text-5xl">lock</span>
      <p className="text-white/50 text-sm">请先登录后查看你的占卜记录</p>
      <Link
        href="/login"
        className="rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm font-medium px-5 py-2 hover:bg-primary/30 transition-colors"
      >
        去登录
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="material-symbols-outlined text-white/20 text-5xl">auto_stories</span>
      <p className="text-white/50 text-sm">暂无占卜记录</p>
      <Link
        href="/"
        className="rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium px-5 py-2 hover:bg-white/10 transition-colors"
      >
        去占一卦
      </Link>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <span className="material-symbols-outlined text-red-400/60 text-4xl">error</span>
      <p className="text-white/50 text-sm">加载失败，请稍后重试</p>
      {message && <p className="text-white/30 text-xs">{message}</p>}
    </div>
  )
}
