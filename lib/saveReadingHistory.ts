import { supabase } from './supabase'

export interface SaveReadingParams {
  spreadType: string
  question?: string
  cards: any
  readingResult: any
  resultPath: string
}

/**
 * 占卜解读成功后，将本次结果写入 reading_history。
 * - 仅登录用户写入，未登录静默跳过
 * - 写入失败只打印错误，不影响主流程
 */
export async function saveReadingHistory(params: SaveReadingParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('reading_history')
      .insert({
        user_id: user.id,
        spread_type: params.spreadType,
        question: params.question || null,
        cards: params.cards,
        reading_result: params.readingResult,
        result_path: params.resultPath,
      })

    if (error) {
      console.error('[saveReadingHistory] 写入失败:', error)
    } else {
      console.log('[saveReadingHistory] 写入成功:', params.spreadType)
    }
  } catch (err) {
    console.error('[saveReadingHistory] 异常:', err)
  }
}
