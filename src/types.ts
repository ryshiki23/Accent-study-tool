export type ItemClass = 'N' | 'S' | 'K'

export interface Item {
  id: string
  word: string
  pos: string | null
  syllables: number
  stress: number
  split: string | null
  tags: string[]
  class: ItemClass
  sentence?: string
  zipf: number
}

export type Status = 'learning' | 'mastered'

/** 1 組の結果（結果画面用）。数えるのは各問題の 1 回目の解答だけ */
export interface SetSummary {
  total: number
  correct: number
  /** 1 回目に間違えた詞条。chosen は A / C で選んだ位置 */
  wrong: { item: Item; chosen?: number }[]
}

/** progress テーブルの 1 行（SPEC 8.2）。行がない詞条は new */
export interface ProgressRow {
  item_id: string
  status: Status
  stage: number
  due_date: string | null
  correct_count: number
  wrong_count: number
}
