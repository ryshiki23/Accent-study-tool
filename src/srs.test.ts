import { describe, expect, it } from 'vitest'
import { addDays, studyToday } from './date'
import { capCount, dueRows, learnOutcome, reviewOutcome } from './srs'
import type { ProgressRow } from './types'

describe('studyToday（日本時間・朝 4 時で日付が変わる）', () => {
  it('日本時間 3:59 はまだ前日', () => {
    // 2026-11-18 03:59 JST = 2026-11-17 18:59 UTC
    expect(studyToday(new Date('2026-11-17T18:59:00Z'))).toBe('2026-11-17')
  })
  it('日本時間 4:00 で翌日になる', () => {
    expect(studyToday(new Date('2026-11-17T19:00:00Z'))).toBe('2026-11-18')
  })
  it('日本時間 0:30（深夜）は前日扱い', () => {
    expect(studyToday(new Date('2026-11-17T15:30:00Z'))).toBe('2026-11-17')
  })
  it('日本時間 23:59 は当日', () => {
    expect(studyToday(new Date('2026-11-18T14:59:00Z'))).toBe('2026-11-18')
  })
  it('UTC では日付が変わっていても、日本時間で判定する', () => {
    // 2026-11-18 08:00 JST = 2026-11-17 23:00 UTC
    expect(studyToday(new Date('2026-11-17T23:00:00Z'))).toBe('2026-11-18')
  })
})

describe('addDays', () => {
  it('月・年をまたぐ', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
    expect(addDays('2026-12-20', 30)).toBe('2027-01-19')
  })
})

describe('Learn の採点', () => {
  it('正解 → mastered', () => {
    expect(learnOutcome(true, '2026-11-17')).toEqual({ status: 'mastered', stage: 0, due_date: null })
  })
  it('不正解 → learning / stage 0 / 明日', () => {
    expect(learnOutcome(false, '2026-11-17')).toEqual({ status: 'learning', stage: 0, due_date: '2026-11-18' })
  })
})

describe('Review の採点（間隔 1, 2, 7, 14, 30 日）', () => {
  const today = '2026-11-17'
  it.each([
    [0, 1, '2026-11-19'], // stage 1 → +2 日
    [1, 2, '2026-11-24'], // stage 2 → +7 日
    [2, 3, '2026-12-01'], // stage 3 → +14 日
    [3, 4, '2026-12-17'], // stage 4 → +30 日
  ])('stage %i で正解 → stage %i、%s', (stage, next, due) => {
    expect(reviewOutcome(stage, true, today)).toEqual({ status: 'learning', stage: next, due_date: due })
  })
  it('stage 4 で正解 → mastered', () => {
    expect(reviewOutcome(4, true, today).status).toBe('mastered')
  })
  it('どの stage でも不正解 → stage 0 / 明日', () => {
    for (let s = 0; s <= 4; s++) {
      expect(reviewOutcome(s, false, today)).toEqual({ status: 'learning', stage: 0, due_date: '2026-11-18' })
    }
  })
  it('全問正解なら間違えてから 54 日で卒業', () => {
    let day = '2026-11-17'
    let o = learnOutcome(false, day)
    while (o.status === 'learning') {
      day = o.due_date!
      o = reviewOutcome(o.stage, true, day)
    }
    expect(day).toBe(addDays('2026-11-17', 1 + 2 + 7 + 14 + 30))
  })
})

describe('復習の出題順', () => {
  const row = (item_id: string, due_date: string | null, status: 'learning' | 'mastered' = 'learning'): ProgressRow => ({
    item_id, status, stage: 0, due_date, correct_count: 0, wrong_count: 1,
  })
  it('今日までが期限の learning だけ、古い順', () => {
    const rows = [
      row('c', '2026-11-17'),
      row('a', '2026-11-10'),
      row('future', '2026-11-18'),
      row('done', null, 'mastered'),
      row('b', '2026-11-15'),
    ]
    expect(dueRows(rows, '2026-11-17').map((r) => r.item_id)).toEqual(['a', 'b', 'c'])
  })
  it('10 を超えたら 10+', () => {
    expect(capCount(3)).toBe('3')
    expect(capCount(10)).toBe('10')
    expect(capCount(11)).toBe('10+')
  })
})
