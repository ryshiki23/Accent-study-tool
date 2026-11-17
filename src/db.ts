import { createClient } from '@supabase/supabase-js'
import type { ProgressRow } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const dbConfigured = Boolean(url && key)
const supabase = dbConfigured
  ? createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

export interface RemoteState {
  progress: ProgressRow[]
  study_days: { day: string; answered: number }[]
}

export async function getState(userId: string): Promise<RemoteState> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.rpc('get_state', { p_user_id: userId })
  if (error) throw error
  return data as RemoteState
}

/** 「この問題を報告」。失敗したら 1 回だけ再送 */
export async function reportItem(userId: string, itemId: string): Promise<boolean> {
  if (!supabase) return false
  for (let i = 0; i < 2; i++) {
    const { error } = await supabase.rpc('report_item', { p_user_id: userId, p_item_id: itemId })
    if (!error) return true
  }
  return false
}

// ===== save_answer：送信キュー（失敗したら自動で再試行）=====

interface SaveArgs {
  p_user_id: string
  p_item_id: string
  p_status: 'learning' | 'mastered'
  p_stage: number
  p_due_date: string | null
  p_correct: boolean
  /** false：今日の解答数に数えない */
  p_count_answer: boolean
}

const queue: SaveArgs[] = []
let running = false
let failing = false
let retryDelay = 2000
const listeners = new Set<(unsaved: boolean) => void>()

function notify() {
  const unsaved = failing && queue.length > 0
  listeners.forEach((fn) => fn(unsaved))
}

/** 「未保存」表示用。保存に失敗して溜まっている間だけ true */
export function onUnsavedChange(fn: (unsaved: boolean) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function hasPending(): boolean {
  return queue.length > 0
}

export function saveAnswer(args: SaveArgs) {
  queue.push(args)
  void flush()
}

async function flush() {
  if (running || !supabase) return
  running = true
  while (queue.length > 0) {
    const { error } = await supabase.rpc('save_answer', queue[0])
    if (error) {
      failing = true
      notify()
      running = false
      setTimeout(() => void flush(), retryDelay)
      retryDelay = Math.min(retryDelay * 2, 30000)
      return
    }
    queue.shift()
    retryDelay = 2000
    if (queue.length === 0) failing = false
    notify()
  }
  running = false
}

window.addEventListener('online', () => {
  retryDelay = 2000
  void flush()
})
window.addEventListener('beforeunload', (e) => {
  if (queue.length > 0) e.preventDefault()
})
