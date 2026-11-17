import type { Item } from './types'

/**
 * 出題の単位（SPEC 第 3 節）
 * - A：位置選択（1 語）
 * - B：仲間はずれ（4 語。answer が強勢位置の違う 1 語）
 * - C：例文の中の下線語（S 類専用）
 */
export type Question =
  | { kind: 'A'; item: Item }
  | { kind: 'C'; item: Item }
  | { kind: 'B'; items: Item[]; answer: string }

export const B_PER_SET = 2

/** 1 語の問題。S 類は例文（C）、それ以外は A */
export function singleQuestion(item: Item): Question {
  return item.class === 'S' ? { kind: 'C', item } : { kind: 'A', item }
}

export function questionItems(q: Question): Item[] {
  return q.kind === 'B' ? q.items : [q.item]
}

export const POS_LABEL: Record<string, string> = { noun: '名詞', verb: '動詞', adj: '形容詞' }

/** S 類だけ「record（名詞）」のように品詞をつける */
export function labelWithPos(item: Item): string {
  return item.class === 'S' && item.pos ? `${item.word}（${POS_LABEL[item.pos] ?? item.pos}）` : item.word
}

type Rng = () => number

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 仲間はずれを 1 問作る：音節数が同じ 4 語、うち 3 語は同じ強勢位置、1 語だけ違う。
 * candidates は頻度順。なるべく頻度の高い語で作る。作れなければ null。
 */
export function buildOddOneOut(candidates: Item[], rng: Rng = Math.random): Question | null {
  for (const odd of candidates) {
    const others: Item[] = []
    const words = new Set([odd.word])
    let stress: number | null = null
    for (const c of candidates) {
      if (c.syllables !== odd.syllables || c.stress === odd.stress || words.has(c.word)) continue
      if (stress === null) stress = c.stress
      if (c.stress !== stress) continue
      others.push(c)
      words.add(c.word)
      if (others.length === 3) break
    }
    if (others.length === 3) {
      return { kind: 'B', items: shuffle([odd, ...others], rng), answer: odd.id }
    }
  }
  return null
}

/** Learn で選ぶ範囲：まだ出していない語のうち、頻度の高い順にこの数まで */
export const LEARN_WINDOW = 100
/** 1 組のうち 2 音節の問題の上限 */
export const MAX_TWO_SYLLABLE = 5

const isTwo = (q: Question) => questionItems(q)[0].syllables === 2

/**
 * Learn の 1 組（SPEC 6.2）：未学習の語のうち頻度の高い LEARN_WINDOW 語からランダムに、
 * 1 語の問題 + 仲間はずれ B_PER_SET 問、計 size 問。2 音節の問題は MAX_TWO_SYLLABLE 問まで
 * （3 音節以上が足りないときだけ超える）。pool は頻度の高い順に並んだ未学習の詞条。
 */
export function buildLearnSet(pool: Item[], size: number, rng: Rng = Math.random): Question[] {
  const window = shuffle(pool.slice(0, LEARN_WINDOW), rng)
  const used = new Set<string>()
  const take = (q: Question) => questionItems(q).forEach((it) => used.add(it.id))
  const free = (items: Item[]) => items.filter((it) => !used.has(it.id))
  const byFreq = (items: Item[]) => [...items].sort((a, b) => b.zipf - a.zipf)

  // 仲間はずれ：なるべく 3 音節以上で作る。範囲内で作れなければ 200 語まで広げる
  const odds: Question[] = []
  for (let i = 0; i < B_PER_SET; i++) {
    const near = byFreq(free(window))
    const q =
      buildOddOneOut(near.filter((it) => it.syllables >= 3), rng) ??
      buildOddOneOut(near, rng) ??
      buildOddOneOut(free(pool.slice(0, 200)), rng)
    if (!q) break
    odds.push(q)
    take(q)
  }

  // 1 語の問題：ランダムに。2 音節は上限まで、足りなければ上限を超えて埋める
  const singles: Question[] = []
  let two = odds.filter(isTwo).length
  const need = size - odds.length
  for (const it of free(window)) {
    if (singles.length >= need) break
    if (it.syllables === 2 && two >= MAX_TWO_SYLLABLE) continue
    const q = singleQuestion(it)
    singles.push(q)
    take(q)
    if (it.syllables === 2) two++
  }
  for (const it of [...free(window), ...free(pool)]) {
    if (singles.length >= need) break
    const q = singleQuestion(it)
    singles.push(q)
    take(q)
  }

  const set = [...singles]
  // B は前半と後半に 1 問ずつ（10 問なら 3〜5 問目と 7〜9 問目）。最初の問題は 1 語の問題にする
  odds.forEach((q, i) => {
    const segment = Math.floor((set.length + odds.length) / odds.length)
    const pos = i * segment + 2 + Math.floor(rng() * Math.max(segment - 2, 1))
    set.splice(Math.min(pos, set.length), 0, q)
  })
  return set.slice(0, size)
}
