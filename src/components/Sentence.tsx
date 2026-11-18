import type { Item } from '../types'

/** 例文。対象の語に下線 */
export default function Sentence({ item }: { item: Item }) {
  const sentence = item.sentence ?? item.word
  const m = new RegExp(`\\b${item.word}\\b`, 'i').exec(sentence)
  if (!m) return <span className="underline decoration-primary decoration-[3px] underline-offset-[6px]">{item.word}</span>
  return (
    <>
      {sentence.slice(0, m.index)}
      <span className="font-bold underline decoration-primary decoration-[3px] underline-offset-[6px]">{m[0]}</span>
      {sentence.slice(m.index + m[0].length)}
    </>
  )
}
