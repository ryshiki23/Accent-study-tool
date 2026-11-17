import type { SetSummary } from '../types'
import { labelWithPos } from '../questions'

interface Props {
  summary: SetSummary
  onHome: () => void
}

export default function Result({ summary, onHome }: Props) {
  const { total, correct, wrong } = summary
  return (
    <div className="flex flex-1 flex-col pt-12">
      <p className="text-center text-slate-500">おつかれさま！</p>
      <p className="mt-2 text-center text-6xl font-bold">
        {correct}
        <span className="text-2xl text-slate-400"> / {total}</span>
      </p>

      {wrong.length > 0 ? (
        <div className="mt-8 rounded-2xl bg-white/90 p-4 shadow-sm">
          <p className="font-bold text-rose-500">間違えた単語</p>
          <ul className="mt-2 divide-y divide-slate-100">
            {wrong.map((r) => (
              <li key={r.item.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-lg font-semibold">{labelWithPos(r.item)}</span>
                <span className="shrink-0 text-sm text-slate-500">
                  第 {r.item.stress} 音節{r.chosen !== undefined && `（あなた：${r.chosen}）`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-center text-lg font-bold text-emerald-600">全問正解！🎉</p>
      )}

      <button
        onClick={onHome}
        className="mt-auto h-14 rounded-2xl bg-indigo-500 text-lg font-bold text-white shadow-lg active:scale-[0.98]"
      >
        ホームへ
      </button>
    </div>
  )
}
