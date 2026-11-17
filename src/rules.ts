import type { Item } from './types'

/** 規則タグ → 一言説明（SPEC 5.4） */
const RULE_TEXT: Record<string, string> = {
  '-tion/-sion': '-tion / -sion の直前に強勢',
  '-ian/-cian': '-ian / -cian の直前に強勢',
  '-ic/-ical': '-ic / -ical の直前に強勢',
  '-ity/-ety': '-ity / -ety の直前に強勢',
  '-ial/-ual': '-ial / -ual の直前に強勢',
  '-ious/-eous/-uous': '-ious / -eous / -uous の直前に強勢',
  '-ient/-ience/-iency': '-ient / -ience / -iency の直前に強勢',
  '-iar/-ior': '-iar / -ior の直前に強勢',
  '-ular': '-ular の直前に強勢',
  '-ify': '-ify の直前に強勢',
  '-ish（動詞）': '-ish で終わる動詞は直前に強勢',
  '-graphy/-logy/-nomy/-metry': '-graphy / -logy / -nomy / -metry などの直前に強勢',
  '-meter': '-meter の直前に強勢',
  '-ate': '-ate の 2 つ前に強勢',
  '-ize/-ise': '-ize / -ise の 2 つ前に強勢',
  '-tude': '-tude の 2 つ前に強勢',
  '-graph/-crat': '-graph / -crat の 2 つ前に強勢',
  '語尾に強勢': 'この語尾（-ee, -eer, -ese, -oo, -ique など）自体に強勢',
  '名前動後': '名詞は前、動詞は後ろに強勢（名前動後）',
  '名動同形・不変': '名詞・動詞で強勢は変わらない',
  'カタカナ語': 'カタカナ語の発音につられやすい語',
  '2音節（名詞・形容詞）': '2 音節の名詞・形容詞は前に強勢が来やすい',
  '2音節（動詞）': '2 音節の動詞は後ろに強勢が来やすい',
}

/** 2 音節の傾向タグが予測する強勢位置 */
const TENDENCY: Record<string, number> = {
  '2音節（名詞・形容詞）': 1,
  '2音節（動詞）': 2,
}

/** 解説に出す一行。規則の例外は特別扱い */
export function ruleLines(item: Item): string[] {
  const isException = item.tags.includes('規則の例外')
  const lines: string[] = []
  for (const tag of item.tags) {
    if (tag === '規則の例外') continue
    // K 類は「名動同形・不変」が要点なので、2 音節の傾向は出さない
    if (item.class === 'K' && tag in TENDENCY) continue
    const text = RULE_TEXT[tag]
    if (!text) continue
    // 2 音節の「傾向」タグは、実際の強勢と逆なら例外と明記する
    const tendency = TENDENCY[tag]
    const against = tendency !== undefined && tendency !== item.stress
    lines.push(isException || against ? `${text} … ですが、この語は例外！` : text)
  }
  return lines
}

/** 強勢音節を大文字にした分割表記の各部分。split がなければ null */
export function splitParts(item: Item): { text: string; stressed: boolean }[] | null {
  if (!item.split) return null
  const parts = item.split.split('・')
  if (parts.length !== item.syllables) return null
  return parts.map((p, i) => ({
    text: i + 1 === item.stress ? p.toUpperCase() : p,
    stressed: i + 1 === item.stress,
  }))
}
