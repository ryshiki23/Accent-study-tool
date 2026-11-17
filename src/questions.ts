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

/**
 * Learn の 1 組（SPEC 6.2）：未学習の語を頻度順に、1 語の問題 + 仲間はずれ B_PER_SET 問、計 size 問。
 * pool は頻度の高い順に並んだ未学習の詞条。
 */
export function buildLearnSet(pool: Item[], size: number, rng: Rng = Math.random): Question[] {
  const singles = pool.slice(0, size - B_PER_SET).map(singleQuestion)
  const used = new Set(singles.map((q) => (q.kind === 'B' ? '' : q.item.id)))
  const odds: Question[] = []
  // 仲間はずれの候補：その後ろの語から（頻度順に 200 語まで見る）
  let rest = pool.filter((it) => !used.has(it.id)).slice(0, 200)
  for (let i = 0; i < B_PER_SET; i++) {
    const q = buildOddOneOut(rest, rng)
    if (!q) break
    odds.push(q)
    const ids = new Set(questionItems(q).map((it) => it.id))
    rest = rest.filter((it) => !ids.has(it.id))
  }
  // B が作れなかった分は 1 語の問題で埋める
  const fill = rest.slice(0, size - singles.length - odds.length).map(singleQuestion)
  const set = [...singles, ...fill]
  // B は前半と後半に 1 問ずつ（10 問なら 3〜5 問目と 7〜9 問目）。最初の問題は 1 語の問題にする
  odds.forEach((q, i) => {
    const segment = Math.floor((set.length + odds.length) / odds.length)
    const pos = i * segment + 2 + Math.floor(rng() * Math.max(segment - 2, 1))
    set.splice(Math.min(pos, set.length), 0, q)
  })
  return set.slice(0, size)
}
