import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { buildLearnSet, buildOddOneOut, questionItems } from './questions'
import type { Item } from './types'

const all: Item[] = JSON.parse(readFileSync('public/data/items.json', 'utf8'))
const pool = [...all].sort((a, b) => b.zipf - a.zipf)

function seeded(seed: number) {
  return () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
}

describe('仲間はずれ（題型 B）', () => {
  it('4 語・同じ音節数・3 語が同じ強勢で 1 語だけ違う', () => {
    for (let start = 0; start < 3000; start += 150) {
      const q = buildOddOneOut(pool.slice(start, start + 200), seeded(start))!
      expect(q.kind).toBe('B')
      if (q.kind !== 'B') return
      expect(q.items).toHaveLength(4)
      expect(new Set(q.items.map((i) => i.word)).size).toBe(4)
      expect(new Set(q.items.map((i) => i.syllables)).size).toBe(1)
      const odd = q.items.find((i) => i.id === q.answer)!
      const rest = q.items.filter((i) => i.id !== q.answer)
      expect(new Set(rest.map((i) => i.stress)).size).toBe(1)
      expect(rest[0].stress).not.toBe(odd.stress)
    }
  })
  it('作れないときは null', () => {
    const same = pool.filter((i) => i.syllables === 2 && i.stress === 1).slice(0, 10)
    expect(buildOddOneOut(same)).toBeNull()
  })
})

describe('Learn の 1 組', () => {
  it('10 問、うち B が 2 問、同じ詞条は 1 回だけ', () => {
    for (let s = 0; s < 20; s++) {
      const set = buildLearnSet(pool.slice(s * 30), 10, seeded(s))
      expect(set).toHaveLength(10)
      expect(set.filter((q) => q.kind === 'B')).toHaveLength(2)
      const ids = set.flatMap((q) => questionItems(q).map((i) => i.id))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
  it('S 類は例文（C）、それ以外の 1 語は A', () => {
    const set = buildLearnSet(pool, 10, seeded(1))
    for (const q of set) {
      if (q.kind === 'A') expect(q.item.class).not.toBe('S')
      if (q.kind === 'C') expect(q.item.class).toBe('S')
    }
    const sItem = all.find((i) => i.class === 'S')!
    expect(buildLearnSet([sItem], 10)[0].kind).toBe('C')
  })
  it('残りが少なくても動く', () => {
    expect(buildLearnSet(pool.slice(0, 3), 10)).toHaveLength(3)
    expect(buildLearnSet([], 10)).toHaveLength(0)
  })
})

describe('B の位置', () => {
  it('1 問目は B にならず、B は前半と後半に 1 問ずつ', () => {
    for (let s = 0; s < 50; s++) {
      const set = buildLearnSet(pool, 10, seeded(s))
      const pos = set.map((q, i) => (q.kind === 'B' ? i : -1)).filter((i) => i >= 0)
      expect(pos).toHaveLength(2)
      expect(pos[0]).toBeGreaterThanOrEqual(2)
      expect(pos[0]).toBeLessThan(5)
      expect(pos[1]).toBeGreaterThanOrEqual(5)
    }
  })
})
