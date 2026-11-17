import { useState } from 'react'
import type { AnswerRecord, Item } from '../types'
import { ruleLines, splitParts } from '../rules'

interface Props {
  items: Item[]
  onAnswer: (item: Item, correct: boolean) => void
  onFinish: (records: AnswerRecord[]) => void
  onQuit: () => void
}

export default function Quiz({ items, onAnswer, onFinish, onQuit }: Props) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [records, setRecords] = useState<AnswerRecord[]>([])

  const item = items[index]
  const answered = chosen !== null

  function choose(n: number) {
    if (answered) return
    const correct = n === item.stress
    setChosen(n)
    setRecords((r) => [...r, { item, chosen: n, correct }])
    onAnswer(item, correct)
  }

  function next() {
    if (index + 1 >= items.length) {
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
          {index + 1} / {items.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
        />
      </div>

      {/* 問題 */}
      <div className="flex flex-1 flex-col items-center justify-center py-8">
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
          {index + 1 >= items.length ? '結果を見る' : '次へ'}
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
