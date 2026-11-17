import { describe, expect, it } from 'vitest'
import { lastDays, tagStats, weakestTags } from './stats'
import type { Item, ProgressRow } from './types'

const item = (id: string, tags: string[]): Item => ({
  id, word: id, pos: null, syllables: 2, stress: 1, split: null, tags, class: 'N', zipf: 4,
})
const row = (item_id: string, correct_count: number, wrong_count: number): ProgressRow => ({
  item_id, status: 'learning', stage: 0, due_date: null, correct_count, wrong_count,
})

describe('タグ別の正答率', () => {
  const items = [item('a', ['-tion/-sion']), item('b', ['-tion/-sion', '規則の例外']), item('c', ['-ate']), item('d', ['-ic/-ical'])]
  const progress = new Map([
    ['a', row('a', 3, 1)],
    ['b', row('b', 0, 2)],
    ['c', row('c', 5, 0)],
  ])
  const stats = tagStats(items, progress)
  it('詞条の正解・不正解を合計し、低い順に並べる', () => {
    expect(stats.map((s) => [s.tag, s.correct, s.total])).toEqual([
      ['規則の例外', 0, 2],
      ['-tion/-sion', 3, 6],
      ['-ate', 5, 5],
    ])
  })
  it('解答していないタグは出さない', () => {
    expect(stats.find((s) => s.tag === '-ic/-ical')).toBeUndefined()
  })
  it('苦手は解答数 3 以上・100% 未満から（少なすぎる「規則の例外」0/2 は対象外）', () => {
    expect([...weakestTags(stats)]).toEqual(['-tion/-sion'])
  })
})

describe('14 日間の解答数', () => {
  it('今日を最後に 14 日分、記録がない日は 0', () => {
    const days = lastDays(new Map([['2026-11-17', 12], ['2026-11-05', 3], ['2026-11-03', 9]]), '2026-11-17')
    expect(days).toHaveLength(14)
    expect(days[0]).toEqual({ day: '2026-11-04', answered: 0 })
    expect(days[1]).toEqual({ day: '2026-11-05', answered: 3 })
    expect(days[13]).toEqual({ day: '2026-11-17', answered: 12 })
  })
})
