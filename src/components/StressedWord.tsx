import type { Item } from '../types'
import { POS_LABEL } from '../questions'
import { splitParts } from '../rules'

/** 強勢位置つきの語（re・CORD 第 2 音節）。強勢の音節は大文字・primary・太字 */
export default function StressedWord({ item, size = 'lg', className = '' }: { item: Item; size?: 'lg' | 'sm'; className?: string }) {
  const parts = splitParts(item)
  return (
    <span className={`${size === 'lg' ? 'text-2xl' : 'text-xl'} ${className}`}>
      {parts ? (
        parts.map((p, i) => (
          <span key={i}>
            {i > 0 && <span className="text-dot">・</span>}
            <span className={p.stressed ? 'font-black text-primary' : 'font-medium text-sub'}>{p.text}</span>
          </span>
        ))
      ) : (
        <span className="font-bold text-ink">{item.word}</span>
      )}
      {item.class === 'S' && item.pos && <span className="ml-1 text-sm font-bold text-sub">（{POS_LABEL[item.pos] ?? item.pos}）</span>}
      <span className="ml-2 text-sm font-bold text-sub">第 {item.stress} 音節</span>
    </span>
  )
}
