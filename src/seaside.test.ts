import { describe, expect, it } from 'vitest'
import { catSprite, timeOfDay } from './seaside'

describe('時間帯（日本時間）', () => {
  it.each([
    ['2026-11-17T18:59:00Z', 'evening'], // 3:59 JST
    ['2026-11-17T19:00:00Z', 'morning'], // 4:00
    ['2026-11-18T00:59:00Z', 'morning'], // 9:59
    ['2026-11-18T01:00:00Z', 'noon'], // 10:00
    ['2026-11-18T07:00:00Z', 'evening'], // 16:00
  ])('%s → %s', (iso, t) => {
    expect(timeOfDay(new Date(iso))).toBe(t)
  })
})

describe('ねこのドット絵', () => {
  it('16×16', () => {
    const g = catSprite(3, 'happy')
    expect(g).toHaveLength(16)
    expect(g.every((r) => r.length === 16)).toBe(true)
  })
})
