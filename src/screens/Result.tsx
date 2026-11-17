import type { AnswerRecord } from '../types'

interface Props {
  records: AnswerRecord[]
  onHome: () => void
}

export default function Result({ records, onHome }: Props) {
  const correct = records.filter((r) => r.correct).length
  const wrong = records.filter((r) => !r.correct)
  return (
    <div className="flex flex-1 flex-col pt-12">
      <p className="text-center text-slate-500">おつかれさま！</p>
      <p className="mt-2 text-center text-6xl font-bold">
        {correct}
        <span className="text-2xl text-slate-400"> / {records.length}</span>
      </p>

      {wrong.length > 0 ? (
        <div className="mt-8 rounded-2xl bg-white/90 p-4 shadow-sm">
          <p className="font-bold text-rose-500">間違えた単語</p>
          <ul className="mt-2 divide-y divide-slate-100">
            {wrong.map((r) => (
              <li key={r.item.id} className="flex items-center justify-between py-2">
                <span className="text-lg font-semibold">{r.item.word}</span>
                <span className="text-sm text-slate-500">
                  正解 第 {r.item.stress} 音節（あなた：{r.chosen}）
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
