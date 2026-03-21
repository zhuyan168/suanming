import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { tarotImagesFlat } from '../../utils/tarotimages'
import { getAnswerText, YesNoAnswer } from '../../utils/yesno-tarot-logic'

// ---- DB record ----
interface HistoryRecord {
  id: string
  created_at: string
  user_id: string
  question: string | null
  spread_type: string
  cards: any
  reading_result: any
  result_path: string | null
}

type PageState = 'loading' | 'ready' | 'not_found' | 'forbidden' | 'error'

// ---- Old API key → canonical key ----
const KEY_ALIASES: Record<string, string> = {
  'three-card-universal': 'three-card-general',
  'future-lover': 'love-future-lover',
  'what-they-think': 'love-what-they-think',
  'relationship-development': 'love-relationship-development',
  'reconciliation': 'love-reconciliation',
  'offer-decision': 'career-offer-decision',
  'interview-exam': 'career-interview-exam',
  'interview-exam-key-reminders': 'career-interview-exam',
  'skills-direction': 'career-skills-direction',
  'stay-or-leave': 'career-stay-or-leave',
  'monthly-basic-fortune': 'fortune-monthly',
  'monthly-fortune': 'fortune-monthly',
  'monthly-member-fortune': 'fortune-monthly-member',
  'year-ahead': 'fortune-yearly',
  'year-ahead-fortune': 'fortune-yearly',
  'annual-fortune': 'fortune-yearly',
  'yesno-tarot': 'divination-yesno',
  'jiaobei': 'divination-jiaobei',
  'six-pointed-star': 'hexagram',
  'daily-fortune': 'fortune-daily',
  'seasonal-fortune': 'fortune-seasonal',
  'current-wealth-status': 'wealth-current-status',
}

function normalizeKey(raw: string): string {
  return KEY_ALIASES[raw] ?? raw
}

// ---- Spread display names (covers all canonical + legacy) ----
const SPREAD_NAME: Record<string, string> = {
  'fortune-daily': '每日运势',
  'divination-yesno': 'Yes / No 塔罗',
  'divination-jiaobei': '筊杯占卜',
  'fortune-monthly': '月度运势',
  'fortune-monthly-member': '月度运势深层解析',
  'fortune-seasonal': '四季运势',
  'fortune-yearly': '年度运势',
  'three-card-general': '三张牌万能牌阵',
  'sacred-triangle': '圣三角牌阵',
  'two-choices': '二选一牌阵',
  'hexagram': '六芒星牌阵',
  'horseshoe': '马蹄铁牌阵',
  'celtic-cross': '凯尔特十字牌阵',
  'love-future-lover': '未来恋人牌阵',
  'love-what-they-think': '对方在想什么',
  'love-relationship-development': '这段感情的发展',
  'love-reconciliation': '复合的可能性',
  'career-skills-direction': '工作 / 技能方向',
  'career-job': '我应该找什么样的工作',
  'career-interview-exam': '面试 / 考试关键提醒',
  'career-offer-decision': 'Offer 抉择',
  'career-stay-or-leave': '去留抉择',
  'wealth-current-status': '当前财运',
  'wealth-obstacles': '财富阻碍',
}

function getSpreadDisplayName(raw: string): string {
  const canonical = normalizeKey(raw)
  return SPREAD_NAME[canonical] ?? SPREAD_NAME[raw] ?? raw
}

// ---- Tarot image lookup ----
const majorArcanaMap: Record<string, keyof typeof tarotImagesFlat> = {
  'the fool': 'major_arcana_fool', 'the magician': 'major_arcana_magician',
  'the high priestess': 'major_arcana_priestess', 'the empress': 'major_arcana_empress',
  'the emperor': 'major_arcana_emperor', 'the hierophant': 'major_arcana_hierophant',
  'the lovers': 'major_arcana_lovers', 'the chariot': 'major_arcana_chariot',
  'strength': 'major_arcana_strength', 'the hermit': 'major_arcana_hermit',
  'wheel of fortune': 'major_arcana_fortune', 'justice': 'major_arcana_justice',
  'the hanged man': 'major_arcana_hanged', 'death': 'major_arcana_death',
  'temperance': 'major_arcana_temperance', 'the devil': 'major_arcana_devil',
  'the tower': 'major_arcana_tower', 'the star': 'major_arcana_star',
  'the moon': 'major_arcana_moon', 'the sun': 'major_arcana_sun',
  'judgement': 'major_arcana_judgement', 'the world': 'major_arcana_world',
}
const minorRankMap: Record<string, string> = {
  ace: 'ace', two: '2', three: '3', four: '4', five: '5', six: '6',
  seven: '7', eight: '8', nine: '9', ten: '10',
  page: 'page', knight: 'knight', queen: 'queen', king: 'king',
}
const minorSuitMap: Record<string, string> = {
  cups: 'cups', pentacles: 'pentacles', swords: 'swords', wands: 'wands',
}

