import { useState } from 'react'
import type { AnswerRecord, Item } from '../types'
import { ruleLines, splitParts } from '../rules'

interface Props {
  items: Item[]
  onAnswer: (item: Item, correct: boolean) => void
  onFinish: (records: AnswerRecord[]) => void
  onQuit: () => void
}

/**
 * 1 組の出題。間違えた語は最後にもう一度出し、正解するまで繰り返す（SPEC 6.3.1）。
 * 進捗の記録（onAnswer）と結果画面の記録は、各語の 1 回目の解答だけ。
 */
export default function Quiz({ items, onAnswer, onFinish, onQuit }: Props) {
  const [queue, setQueue] = useState<Item[]>(items)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [cleared, setCleared] = useState(0)

  const item = queue[index]
  const answered = chosen !== null
  // 元の出題（items）より後ろにあるのは、間違えた語の出し直し
  const isRetry = index >= items.length

  function choose(n: number) {
    if (answered) return
    const correct = n === item.stress
    setChosen(n)
    if (!isRetry) {
      setRecords((r) => [...r, { item, chosen: n, correct }])
      onAnswer(item, correct)
    }
    if (correct) setCleared((c) => c + 1)
    else setQueue((q) => [...q, item])
  }

  function next() {
    if (index + 1 >= queue.length) {
      onFinish(records)
    } else {
      setIndex(index + 1)
      setChosen(null)
    }
  }

  const options = Array.from({ length: item.syllables }, (_, i) => i + 1)

  return (
    <div className="flex flex-1 flex-col pt-4">
      {/* 上部：進捗と終了 */}
      <div className="flex items-center justify-between">
        <button onClick={onQuit} className="rounded-full px-3 py-2 text-slate-500 active:bg-white/60" aria-label="やめる">
          ✕ やめる
        </button>
        <span className="text-sm font-semibold text-slate-500">
          ✓ {cleared} / {items.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all"
          style={{ width: `${(cleared / items.length) * 100}%` }}
        />
      </div>

      {/* 問題 */}
      <div className="flex flex-1 flex-col items-center justify-center py-8">
        {isRetry && (
          <span className="mb-2 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">もう一度</span>
        )}
        <p className="text-sm text-slate-500">第一強勢はどこ？</p>
        <p className="mt-3 break-all text-center text-5xl font-bold tracking-wide">{item.word}</p>
        <p className="mt-3 text-sm text-slate-400">{item.syllables} 音節</p>
      </div>

      {/* 解説（解答後） */}
      {answered && <Explanation item={item} correct={chosen === item.stress} />}

      {/* 選択肢 */}
      <div className="mt-4 grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
        {options.map((n) => {
          let cls = 'bg-white text-slate-800 shadow-md'
          if (answered) {
            if (n === item.stress) cls = 'bg-emerald-500 text-white shadow-md'
            else if (n === chosen) cls = 'bg-rose-500 text-white shadow-md'
            else cls = 'bg-white/50 text-slate-300'
          }
          return (
            <button
              key={n}
              onClick={() => choose(n)}
              aria-disabled={answered}
              className={`h-16 rounded-2xl text-2xl font-bold transition active:scale-95 ${cls}`}
            >
              {n}
            </button>
          )
        })}
      </div>

      {answered && (
        <button
          onClick={next}
          className="mt-4 h-14 rounded-2xl bg-indigo-500 text-lg font-bold text-white shadow-lg active:scale-[0.98]"
        >
          {index + 1 >= queue.length ? '結果を見る' : '次へ'}
        </button>
      )}
    </div>
  )
}

function Explanation({ item, correct }: { item: Item; correct: boolean }) {
  const parts = splitParts(item)
  const rules = ruleLines(item)
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
      <p className={`text-lg font-bold ${correct ? 'text-emerald-600' : 'text-rose-500'}`}>
        {correct ? '○ 正解！' : '× ざんねん'}
      </p>
      <p className="mt-2 text-2xl">
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
        <span className="ml-2 text-base text-slate-500">第 {item.stress} 音節</span>
      </p>
      {rules.map((r) => (
        <p key={r} className="mt-2 text-sm text-slate-600">💡 {r}</p>
      ))}
    </div>
  )
}
