import { capCount } from '../srs'
import { levelOf } from '../level'
import Avatar, { type Mood } from '../components/Avatar'

interface Props {
  learnCount: number
  reviewCount: number
  masteredCount: number
  /** 進捗の行が 1 つもない（はじめて） */
  isNew: boolean
  answeredToday: number
  onLearn: () => void
  onReview: () => void
}

function todayLabel() {
  const d = new Date()
  const w = '日月火水木金土'[d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`
}

/** 形象のひとこと（SPEC 7.6） */
function greeting({ isNew, reviewCount, answeredToday }: Pick<Props, 'isNew' | 'reviewCount' | 'answeredToday'>): {
  text: string
  mood: Mood
} {
  if (isNew) return { text: 'はじめまして！まずは Learn からやってみよう', mood: 'happy' }
  if (reviewCount > 0) return { text: `復習が ${capCount(reviewCount)} 個たまってるよ`, mood: 'normal' }
  if (answeredToday > 0) return { text: `今日の復習は完了！ ${answeredToday} 問がんばったね`, mood: 'happy' }
  return { text: '今日の復習は完了！ zzz…', mood: 'sleep' }
}

export default function Home(props: Props) {
  const { learnCount, reviewCount, masteredCount, onLearn, onReview } = props
  const lv = levelOf(masteredCount)
  const { text, mood } = greeting(props)
  return (
    <div className="flex flex-1 flex-col pt-8">
      <p className="text-sm font-medium text-slate-500">{todayLabel()}</p>
      <h1 className="mt-1 text-2xl font-bold">アクセント練習</h1>

      {/* 形象・レベル・ひとこと */}
      <div className="mt-5 flex items-center gap-4">
        <Avatar level={lv.level} mood={mood} size={88} />
        <div className="min-w-0 flex-1">
          <div className="relative rounded-2xl bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
            {text}
            <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white/90" />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-indigo-600">Lv{lv.level}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/80">
              <div className="h-full rounded-full bg-indigo-400" style={{ width: `${lv.progress * 100}%` }} />
            </div>
            <span>{lv.toNext === null ? '最高レベル！' : `あと ${lv.toNext} 語`}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
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

        {reviewCount > 0 ? (
          <button
            onClick={onReview}
            className="rounded-3xl bg-white/90 p-6 text-left shadow-lg shadow-rose-100 transition active:scale-[0.98]"
          >
            <p className="text-sm font-semibold tracking-wide text-rose-500">Review</p>
            <p className="mt-1 text-xl font-bold">復習</p>
            <p className="mt-3 text-sm text-slate-500">
              今日 <span className="text-2xl font-bold text-slate-800">{capCount(reviewCount)}</span> 語
            </p>
          </button>
        ) : (
          <div className="rounded-3xl bg-white/50 p-6 text-left text-slate-400">
            <p className="text-sm font-semibold tracking-wide">Review</p>
            <p className="mt-1 text-xl font-bold">復習</p>
            <p className="mt-3 text-sm">今日の復習は完了</p>
          </div>
        )}
      </div>
    </div>
  )
}
