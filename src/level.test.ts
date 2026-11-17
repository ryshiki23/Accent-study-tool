import { describe, expect, it } from 'vitest'
import { levelOf } from './level'

describe('レベル', () => {
  it.each([
    [0, 1, 50],
    [49, 1, 1],
    [50, 2, 100],
    [149, 2, 1],
    [150, 3, 150],
    [300, 4, 300],
    [600, 5, 400],
    [999, 5, 1],
  ])('覚えた %i 語 → Lv%i、次まで %i', (m, level, toNext) => {
    expect(levelOf(m)).toMatchObject({ level, toNext })
  })
  it('1000 語で最高レベル', () => {
    expect(levelOf(1000)).toEqual({ level: 6, toNext: null, progress: 1 })
    expect(levelOf(4000).level).toBe(6)
  })
})
