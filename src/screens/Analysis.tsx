import { useState } from 'react'
import { MIN_ANSWERS, type TagStat } from '../stats'

interface Props {
  stats: TagStat[]
  weakest: Set<string>
  totals: { mastered: number; learning: number; fresh: number }
  days: { day: string; answered: number }[]
}

/** 分析（SPEC 7.5） */
export default function Analysis({ stats, weakest, totals, days }: Props) {
  return (
    <div className="pt-8">
      <h1 className="text-2xl font-bold">分析</h1>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Tile label="覚えた" value={totals.mastered} />
        <Tile label="復習中" value={totals.learning} />
        <Tile label="未学習" value={totals.fresh} />
      </div>

      <Section title="最近 14 日の解答数">
        <DayChart days={days} />
      </Section>

      <Section title="規則ごとの正答率">
        {stats.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">まだデータがありません。</p>
        ) : (
          <ul className="space-y-3">
            {stats.map((s) => {
              const weak = weakest.has(s.tag)
              const few = s.total < MIN_ANSWERS
              const pct = Math.round(s.rate * 100)
              return (
                <li key={s.tag} className={weak ? '-mx-2 rounded-xl bg-rose-50 px-2 py-1.5' : ''}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      {weak && <span className="mr-1 text-xs font-bold text-rose-600">⚠ 苦手</span>}
                      {s.tag}
                    </span>
                    <span className="text-slate-500">
                      <span className="font-bold text-slate-800">{pct}%</span>
                      <span className="ml-1 text-xs">（{s.correct}/{s.total}）</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${weak ? 'bg-rose-400' : few ? 'bg-slate-300' : 'bg-indigo-400'}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-400">※ 解答数が {MIN_ANSWERS} 回未満の規則は灰色（まだ判断できません）</p>
      </Section>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/90 py-3 shadow-sm">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl bg-white/90 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-600">{title}</h2>
      {children}
    </section>
  )
}

/** 14 日分の棒グラフ。棒をタップするとその日の数を表示 */
function DayChart({ days }: { days: { day: string; answered: number }[] }) {
  const [picked, setPicked] = useState(days.length - 1)
  const max = Math.max(...days.map((d) => d.answered), 1)
  const total = days.reduce((a, d) => a + d.answered, 0)
  const md = (day: string) => {
    const [, m, d] = day.split('-').map(Number)
    return `${m}/${d}`
  }
  const p = days[picked]
  return (
    <div>
      <p className="text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{picked === days.length - 1 ? '今日' : md(p.day)}</span>
        <span className="ml-2 text-xl font-bold text-slate-800">{p.answered}</span> 問
        <span className="ml-3 text-xs">14 日合計 {total} 問</span>
      </p>
      <div className="mt-3 flex h-28 items-end gap-0.5 border-b border-slate-200" role="img" aria-label="最近 14 日の解答数">
        {days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setPicked(i)}
            className="flex h-full flex-1 items-end justify-center"
            aria-label={`${md(d.day)} ${d.answered} 問`}
          >
            <span
              className={`block w-3/5 rounded-t ${i === picked ? 'bg-indigo-500' : 'bg-indigo-300'}`}
              style={{ height: d.answered ? `${Math.max((d.answered / max) * 100, 4)}%` : '0' }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{md(days[0].day)}</span>
        <span>今日</span>
      </div>
    </div>
  )
}
