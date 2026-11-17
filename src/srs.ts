import type { ProgressRow } from './types'
import { addDays } from './date'

/** 復習の間隔（日）。stage 0〜4 に対応（SPEC 6.3） */
export const INTERVALS = [1, 2, 7, 14, 30] as const
export const MAX_STAGE = INTERVALS.length - 1

export interface Outcome {
  status: 'learning' | 'mastered'
  stage: number
  due_date: string | null
}

const WRONG = (today: string): Outcome => ({ status: 'learning', stage: 0, due_date: addDays(today, 1) })

/** Learn の採点（SPEC 6.2）：正解 → 習得、不正解 → stage 0・明日 */
export function learnOutcome(correct: boolean, today: string): Outcome {
  return correct ? { status: 'mastered', stage: 0, due_date: null } : WRONG(today)
}

/**
 * Review の採点（SPEC 6.3）
 * - 正解：stage + 1、due = 今日 + 間隔[新 stage]。stage 4 で正解 → 習得
 * - 不正解：stage 0、due = 明日
 * 期限切れから何日経っていても扱いは同じ（ペナルティなし）
 */
export function reviewOutcome(stage: number, correct: boolean, today: string): Outcome {
  if (!correct) return WRONG(today)
  if (stage >= MAX_STAGE) return { status: 'mastered', stage: MAX_STAGE, due_date: null }
  const next = stage + 1
  return { status: 'learning', stage: next, due_date: addDays(today, INTERVALS[next]) }
}

export function isDue(row: ProgressRow, today: string): boolean {
  return row.status === 'learning' && row.due_date !== null && row.due_date <= today
}

/** 今日復習する詞条：期限切れの古い順（SPEC 6.3） */
export function dueRows(rows: Iterable<ProgressRow>, today: string): ProgressRow[] {
  return [...rows]
    .filter((r) => isDue(r, today))
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : a.due_date! > b.due_date! ? 1 : a.item_id.localeCompare(b.item_id)))
}

/** ホームの表示用。10 を超えたら「10+」 */
export function capCount(n: number, cap = 10): string {
  return n > cap ? `${cap}+` : String(n)
}
