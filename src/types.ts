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
