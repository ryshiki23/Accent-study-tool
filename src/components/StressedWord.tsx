import type { Item } from '../types'
import { POS_LABEL } from '../questions'
import { splitParts } from '../rules'

/** 強勢位置つきの語（re・CORD 第 2 音節） */
export default function StressedWord({ item, className = '' }: { item: Item; className?: string }) {
  const parts = splitParts(item)
  return (
    <span className={className}>
      {parts ? (
        parts.map((p, i) => (
          <span key={i}>
            {i > 0 && <span className="text-slate-300">・</span>}
            <span className={p.stressed ? 'font-extrabold text-indigo-600' : 'text-slate-600'}>{p.text}</span>
          </span>
        ))
      ) : (
        <span className="text-slate-700">{item.word}</span>
      )}
      {item.class === 'S' && item.pos && (
        <span className="ml-1 text-base text-slate-500">（{POS_LABEL[item.pos] ?? item.pos}）</span>
      )}
      <span className="ml-2 text-base text-slate-500">第 {item.stress} 音節</span>
    </span>
  )
}