function normalizeName(name: string) {
  return name.replace(/^[0-9]+\.?\s*/i, '').replace(/^[ivxlcdm]+\.\s*/i, '')
    .toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function lookupTarotImage(cardName: string): string | null {
  if (!cardName) return null
  const n = normalizeName(cardName)
  if (majorArcanaMap[n]) return tarotImagesFlat[majorArcanaMap[n]]
  const m = n.match(/^(.*?) of (cups|pentacles|swords|wands)$/)
  if (!m) return null
  const rank = minorRankMap[m[1].trim()]
  const suit = minorSuitMap[m[2]]
  if (!rank || !suit) return null
  const key = `minor_arcana_${suit}_${rank}` as keyof typeof tarotImagesFlat
  return tarotImagesFlat[key] ?? null
}

function getCardDisplayName(card: any): string {
  if (!card) return ''
  return (card.name ?? card.cardName ?? '').trim()
}

function getCardOrientation(card: any): 'upright' | 'reversed' {
  if (!card) return 'upright'
  if (card.orientation === 'reversed' || card.isReversed === true) return 'reversed'
  return 'upright'
}

function getCardImage(card: any): string | null {
  if (!card) return null
  const name = getCardDisplayName(card)
  return lookupTarotImage(name) ?? card.image ?? null
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ============================================================
// Shared sub-components
// ============================================================

function QuestionBlock({ question }: { question: string | null }) {
  if (!question) return null
  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
      <p className="text-[11px] font-semibold text-primary/70 uppercase tracking-wider mb-1.5">你的问题</p>
      <p className="text-white/90 text-sm leading-relaxed">{question}</p>
    </div>
  )
}

function OverallBlock({ text, label = '整体解读' }: { text: string; label?: string }) {
  if (!text) return null
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/20 p-5 mb-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  )
}

function ClosingBlock({ text, label = '提醒' }: { text: string; label?: string }) {
  if (!text) return null
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 mt-2">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-white/75 text-sm leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  )
}

