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

/** 1 問の解答結果 */
export interface AnswerRecord {
  item: Item
  chosen: number
  correct: boolean
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
