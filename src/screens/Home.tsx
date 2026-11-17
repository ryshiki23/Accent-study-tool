interface Props {
  learnCount: number
  masteredCount: number
  learningCount: number
  onLearn: () => void
}

function todayLabel() {
  const d = new Date()
  const w = '日月火水木金土'[d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`
}

export default function Home({ learnCount, masteredCount, learningCount, onLearn }: Props) {
  return (
    <div className="flex flex-1 flex-col pt-8">
      <p className="text-sm font-medium text-slate-500">{todayLabel()}</p>
      <h1 className="mt-1 text-2xl font-bold">アクセント練習</h1>

      <div className="mt-8 flex flex-col gap-4">
        <button
          onClick={onLearn}
          disabled={learnCount === 0}
          className="rounded-3xl bg-white/90 p-6 text-left shadow-lg shadow-indigo-100 transition active:scale-[0.98] disabled:opacity-50"
        >
          <p className="text-sm font-semibold tracking-wide text-indigo-500">Learn</p>
          <p className="mt-1 text-xl font-bold">新しい単語</p>
          <p className="mt-3 text-sm text-slate-500">
            残り <span className="text-2xl font-bold text-slate-800">{learnCount}</span> 語
          </p>
        </button>

        <div className="rounded-3xl bg-white/50 p-6 text-left text-slate-400">
          <p className="text-sm font-semibold tracking-wide">Review</p>
          <p className="mt-1 text-xl font-bold">復習</p>
          <p className="mt-3 text-sm">準備中</p>
        </div>
      </div>

      <div className="mt-6 flex justify-around rounded-2xl bg-white/60 py-3 text-center text-sm">
        <div>
          <p className="text-xl font-bold text-emerald-600">{masteredCount}</p>
          <p className="text-slate-500">覚えた</p>
        </div>
        <div>
          <p className="text-xl font-bold text-rose-500">{learningCount}</p>
          <p className="text-slate-500">間違えた</p>
        </div>
      </div>
    </div>
  )
}