function CardRow({
  card, positionLabel, interpretation, index,
}: {
  card: any; positionLabel: string; interpretation: string; index: number
}) {
  const imageUrl = getCardImage(card)
  const orientation = getCardOrientation(card)
  const cardName = getCardDisplayName(card)

  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors">
      {/* Card image */}
      <div className="shrink-0">
        {imageUrl ? (
          <div className="w-14 h-20 rounded-lg overflow-hidden border border-white/15 shadow-md">
            <img
              src={imageUrl}
              alt={cardName}
              className={`w-full h-full object-cover ${orientation === 'reversed' ? 'rotate-180' : ''}`}
            />
          </div>
        ) : (
          <div className="w-14 h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/20 text-sm">style</span>
          </div>
        )}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {positionLabel && (
            <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">{positionLabel}</span>
          )}
          {cardName && (
            <>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-white/70 text-xs font-medium">{cardName}</span>
            </>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
            orientation === 'reversed'
              ? 'border-amber-500/40 text-amber-400/80'
              : 'border-emerald-500/40 text-emerald-400/80'
          }`}>
            {orientation === 'upright' ? '正位' : '逆位'}
          </span>
        </div>
        {interpretation && (
          <p className="text-white/80 text-sm leading-relaxed">{interpretation}</p>
        )}
      </div>
    </div>
  )
}

function ActionList({ items, label }: { items: string[]; label: string }) {
  if (!items || items.length === 0) return null
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/75">
            <span className="text-primary/60 mt-0.5 shrink-0">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FortuneCard({ icon, title, content, compact = false }: {
  icon: string; title: string; content?: string; compact?: boolean
}) {
  if (!content) return null
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 flex flex-col gap-1.5 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined text-primary ${compact ? 'text-base' : 'text-lg'}`}>{icon}</span>
        <h4 className={`font-semibold text-white/90 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</h4>
      </div>
      <p className={`text-white/75 leading-relaxed ${compact ? 'text-base font-bold text-center' : 'text-sm'}`}>
        {content}
      </p>
    </div>
  )
}

// ============================================================
// View: Daily Fortune
// ============================================================
function DailyFortuneView({ record }: { record: HistoryRecord }) {
  const cardRef = Array.isArray(record.cards) ? record.cards[0] : null
  const r = record.reading_result ?? {}
  const imageUrl = cardRef ? getCardImage(cardRef) : null
  const orientation: 'upright' | 'reversed' = cardRef?.orientation ?? 'upright'

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Card */}
        <div className="flex flex-col items-center gap-4">
          {imageUrl ? (
            <div className="w-44 h-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(127,19,236,0.3)]">
              <img src={imageUrl} alt={cardRef?.name ?? ''} className={`w-full h-full object-cover ${orientation === 'reversed' ? 'rotate-180' : ''}`} />
            </div>
          ) : (
            <div className="w-44 h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/20 text-sm">无图片</span>
            </div>
          )}
          {cardRef?.name && (
            <div className="text-center">
              <p className="text-white font-bold text-lg">{cardRef.name}</p>
              <p className="text-white/50 text-sm mt-0.5">{orientation === 'upright' ? '正位' : '逆位'}</p>
            </div>
          )}
        </div>
        {/* Fortune content */}
        <div className="flex flex-col gap-4">
          {/* Quote */}
          {r.quote && (
            <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-purple-900/20 p-6 text-center">
              <p className="text-xl font-bold text-white leading-relaxed">{r.quote}</p>
            </div>
          )}
          {/* Fortune grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            <FortuneCard icon="wb_sunny" title="综合运势" content={r.overall} />
            <FortuneCard icon="favorite" title="爱情运势" content={r.love} />
            <FortuneCard icon="school" title="事业 & 学业" content={r.career} />
            <FortuneCard icon="paid" title="财运" content={r.wealth} />
            <FortuneCard icon="healing" title="健康" content={r.health} />
          </div>
          {(r.luckyColor || r.luckyNumber !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              <FortuneCard icon="palette" title="幸运色" content={r.luckyColor} compact />
              {r.luckyNumber !== undefined && (
                <FortuneCard icon="casino" title="幸运数字" content={String(r.luckyNumber)} compact />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// View: Monthly Basic Fortune (3 cards, fortune grid + card meanings)
// ============================================================
function FortuneMonthlyBasicView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const cards: any[] = Array.isArray(record.cards) ? record.cards : []
  const cardMeanings = [r.card1Meaning, r.card2Meaning, r.card3Meaning]
  const cardLabels = ['第 1 张牌', '第 2 张牌', '第 3 张牌']

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Quote */}
      {r.quote && (
        <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-purple-900/20 p-6 text-center">
          <p className="text-xl font-bold text-white leading-relaxed">{r.quote}</p>
        </div>
      )}

      {/* 3 Cards + meanings */}
      {cards.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {cards.slice(0, 3).map((card, i) => {
            const img = getCardImage(card)
            return (
              <div key={i} className="flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-primary/80 uppercase tracking-wider">{cardLabels[i]}</p>
                {img ? (
                  <div className="w-20 h-28 rounded-lg overflow-hidden border border-white/15 shadow-md">
                    <img src={img} alt={card.name ?? ''} className={`w-full h-full object-cover ${card.orientation === 'reversed' ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <div className="w-20 h-28 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-sm">style</span>
                  </div>
                )}
                <p className="text-white/80 text-xs text-center leading-tight font-medium">{card.name ?? ''}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${card.orientation === 'reversed' ? 'border-amber-500/40 text-amber-400/80' : 'border-emerald-500/40 text-emerald-400/80'}`}>
                  {card.orientation === 'upright' ? '正位' : '逆位'}
                </span>
                {cardMeanings[i] && (
                  <p className="text-white/60 text-xs leading-relaxed text-center">{cardMeanings[i]}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Fortune grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <FortuneCard icon="wb_sunny" title="综合运势" content={r.overall} />
        </div>
        <FortuneCard icon="favorite" title="爱情运势" content={r.love} />
        <FortuneCard icon="school" title="事业 & 学业" content={r.career} />
        <FortuneCard icon="paid" title="财运" content={r.wealth} />
        <FortuneCard icon="healing" title="健康" content={r.health} />
      </div>
    </div>
  )
}

// ============================================================
// View: Monthly Member Fortune (7 cards + position readings)
// ============================================================
function FortuneMonthlyMemberView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const resultCards: any[] = Array.isArray(r.cards) ? r.cards : []

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {r.month && (
        <p className="text-center text-primary font-semibold text-sm uppercase tracking-wider">{r.month}</p>
      )}
      {r.summary && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/20 p-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">本月总览</p>
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{r.summary}</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {resultCards.map((rc: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={rc.position ?? ''}
            interpretation={rc.meaning ?? rc.reading ?? ''}
            index={i}
          />
        ))}
        {resultCards.length === 0 && rawCards.length > 0 && rawCards.map((card: any, i: number) => (
          <CardRow key={i} card={card} positionLabel={`位置 ${i + 1}`} interpretation="" index={i} />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// View: Seasonal Fortune (5 cards, 6 dimensions)
// ============================================================
const SEASONAL_SLOT_LABELS = ['行动力', '情感与人际', '思维与计划', '事业与财运', '整体运势']

function FortuneSeasonalView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const hasReading = !!(r.coreEnergy || r.action || r.emotion || r.mind || r.material)

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Card strip */}
      {rawCards.length > 0 && (
        <div className="flex justify-center gap-3 flex-wrap">
          {rawCards.map((card: any, i: number) => {
            const img = getCardImage(card)
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                {img ? (
                  <div className="w-16 rounded-lg overflow-hidden border border-white/20 shadow-[0_0_12px_rgba(127,19,236,0.2)]" style={{ height: '6rem' }}>
                    <img src={img} alt={card.name ?? ''} className={`w-full h-full object-cover ${card.orientation === 'reversed' ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <div className="w-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center" style={{ height: '6rem' }}>
                    <span className="material-symbols-outlined text-white/20 text-sm">style</span>
                  </div>
                )}
                <p className="text-[10px] text-white/40 text-center w-16 truncate">{SEASONAL_SLOT_LABELS[i] ?? ''}</p>
              </div>
            )
          })}
        </div>
      )}

      {!hasReading && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <span className="material-symbols-outlined text-white/20 text-4xl mb-3 block">auto_stories</span>
          <p className="text-white/40 text-sm">该记录暂无 AI 解读数据</p>
        </div>
      )}

      {hasReading && (
        <div className="flex flex-col gap-5">
          {/* 整体运势（Overall）*/}
          {r.coreEnergy && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-0.5">auto_awesome</span>
                <div>
                  <h3 className="text-lg font-bold text-white">✧ 整体运势（Overall）</h3>
                  {rawCards[4]?.name && (
                    <p className="text-xs text-primary/70 mt-0.5">
                      {rawCards[4].name}（{rawCards[4].orientation === 'upright' ? '正位' : '逆位'}）
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{r.coreEnergy}</p>
            </div>
          )}
          {/* 行动力（Action）*/}
          {r.action && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-yellow-400 text-2xl mt-0.5">bolt</span>
                <div>
                  <h3 className="text-lg font-bold text-white">⚡ 行动力（Action）</h3>
                  {rawCards[0]?.name && (
                    <p className="text-xs text-white/50 mt-0.5">
                      {rawCards[0].name}（{rawCards[0].orientation === 'upright' ? '正位' : '逆位'}）
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{r.action}</p>
            </div>
          )}
          {/* 情感与人际关系（Emotion）*/}
          {r.emotion && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-pink-400 text-2xl mt-0.5">favorite</span>
                <div>
                  <h3 className="text-lg font-bold text-white">♡ 情感与人际关系（Emotion）</h3>
                  {rawCards[1]?.name && (
                    <p className="text-xs text-white/50 mt-0.5">
                      {rawCards[1].name}（{rawCards[1].orientation === 'upright' ? '正位' : '逆位'}）
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{r.emotion}</p>
            </div>
          )}
          {/* 思维与计划（Thinking）*/}
          {r.mind && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-blue-400 text-2xl mt-0.5">psychology</span>
                <div>
                  <h3 className="text-lg font-bold text-white">THINKING 思维与计划</h3>
                  {rawCards[2]?.name && (
                    <p className="text-xs text-white/50 mt-0.5">
                      {rawCards[2].name}（{rawCards[2].orientation === 'upright' ? '正位' : '逆位'}）
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{r.mind}</p>
            </div>
          )}
          {/* 事业与财运（Wealth）*/}
          {r.material && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-green-400 text-2xl mt-0.5">account_balance_wallet</span>
                <div>
                  <h3 className="text-lg font-bold text-white">$ 事业与财运（Wealth）</h3>
                  {rawCards[3]?.name && (
                    <p className="text-xs text-white/50 mt-0.5">
                      {rawCards[3].name}（{rawCards[3].orientation === 'upright' ? '正位' : '逆位'}）
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{r.material}</p>
            </div>
          )}
          {/* 综合建议 */}
          {r.synthesis && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-0.5">explore</span>
                <h3 className="text-lg font-bold text-white">综合建议</h3>
              </div>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-line">{r.synthesis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// View: Yearly Fortune (13 cards, monthly readings)
// ============================================================
const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月', '年度主题牌']

function FortuneYearlyView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const resultCards: any[] = Array.isArray(r.cards) ? r.cards : []

  const summary = r.summary ?? r.overview ?? r.yearSummary ?? ''
  const year = r.year ?? ''

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {year && (
        <p className="text-center text-primary font-semibold text-base uppercase tracking-wider">{year} 年度指引</p>
      )}
      {summary && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">年度能量概览</p>
          <p className="text-white/90 text-base leading-relaxed whitespace-pre-line">{summary}</p>
        </div>
      )}

      {resultCards.length > 0 && (
        <p className="text-lg font-bold text-white text-center">月度详细指引</p>
      )}

      <div className="flex flex-col gap-4">
        {resultCards.map((rc: any, i: number) => {
          const card = rawCards[i]
          const posLabel = rc.position ?? rc.month ?? MONTH_LABELS[i] ?? `第${i + 1}张`
          const interpretation = rc.meaning ?? rc.reading ?? rc.interpretation ?? ''
          const isTheme = i === 12
          const cardKeywords: string[] = Array.isArray(card?.keywords) ? card.keywords : []

          return (
            <div key={i} className={`flex gap-5 rounded-2xl border p-5 transition-colors ${isTheme ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-white/5'}`}>
              <div className="shrink-0">
                {getCardImage(card) ? (
                  <div className={`rounded-lg overflow-hidden border-2 ${isTheme ? 'w-20 border-primary/50' : 'w-16 border-white/20'}`} style={{ height: isTheme ? '7.5rem' : '6rem' }}>
                    <img src={getCardImage(card)!} alt={card?.name ?? ''} className={`w-full h-full object-cover ${card?.orientation === 'reversed' ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <div className={`rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${isTheme ? 'w-20' : 'w-16'}`} style={{ height: isTheme ? '7.5rem' : '6rem' }}>
                    <span className="material-symbols-outlined text-white/20 text-sm">style</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isTheme ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>{posLabel}</span>
                  {card?.orientation && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${card.orientation === 'reversed' ? 'border-amber-500/40 text-amber-400/80' : 'border-emerald-500/40 text-emerald-400/80'}`}>
                      {card.orientation === 'upright' ? '正位' : '逆位'}
                    </span>
                  )}
                </div>
                {card?.name && (
                  <p className={`font-bold mb-1.5 ${isTheme ? 'text-lg text-primary' : 'text-base text-white'}`}>{card.name}</p>
                )}
                {cardKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {cardKeywords.map((kw: string, ki: number) => (
                      <span key={ki} className="px-2 py-0.5 text-[10px] rounded-md bg-white/10 text-white/50 border border-white/10">{kw}</span>
                    ))}
                  </div>
                )}
                {interpretation && <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{interpretation}</p>}
              </div>
            </div>
          )
        })}
        {resultCards.length === 0 && rawCards.length > 0 && (
          <div className="flex flex-col gap-3">
            {rawCards.map((card: any, i: number) => (
              <CardRow key={i} card={card} positionLabel={MONTH_LABELS[i] ?? `第${i + 1}张`} interpretation="" index={i} />
            ))}
          </div>
        )}
        {resultCards.length === 0 && rawCards.length === 0 && r.interpretation && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {typeof r.interpretation === 'string' ? r.interpretation : JSON.stringify(r.interpretation, null, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// View: Multi-card Pattern A (three-card, sacred-triangle, hexagram, horseshoe, celtic-cross)
// ============================================================
interface NormalizedCardReading {
  positionLabel: string
  interpretation: string
}

function normalizePatternA(record: HistoryRecord): {
  overall: string; perCards: NormalizedCardReading[]; closing: string; extras: {label: string; content: string}[]
} {
  const r = record.reading_result ?? {}
  const spreadType = normalizeKey(record.spread_type)
  let perCards: NormalizedCardReading[] = []
  const extras: {label: string; content: string}[] = []

  const rcards: any[] = Array.isArray(r.cards) ? r.cards : []

  if (spreadType === 'three-card-general') {
    perCards = rcards.map((c: any) => ({ positionLabel: c.position ?? '', interpretation: c.reading ?? c.interpretation ?? '' }))
  } else if (spreadType === 'hexagram') {
    perCards = rcards.map((c: any) => ({ positionLabel: c.position ?? '', interpretation: c.meaning ?? c.interpretation ?? '' }))
  } else if (spreadType === 'horseshoe') {
    perCards = rcards.map((c: any) => ({ positionLabel: c.position_name ?? c.position ?? '', interpretation: c.interpretation ?? '' }))
    if (Array.isArray(r.tips) && r.tips.length > 0) {
      extras.push({ label: '重点提示', content: r.tips.join('\n') })
    }
  } else if (spreadType === 'celtic-cross') {
    perCards = rcards.map((c: any) => ({ positionLabel: c.positionTitle ?? c.position ?? '', interpretation: c.interpretation ?? '' }))
    if (r.actionAdvice) extras.push({ label: '行动建议', content: r.actionAdvice })
  } else if (spreadType === 'sacred-triangle') {
    perCards = rcards.map((c: any) => ({ positionLabel: c.positionMeaning ?? c.role ?? '', interpretation: c.interpretation ?? '' }))
    if (r.overall?.priority) extras.push({ label: '核心优先事项', content: r.overall.priority })
  } else {
    // Generic fallback - try multiple field patterns
    perCards = rcards.map((c: any) => ({
      positionLabel: c.positionTitle ?? c.position_name ?? c.positionMeaning ?? c.position ?? c.role ?? '',
      interpretation: c.interpretation ?? c.meaning ?? c.reading ?? '',
    }))
  }

  const overall = typeof r.overall === 'object' ? (r.overall?.summary ?? '') : (r.overall ?? r.overall_reading ?? '')
  const closing = r.closing ?? r.reminder ?? ''

  return { overall, perCards, closing, extras }
}

function MultiCardReadingView({ record }: { record: HistoryRecord }) {
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const { overall, perCards, closing, extras } = normalizePatternA(record)

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      <OverallBlock text={overall} />
      <div className="flex flex-col gap-3">
        {perCards.map((pc, i) => (
          <CardRow key={i} card={rawCards[i]} positionLabel={pc.positionLabel} interpretation={pc.interpretation} index={i} />
        ))}
      </div>
      {extras.map((ex, i) => <ClosingBlock key={i} text={ex.content} label={ex.label} />)}
      <ClosingBlock text={closing} />
    </div>
  )
}

// ============================================================
// View: Two Choices (special Pattern A with comparison block)
// ============================================================
function TwoChoicesView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const rcards: any[] = Array.isArray(r.cards) ? r.cards : []

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      <OverallBlock text={r.overall_reading ?? r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {rcards.map((c: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={c.position_name ?? c.position ?? ''}
            interpretation={c.interpretation ?? c.reading ?? ''}
            index={i}
          />
        ))}
      </div>
      {r.choice_comparison && (
        <div className="flex flex-col gap-3">
          {r.choice_comparison.option_a_analysis && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs font-semibold text-blue-400/70 uppercase tracking-wider mb-1.5">选项 A 分析</p>
              <p className="text-white/80 text-sm leading-relaxed">{r.choice_comparison.option_a_analysis}</p>
            </div>
          )}
          {r.choice_comparison.option_b_analysis && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-xs font-semibold text-purple-400/70 uppercase tracking-wider mb-1.5">选项 B 分析</p>
              <p className="text-white/80 text-sm leading-relaxed">{r.choice_comparison.option_b_analysis}</p>
            </div>
          )}
          {r.choice_comparison.decision_guidance && (
            <OverallBlock text={r.choice_comparison.decision_guidance} label="决策指引" />
          )}
        </div>
      )}
      <ClosingBlock text={r.rational_reminder ?? r.closing ?? r.reminder ?? ''} />
    </div>
  )
}

// ============================================================
// View: Wealth Current Status (3 positions with title)
// ============================================================
function WealthCurrentStatusView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const positions: any[] = Array.isArray(r.positions) ? r.positions : []

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <OverallBlock text={r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {positions.map((pos: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={pos.title ?? pos.position ?? ''}
            interpretation={pos.reading ?? pos.interpretation ?? ''}
            index={i}
          />
        ))}
      </div>
      {Array.isArray(r.actions) && r.actions.length > 0 && (
        <ActionList items={r.actions} label="行动建议" />
      )}
      <ClosingBlock text={r.closing ?? ''} />
    </div>
  )
}

// ============================================================
// View: Wealth Obstacles (5 cards)
// ============================================================
function WealthObstaclesView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const rcards: any[] = Array.isArray(r.cards) ? r.cards : []

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <OverallBlock text={r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {rcards.map((c: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={c.title ?? c.position_name ?? c.position ?? ''}
            interpretation={c.reading ?? c.interpretation ?? ''}
            index={i}
          />
        ))}
      </div>
      <ClosingBlock text={r.disclaimer ?? ''} label="说明" />
    </div>
  )
}

// ============================================================
// View: Career Detail (skills-direction, interview-exam — with action_plan)
// ============================================================
function CareerDetailView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const positions: any[] = Array.isArray(r.positions) ? r.positions : []
  const ap = r.action_plan ?? {}

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      {r.title && (
        <div className="text-center">
          <p className="text-white font-bold text-base">{r.title}</p>
        </div>
      )}
      {r.warm_opening && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/80 text-sm leading-relaxed italic">{r.warm_opening}</p>
        </div>
      )}
      <OverallBlock text={r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {positions.map((pos: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={pos.position ?? ''}
            interpretation={pos.reading ?? pos.interpretation ?? ''}
            index={i}
          />
        ))}
      </div>
      {/* Action plan */}
      {(ap.fit_directions?.length || ap.next_7_days?.length || ap.next_30_days?.length || ap.avoid?.length) && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">行动方案</p>
          {ap.fit_directions?.length > 0 && <ActionList items={ap.fit_directions} label="适合的方向" />}
          {ap.next_7_days?.length > 0 && <ActionList items={ap.next_7_days} label="接下来 7 天" />}
          {ap.next_30_days?.length > 0 && <ActionList items={ap.next_30_days} label="接下来 30 天" />}
          {ap.avoid?.length > 0 && <ActionList items={ap.avoid} label="需要避免的" />}
        </div>
      )}
      <ClosingBlock text={r.closing ?? ''} />
    </div>
  )
}

