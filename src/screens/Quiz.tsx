import { useState } from 'react'
import type { Item, SetSummary } from '../types'
import { labelWithPos, POS_LABEL, questionItems, singleQuestion, type Question } from '../questions'
import { ruleLines } from '../rules'
import StressedWord from '../components/StressedWord'
import Sentence from '../components/Sentence'
import Avatar, { type Mood } from '../components/Avatar'
import { ReportButton, SpeakButton } from '../components/QuizTools'

interface Props {
  questions: Question[]
  /** S 類の別品詞の詞条（解説用） */
  sibling: (item: Item) => Item | undefined
  /** countAnswer：今日の解答数に数えるか（1 問で 1 回だけ true） */
  onAnswer: (item: Item, correct: boolean, countAnswer: boolean) => void
  onFinish: (summary: SetSummary) => void
  onQuit: () => void
  /** 「この問題を報告」 */
  onReport: (id: string) => Promise<boolean>
  level: number
}

/** 何問続けて正解したらお祝いするか（1 組に 1 回だけ） */
const STREAK = 5

interface Entry {
  q: Question
  /** 元の何問目から来たか */
  origin: number
  retry: boolean
}

/**
 * 1 組の出題。間違えた語は最後にもう一度（1 語の問題で）出し、正解するまで繰り返す（SPEC 6.3.1）。
 * 進捗の記録（onAnswer）と結果画面の集計は、各問題の 1 回目の解答だけ。
 */
