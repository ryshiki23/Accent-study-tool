import type { Item, ProgressRow } from './types'
import { addDays } from './date'

export interface TagStat {
  tag: string
  correct: number
  total: number
  rate: number
}

/** 苦手の判定に使う最低解答数（これより少ないタグは正答率が当てにならない） */
export const MIN_ANSWERS = 3

/**
 * 規則タグごとの正答率（SPEC 7.5）。解答した詞条の correct_count / wrong_count を合計。
 * 正答率の低い順。同率なら解答数の多い順。
 */
export function tagStats(items: Item[], progress: Map<string, ProgressRow>): TagStat[] {
  const acc = new Map<string, { correct: number; total: number }>()
  for (const it of items) {
    const p = progress.get(it.id)
    if (!p) continue
    const total = p.correct_count + p.wrong_count
    if (total === 0) continue
    for (const tag of it.tags) {
      const a = acc.get(tag) ?? { correct: 0, total: 0 }
      a.correct += p.correct_count
      a.total += total
      acc.set(tag, a)
    }
  }
  return [...acc.entries()]
    .map(([tag, a]) => ({ tag, ...a, rate: a.correct / a.total }))
    .sort((x, y) => x.rate - y.rate || y.total - x.total || x.tag.localeCompare(y.tag))
}

/** 苦手トップ 3：解答数が MIN_ANSWERS 以上で、正答率 100% 未満のタグ */
export function weakestTags(stats: TagStat[], n = 3): Set<string> {
  return new Set(stats.filter((s) => s.total >= MIN_ANSWERS && s.rate < 1).slice(0, n).map((s) => s.tag))
}

/** 今日までの 14 日間の解答数（古い順） */
export function lastDays(studyDays: Map<string, number>, today: string, n = 14): { day: string; answered: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(today, i - (n - 1))
    return { day, answered: studyDays.get(day) ?? 0 }
  })
}