// ============================================================
// View: Offer Decision (simpler career spread)
// ============================================================
function OfferDecisionView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const positions: any[] = Array.isArray(r.positions) ? r.positions : []

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      <OverallBlock text={r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {positions.map((pos: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={pos.position ?? ''}
            interpretation={pos.reading ?? pos.interpretation ?? ''}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// View: Stay or Leave
// ============================================================
function StayOrLeaveView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const details: any[] = Array.isArray(r.cardDetails) ? r.cardDetails : []

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <OverallBlock text={r.overview ?? r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {details.map((d: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={d.slotName ?? d.position ?? ''}
            interpretation={d.interpretation ?? d.reading ?? ''}
            index={i}
          />
        ))}
      </div>
      {Array.isArray(r.actionSuggestions) && r.actionSuggestions.length > 0 && (
        <ActionList items={r.actionSuggestions} label="行动建议" />
      )}
      <ClosingBlock text={r.realityReminder ?? r.reminder ?? ''} label="现实提醒" />
    </div>
  )
}

// ============================================================
// View: Pattern B — sections + summary + actions (future-lover, reconciliation)
// ============================================================
function SectionedReadingView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const sections: any[] = Array.isArray(r.sections) ? r.sections : []
  const actions: any[] = Array.isArray(r.actions) ? r.actions : []

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {/* Mini card strip */}
      {rawCards.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {rawCards.map((card: any, i: number) => {
            const img = getCardImage(card)
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                {img ? (
                  <div className="w-12 rounded-md overflow-hidden border border-white/15" style={{ height: '4.5rem' }}>
                    <img src={img} alt={getCardDisplayName(card)} className={`w-full h-full object-cover ${getCardOrientation(card) === 'reversed' ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <div className="w-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center" style={{ height: '4.5rem' }}>
                    <span className="material-symbols-outlined text-white/20 text-xs">style</span>
                  </div>
                )}
                <span className={`text-[9px] ${getCardOrientation(card) === 'reversed' ? 'text-amber-400/60' : 'text-emerald-400/60'}`}>
                  {getCardOrientation(card) === 'upright' ? '正' : '逆'}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {/* Sections */}
      {sections.map((sec: any, i: number) => (
        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
          {sec.title && <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-2">{sec.title}</p>}
          {sec.text && <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{sec.text}</p>}
        </div>
      ))}
      {/* Summary */}
      {r.summary?.text && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/20 p-5">
          {r.summary.title && <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{r.summary.title}</p>}
          <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{r.summary.text}</p>
        </div>
      )}
      {/* Actions */}
      {actions.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">建议行动</p>
          <ul className="space-y-1.5">
            {actions.map((a: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                <span className="text-primary/60 mt-0.5 shrink-0">•</span>
                <span>{a.text ?? a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================
// View: What They Think (SpreadReading format)
// ============================================================
function WhatTheyThinkView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const positions: any[] = Array.isArray(r.positions) ? r.positions : []
  const shortTerm = r.shortTerm ?? {}

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {r.title && (
        <div className="text-center">
          <p className="text-white font-bold text-base">{r.title}</p>
        </div>
      )}
      <OverallBlock text={r.overall ?? ''} />
      <div className="flex flex-col gap-3">
        {positions.map((pos: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={pos.label ?? pos.position ?? ''}
            interpretation={pos.reading ?? ''}
            index={i}
          />
        ))}
      </div>
      {shortTerm.trend && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">短期走向</p>
          <p className="text-white/80 text-sm leading-relaxed">{shortTerm.trend}</p>
          {shortTerm.advice?.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] text-white/40 mb-1.5">建议</p>
              <ul className="space-y-1">
                {shortTerm.advice.map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                    <span className="text-primary/50 mt-0.5 shrink-0">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shortTerm.watchFor?.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] text-white/40 mb-1.5">需要留意</p>
              <ul className="space-y-1">
                {shortTerm.watchFor.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                    <span className="text-amber-400/50 mt-0.5 shrink-0">!</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {r.disclaimer && <ClosingBlock text={r.disclaimer} label="说明" />}
    </div>
  )
}

// ============================================================
// View: Relationship Development (5-module structure)
// ============================================================
function RelationshipDevView({ record }: { record: HistoryRecord }) {
  const r = record.reading_result ?? {}
  const rawCards: any[] = Array.isArray(record.cards) ? record.cards : []
  const cardReadings: any[] = Array.isArray(r.cardReadings) ? r.cardReadings : []
  const integration = r.integration ?? {}

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {r.spreadExplanation && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">牌阵说明</p>
          <p className="text-white/70 text-sm leading-relaxed">{r.spreadExplanation}</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {cardReadings.map((cr: any, i: number) => (
          <CardRow
            key={i}
            card={rawCards[i]}
            positionLabel={cr.label ?? cr.position ?? ''}
            interpretation={cr.reading ?? ''}
            index={i}
          />
        ))}
      </div>
      {(integration.theme || integration.drivingForce || integration.tension) && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/20 p-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">关系动力分析</p>
          {integration.theme && (
            <div className="mb-2">
              <p className="text-[11px] text-white/50 mb-0.5">主旋律</p>
              <p className="text-white/85 text-sm leading-relaxed">{integration.theme}</p>
            </div>
          )}
          {integration.drivingForce && (
            <div className="mb-2">
              <p className="text-[11px] text-white/50 mb-0.5">驱动力</p>
              <p className="text-white/85 text-sm leading-relaxed">{integration.drivingForce}</p>
            </div>
          )}
          {integration.tension && (
            <div>
              <p className="text-[11px] text-white/50 mb-0.5">张力与卡点</p>
              <p className="text-white/85 text-sm leading-relaxed">{integration.tension}</p>
            </div>
          )}
        </div>
      )}
      {r.shortTermTrend && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">短期发展趋势</p>
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{r.shortTermTrend}</p>
        </div>
      )}
      <ClosingBlock text={r.closing ?? ''} />
    </div>
  )
}

// ============================================================
// View: Yes / No Tarot
// ============================================================
function normalizeYesNo(raw: unknown): YesNoAnswer | null {
  if (!raw) return null
  const s = String(raw).toLowerCase()
  if (s.includes('yes') || s.includes('是')) return 'YES'
  if (s.includes('no') || s.includes('否')) return 'NO'
  if (s.includes('maybe') || s.includes('不确定') || s.includes('可能')) return 'MAYBE'
  return 'MAYBE'
}

function YesNoView({ record }: { record: HistoryRecord }) {
  const cardData = Array.isArray(record.cards) ? record.cards[0] : null
  const result = record.reading_result ?? {}
  const answer: YesNoAnswer | null = normalizeYesNo(result.answer)
  const interpretation: string = result.interpretation ?? ''
  const imageUrl = cardData ? (lookupTarotImage(cardData.name) ?? cardData.image ?? null) : null
  const answerColor = answer === 'YES' ? 'text-green-400' : answer === 'NO' ? 'text-red-400' : 'text-yellow-400'
  const answerBg = answer === 'YES' ? 'from-green-500/10' : answer === 'NO' ? 'from-red-500/10' : 'from-yellow-500/10'

  return (
    <div className="max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr]">
        <div className="flex flex-col gap-4 items-center">
          {imageUrl ? (
            <div className="w-44 h-64 overflow-hidden rounded-2xl border-2 border-primary/30 shadow-[0_0_30px_rgba(127,19,236,0.4)]">
              <img src={imageUrl} alt={cardData?.name ?? ''} className={`w-full h-full object-cover ${cardData?.orientation === 'reversed' ? 'rotate-180' : ''}`} />
            </div>
          ) : (
            <div className="w-44 h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/30 text-sm">无图片</span>
            </div>
          )}
          {cardData?.name && (
            <div className="text-center">
              <p className="text-white font-bold text-lg">{cardData.name}</p>
              <p className="text-white/50 text-sm">{cardData.orientation === 'upright' ? '正位' : '逆位'}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {answer && (
            <div className={`rounded-2xl border border-primary/30 bg-gradient-to-br ${answerBg} to-transparent p-6`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${answerColor} text-3xl`}>
                  {answer === 'YES' ? 'check_circle' : answer === 'NO' ? 'cancel' : 'help'}
                </span>
                <div>
                  <p className="text-sm font-medium text-white/60 uppercase tracking-wider">答案</p>
                  <p className={`text-4xl font-black ${answerColor}`}>{getAnswerText(answer)}</p>
                </div>
              </div>
            </div>
          )}
          {interpretation && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">解读</p>
              <p className="text-base leading-relaxed text-white/90 whitespace-pre-line">{interpretation}</p>
            </div>
          )}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/50 leading-relaxed">
              塔罗牌只是工具，它反映的是当下的能量和可能性。最终的选择权在你手中，请结合自身情况和内心感受做出决定。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// View: Jiaobei
// ============================================================
type JiaobeiType = 'sheng' | 'yin' | 'xiao'
const jiaobeiData: Record<JiaobeiType, { title: string; subtitle: string; emoji: string; color: string; gradient: string }> = {
  sheng: { title: '圣筊', subtitle: 'Positive Sign', emoji: '🌕🌑', color: '#10b981', gradient: 'from-emerald-500/20 to-green-500/20' },
  yin: { title: '阴筊', subtitle: 'Negative Sign', emoji: '🌕🌕', color: '#ef4444', gradient: 'from-red-500/20 to-rose-500/20' },
  xiao: { title: '笑筊', subtitle: 'Unclear Sign', emoji: '🌑🌑', color: '#f59e0b', gradient: 'from-amber-500/20 to-yellow-500/20' },
}

function JiaobeiView({ record }: { record: HistoryRecord }) {
  const result = record.reading_result ?? {}
  const type: JiaobeiType | null = result.type ?? null
  const meta = type ? jiaobeiData[type] : null

  const displayTitle = meta?.title ?? result.title ?? '筊杯结果'
  const displaySubtitle = meta?.subtitle ?? ''
  const displayEmoji = meta?.emoji ?? '🌕🌑'
  const displayColor = meta?.color ?? '#a78bfa'
  const displayGradient = meta?.gradient ?? 'from-purple-500/20 to-violet-500/20'
  const displayDescription = result.description ?? ''

  if (!meta && !result.title && !result.description) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-white/20 text-5xl mb-3 block">help_outline</span>
        <p className="text-white/40 text-sm">无法解析掷筊结果数据</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <QuestionBlock question={record.question} />
      <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${displayGradient} backdrop-blur-sm p-8 sm:p-10 text-center`}>
        <div className="text-7xl sm:text-8xl mb-5">{displayEmoji}</div>
        <h2 className="text-5xl sm:text-6xl font-black mb-1 tracking-tight" style={{ color: displayColor }}>{displayTitle}</h2>
        {displaySubtitle && (
          <p className="text-white/60 text-lg font-medium uppercase tracking-wider mb-5">{displaySubtitle}</p>
        )}
        {displayDescription && (
          <div className="max-w-xl mx-auto mb-5">
            <p className="text-white/80 text-lg sm:text-xl leading-relaxed">{displayDescription}</p>
          </div>
        )}
        {result.aiInterpretation && (
          <div className="max-w-xl mx-auto rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:p-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">AI 解读</span>
            </div>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">{result.aiInterpretation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Route to correct view
// ============================================================
function renderContent(record: HistoryRecord) {
  const key = normalizeKey(record.spread_type)

  if (key === 'fortune-daily') return <DailyFortuneView record={record} />
  if (key === 'divination-yesno') return <YesNoView record={record} />
  if (key === 'divination-jiaobei') return <JiaobeiView record={record} />
  if (key === 'fortune-monthly') return <FortuneMonthlyBasicView record={record} />
  if (key === 'fortune-monthly-member') return <FortuneMonthlyMemberView record={record} />
  if (key === 'fortune-seasonal') return <FortuneSeasonalView record={record} />
  if (key === 'fortune-yearly') return <FortuneYearlyView record={record} />
  if (['three-card-general', 'hexagram', 'horseshoe', 'celtic-cross', 'sacred-triangle'].includes(key))
    return <MultiCardReadingView record={record} />
  if (key === 'two-choices') return <TwoChoicesView record={record} />
  if (key === 'wealth-current-status') return <WealthCurrentStatusView record={record} />
  if (key === 'wealth-obstacles') return <WealthObstaclesView record={record} />
  if (['career-skills-direction', 'career-interview-exam', 'career-job'].includes(key))
    return <CareerDetailView record={record} />
  if (key === 'career-offer-decision') return <OfferDecisionView record={record} />
  if (key === 'career-stay-or-leave') return <StayOrLeaveView record={record} />
  if (['love-future-lover', 'love-reconciliation'].includes(key))
    return <SectionedReadingView record={record} />
  if (key === 'love-what-they-think') return <WhatTheyThinkView record={record} />
  if (key === 'love-relationship-development') return <RelationshipDevView record={record} />

  // Unsupported (career-job, wealth-status, unknown legacy)
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <span className="material-symbols-outlined text-white/20 text-5xl">history_toggle_off</span>
      <p className="text-white/50 text-sm">该类型历史结果暂不支持展示</p>
      <p className="text-white/25 text-xs">{record.spread_type}</p>
    </div>
  )
}

// ============================================================
// Main page
// ============================================================
export default function HistoryDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [record, setRecord] = useState<HistoryRecord | null>(null)
  const [state, setState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!id || typeof id !== 'string') return
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace(`/login?next=/history/${id}`)
        return
      }
      const { data, error } = await supabase
        .from('reading_history')
        .select('id, created_at, user_id, question, spread_type, cards, reading_result, result_path')
        .eq('id', id)
        .single()
      if (error || !data) { setState('not_found'); return }
      if (data.user_id !== user.id) { setState('forbidden'); return }

      if (typeof data.reading_result === 'string') {
        try { data.reading_result = JSON.parse(data.reading_result) } catch {}
      }
      if (typeof data.cards === 'string') {
        try { data.cards = JSON.parse(data.cards) } catch {}
      }

      setRecord(data as HistoryRecord)
      setState('ready')
    }
    load().catch((err) => {
      setErrorMsg(err?.message ?? '未知错误')
      setState('error')
    })
  }, [id, router])

  const displayName = record ? getSpreadDisplayName(record.spread_type) : ''

  return (
    <>
      <Head>
        <title>{displayName ? `${displayName} · 历史记录` : '历史记录详情'} - FateAura</title>
      </Head>
      <div className="min-h-screen bg-[#0f0f23]">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-1/5 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 min-h-screen">
          <div className="mx-auto max-w-4xl px-4 sm:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
              <Link href="/history" className="mb-3 flex items-center gap-2 text-white/70 hover:text-primary transition-colors group w-fit">
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="text-xs font-medium">返回占卜记录</span>
              </Link>
              {state === 'ready' && record && (
                <div className="flex flex-col gap-1">
                  <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">{displayName}</h1>
                  <p className="text-white/40 text-xs">{formatTime(record.created_at)}</p>
                </div>
              )}
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="mt-6">
              {state === 'loading' && (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <span className="material-symbols-outlined text-primary/60 text-3xl animate-spin">progress_activity</span>
                  <p className="text-white/40 text-sm">加载中…</p>
                </div>
              )}
              {state === 'not_found' && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <span className="material-symbols-outlined text-white/20 text-5xl">search_off</span>
                  <p className="text-white/50 text-sm">找不到该记录</p>
                  <Link href="/history" className="rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium px-5 py-2 hover:bg-white/10 transition-colors">返回列表</Link>
                </div>
              )}
              {state === 'forbidden' && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <span className="material-symbols-outlined text-white/20 text-5xl">lock</span>
                  <p className="text-white/50 text-sm">你没有权限查看此记录</p>
                  <Link href="/history" className="rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium px-5 py-2 hover:bg-white/10 transition-colors">返回列表</Link>
                </div>
              )}
              {state === 'error' && (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <span className="material-symbols-outlined text-red-400/60 text-4xl">error</span>
                  <p className="text-white/50 text-sm">加载失败，请稍后重试</p>
                  {errorMsg && <p className="text-white/30 text-xs">{errorMsg}</p>}
                </div>
              )}
              {state === 'ready' && record && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  {renderContent(record)}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