export default function Quiz({ questions, sibling, onAnswer, onFinish, onQuit, onReport, level }: Props) {
  const [queue, setQueue] = useState<Entry[]>(questions.map((q, i) => ({ q, origin: i, retry: false })))
  const [index, setIndex] = useState(0)
  /** A / C は選んだ位置、B は選んだ詞条の id */
  const [chosen, setChosen] = useState<number | string | null>(null)
  /** 元の問題ごとに、まだ正解していない出題の数 */
  const [outstanding, setOutstanding] = useState<number[]>(questions.map(() => 1))
  const [summary, setSummary] = useState<SetSummary>({ total: questions.length, correct: 0, wrong: [] })
  const [streak, setStreak] = useState(0)
  const [celebrated, setCelebrated] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  /** 正解のたびに増やして形象をジャンプさせる */
  const [hop, setHop] = useState(0)

  const entry = queue[index]
  const { q } = entry
  const answered = chosen !== null
  const cleared = outstanding.filter((n) => n === 0).length

  function choose(value: number | string) {
    if (answered) return
    setChosen(value)
    /** 1 回目に間違えた詞条（結果画面用） */
    const missed: Item[] = []
    /** 最後に出し直す問題 */
    const retries: Question[] = []
    let correct: boolean

    if (q.kind === 'B') {
      correct = value === q.answer
      const answerItem = q.items.find((i) => i.id === q.answer)!
      const chosenItem = q.items.find((i) => i.id === value)!
      if (!entry.retry) {
        // 正解 → 4 語とも習得。不正解 → 選んだ語と正解の語を間違いとして記録（SPEC 第 3 節）
        const recorded = correct ? q.items : [chosenItem, answerItem]
        recorded.forEach((it, i) => onAnswer(it, correct, i === 0))
      }
      if (!correct) {
        missed.push(chosenItem, answerItem)
        // 1 回目の間違い：2 語を 1 語ずつ出してから、元の問題をもう一度（選択肢は並べ替え）
        // 元の問題の出し直しでまた間違えたら、元の問題だけをもう一度
        if (!entry.retry) retries.push(singleQuestion(chosenItem), singleQuestion(answerItem))
        retries.push(reshuffle(q))
      }
    } else {
      correct = value === q.item.stress
      if (!entry.retry) onAnswer(q.item, correct, true)
      if (!correct) {
        missed.push(q.item)
        retries.push(q)
      }
    }

    if (correct) {
      setHop((h) => h + 1)
      const nextStreak = streak + 1
      setStreak(nextStreak)
      if (nextStreak >= STREAK && !celebrated) {
        setCelebrated(true)
        setCelebrating(true)
        setTimeout(() => setCelebrating(false), 1800)
      }
    } else {
      setStreak(0)
    }

    if (!entry.retry) {
      setSummary((s) => ({
        ...s,
        correct: s.correct + (correct ? 1 : 0),
        wrong: correct
          ? s.wrong
          : [...s.wrong, ...missed.map((item) => ({ item, chosen: typeof value === 'number' ? value : undefined }))],
      }))
    }
    setOutstanding((o) => o.map((n, i) => (i === entry.origin ? n - 1 + retries.length : n)))
    if (retries.length > 0) {
      setQueue((qq) => [...qq, ...retries.map((rq) => ({ q: rq, origin: entry.origin, retry: true }))])
    }
  }

  function next() {
    if (index + 1 >= queue.length) {
      onFinish(summary)
    } else {
      setIndex(index + 1)
      setChosen(null)
    }
  }

  const mood: Mood = !answered ? 'normal' : isCorrect(q, chosen) ? 'happy' : 'sad'

  return (
    <div className="flex flex-1 flex-col pt-4">
      {celebrating && (
        <div className="pointer-events-none fixed inset-x-0 top-1/3 z-20 flex justify-center">
          <div className="animate-pop rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
            <p className="text-4xl">🎉</p>
            <p className="mt-1 text-lg font-bold text-indigo-600">{STREAK} 問連続正解！</p>
          </div>
        </div>
      )}
      {/* 上部：進捗と終了 */}
      <div className="flex items-center justify-between">
        <button onClick={onQuit} className="rounded-full px-3 py-2 text-slate-500 active:bg-white/60" aria-label="やめる">
          ✕ やめる
        </button>
        <Avatar level={level} mood={mood} size={40} bounceKey={mood === 'happy' ? hop : undefined} />
        <span className="text-sm font-semibold text-slate-500">
          ✓ {cleared} / {questions.length}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all"
          style={{ width: `${(cleared / questions.length) * 100}%` }}
        />
      </div>

      {/* 問題 */}
      <div className="flex flex-1 flex-col items-center justify-center py-6">
        {entry.retry && (
          <span className="mb-2 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">もう一度</span>
        )}
        {q.kind === 'A' && (
          <>
            <p className="text-sm text-slate-500">第一強勢はどこ？</p>
            <p className="mt-3 break-all text-center text-5xl font-bold tracking-wide">{labelWithPos(q.item)}</p>
            <p className="mt-3 text-sm text-slate-400">{q.item.syllables} 音節</p>
          </>
        )}
        {q.kind === 'C' && (
          <>
            <p className="text-sm text-slate-500">下線の語の第一強勢はどこ？</p>
            <p className="mt-4 text-center text-3xl font-semibold leading-relaxed">
              <Sentence item={q.item} />
            </p>
            <p className="mt-3 text-sm text-slate-400">{q.item.syllables} 音節</p>
          </>
        )}
        {q.kind === 'B' && (
          <p className="text-center text-base font-semibold text-slate-600">
            第一強勢の位置が
            <br />
            ほかと違うのはどれ？
          </p>
        )}
      </div>

      {/* 解説（解答後） */}
      {answered &&
        (q.kind === 'B' ? (
          <OddExplanation q={q} correct={chosen === q.answer} onReport={onReport} />
        ) : (
          <Explanation item={q.item} correct={chosen === q.item.stress} sibling={sibling(q.item)} onReport={onReport} />
        ))}

      {/* 選択肢 */}
      {q.kind === 'B' ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {q.items.map((it) => {
            let cls = 'bg-white text-slate-800 shadow-md'
            if (answered) {
              if (it.id === q.answer) cls = 'bg-emerald-500 text-white shadow-md'
              else if (it.id === chosen) cls = 'bg-rose-500 text-white shadow-md'
              else cls = 'bg-white/60 text-slate-400'
            }
            return (
              <button
                key={it.id}
                onClick={() => choose(it.id)}
                aria-disabled={answered}
                className={`min-h-16 rounded-2xl px-2 py-3 text-lg font-bold break-all transition active:scale-95 ${cls}`}
              >
                {labelWithPos(it)}
                {answered && <span className="block text-xs font-medium opacity-80">第 {it.stress} 音節</span>}
              </button>
            )
          })}
        </div>
      ) : (
        <div
          className="mt-4 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.min(q.item.syllables, 4)}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: q.item.syllables }, (_, i) => i + 1).map((n) => {
            let cls = 'bg-white text-slate-800 shadow-md'
            if (answered) {
              if (n === q.item.stress) cls = 'bg-emerald-500 text-white shadow-md'
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
      )}

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

/** 仲間はずれの選択肢の並びを変える（位置で覚えないように） */
function reshuffle(q: Extract<Question, { kind: 'B' }>): Question {
  const items = [...q.items]
  for (let k = 0; k < 10; k++) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    if (items.some((it, i) => it.id !== q.items[i].id)) break
  }
  return { ...q, items }
}

function Verdict({ correct }: { correct: boolean }) {
  return (
    <p className={`text-lg font-bold ${correct ? 'text-emerald-600' : 'text-rose-500'}`}>
      {correct ? '○ 正解！' : '× ざんねん'}
    </p>
  )
}

function isCorrect(q: Question, chosen: number | string | null) {
  return q.kind === 'B' ? chosen === q.answer : chosen === q.item.stress
}

interface ExplanationProps {
  correct: boolean
  onReport: (id: string) => Promise<boolean>
}

function Explanation({ item, correct, sibling, onReport }: ExplanationProps & { item: Item; sibling?: Item }) {
  const rules = ruleLines(item)
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <Verdict correct={correct} />
        <SpeakButton item={item} />
      </div>
      <p className="mt-2 text-2xl">
        <StressedWord item={item} />
      </p>
      {sibling && sibling.pos && (
        <p className="mt-1 text-sm text-slate-500">
          → {POS_LABEL[sibling.pos] ?? sibling.pos}なら第 {sibling.stress} 音節
        </p>
      )}
      {rules.map((r) => (
        <p key={r} className="mt-2 text-sm text-slate-600">💡 {r}</p>
      ))}
      <div className="mt-3 text-right">
        <ReportButton key={item.id} onReport={() => onReport(item.id)} />
      </div>
    </div>
  )
}

function OddExplanation({ q, correct, onReport }: ExplanationProps & { q: Extract<Question, { kind: 'B' }> }) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
      <Verdict correct={correct} />
      <ul className="mt-2 space-y-1">
        {questionItems(q).map((it) => (
          <li
            key={it.id}
            className={`flex items-center justify-between gap-2 text-xl ${it.id === q.answer ? '-mx-2 rounded-lg bg-emerald-50 px-2' : ''}`}
          >
            <StressedWord item={it} />
            <SpeakButton item={it} small />
          </li>
        ))}
      </ul>
      <div className="mt-3 text-right">
        <ReportButton key={q.answer} onReport={() => onReport('B:' + q.items.map((i) => i.id).join(','))} />
      </div>
    </div>
  )
}
