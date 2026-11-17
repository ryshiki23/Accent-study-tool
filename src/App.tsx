import { useEffect, useMemo, useState } from 'react'
import type { AnswerRecord, Item, ProgressRow } from './types'
import { dbConfigured, getState, onUnsavedChange, saveAnswer } from './db'
import { readUserId } from './userId'
import { studyToday } from './date'
import { dueRows, learnOutcome, reviewOutcome } from './srs'
import Home from './screens/Home'
import Quiz from './screens/Quiz'
import Result from './screens/Result'

const SET_SIZE = 10

type Mode = 'learn' | 'review'

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; mode: Mode; items: Item[] }
  | { name: 'result'; records: AnswerRecord[] }

type Load =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; items: Item[] }

const userId = readUserId()

export default function App() {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  // 進捗：起動時に get_state で 1 回読み、あとはメモリで管理（SPEC 8.4）
  const [progress, setProgress] = useState<Map<string, ProgressRow>>(new Map())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [unsaved, setUnsaved] = useState(false)

  useEffect(() => onUnsavedChange(setUnsaved), [])

  useEffect(() => {
    if (!userId) return
    if (!dbConfigured) {
      setLoad({ state: 'error', message: 'サーバーの設定がありません。' })
      return
    }
    Promise.all([
      fetch('/data/items.json').then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<Item[]>
      }),
      getState(userId),
    ])
      .then(([items, state]) => {
        setProgress(new Map(state.progress.map((p) => [p.item_id, p])))
        setLoad({ state: 'ready', items })
      })
      .catch(() => setLoad({ state: 'error', message: 'データを読み込めませんでした。' }))
  }, [])

  // Learn の出題候補：未学習、頻度の高い順。
  // S 類（名前動後）は品詞ラベル・例文つきの出題が必要なので第 4 步まで出さない。
  const learnPool = useMemo(() => {
    if (load.state !== 'ready') return []
    return load.items
      .filter((it) => it.class !== 'S' && !progress.has(it.id))
      .sort((a, b) => b.zipf - a.zipf)
  }, [load, progress])

  // 「今日」は描画のたびに計算（朝 4 時をまたいでも正しくなるように）
  const today = studyToday()

  // Review の出題候補：期限が来た learning、古い順（SPEC 6.3）
  const itemById = useMemo(
    () => (load.state === 'ready' ? new Map(load.items.map((it) => [it.id, it])) : new Map<string, Item>()),
    [load],
  )
  const reviewPool = useMemo(
    () => dueRows(progress.values(), today).map((r) => itemById.get(r.item_id)).filter((it): it is Item => !!it),
    [progress, today, itemById],
  )

  const counts = useMemo(() => {
    let mastered = 0
    let learning = 0
    for (const p of progress.values()) {
      if (p.status === 'mastered') mastered++
      else learning++
    }
    return { mastered, learning }
  }, [progress])

  if (!userId) {
    return (
      <Shell>
        <p className="mt-24 text-center text-lg font-bold">リンクが正しくありません</p>
        <p className="mt-2 text-center text-sm text-slate-500">送られてきたリンクをもう一度開いてください。</p>
      </Shell>
    )
  }
  if (load.state === 'error') {
    return (
      <Shell>
        <p className="mt-24 text-center">{load.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mx-auto mt-4 rounded-2xl bg-indigo-500 px-6 py-3 font-bold text-white"
        >
          再読み込み
        </button>
      </Shell>
    )
  }
  if (load.state === 'loading') {
    return <Shell><p className="mt-24 text-center text-slate-500">読み込み中…</p></Shell>
  }

  function start(mode: Mode) {
    const set = (mode === 'learn' ? learnPool : reviewPool).slice(0, SET_SIZE)
    if (set.length > 0) setScreen({ name: 'quiz', mode, items: set })
  }

  // 採点：Learn は SPEC 6.2、Review は SPEC 6.3（間隔は src/srs.ts）
  function handleAnswer(mode: Mode, item: Item, correct: boolean) {
    const prev = progress.get(item.id)
    const day = studyToday()
    const outcome =
      mode === 'review' && prev ? reviewOutcome(prev.stage, correct, day) : learnOutcome(correct, day)
    const row: ProgressRow = {
      item_id: item.id,
      ...outcome,
      correct_count: (prev?.correct_count ?? 0) + (correct ? 1 : 0),
      wrong_count: (prev?.wrong_count ?? 0) + (correct ? 0 : 1),
    }
    setProgress((m) => new Map(m).set(item.id, row))
    saveAnswer({
      p_user_id: userId!,
      p_item_id: row.item_id,
      p_status: row.status,
      p_stage: row.stage,
      p_due_date: row.due_date,
      p_correct: correct,
    })
  }

  return (
    <Shell>
      {unsaved && (
        <div className="fixed inset-x-0 top-0 z-10 mx-auto w-fit rounded-b-xl bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-700 shadow">
          未保存（自動で再送信中…）
        </div>
      )}
      {screen.name === 'home' && (
        <Home
          learnCount={learnPool.length}
          reviewCount={reviewPool.length}
          masteredCount={counts.mastered}
          learningCount={counts.learning}
          onLearn={() => start('learn')}
          onReview={() => start('review')}
        />
      )}
      {screen.name === 'quiz' && (
        <Quiz
          key={screen.items.map((i) => i.id).join(',')}
          items={screen.items}
          onAnswer={(item, correct) => handleAnswer(screen.mode, item, correct)}
          onFinish={(records) => setScreen({ name: 'result', records })}
          onQuit={() => setScreen({ name: 'home' })}
        />
      )}
      {screen.name === 'result' && (
        <Result records={screen.records} onHome={() => setScreen({ name: 'home' })} />
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pb-6">{children}</div>
}
