import { useEffect, useMemo, useState } from 'react'
import type { Item, ProgressRow, SetSummary } from './types'
import { buildLearnSet, singleQuestion, type Question } from './questions'
import { dbConfigured, getState, onUnsavedChange, reportItem, saveAnswer } from './db'
import { levelOf } from './level'
import { useTimeOfDay } from './theme'
import { readUserId } from './userId'
import { studyToday } from './date'
import { dueRows, learnOutcome, reviewOutcome } from './srs'
import Home from './screens/Home'
import Quiz from './screens/Quiz'
import Result from './screens/Result'
import Notebook from './screens/Notebook'
import Analysis from './screens/Analysis'
import SentenceCheck from './screens/SentenceCheck'
import NavBar, { type Tab } from './components/NavBar'
import { lastDays, tagStats, weakestTags } from './stats'

const SET_SIZE = 10

type Mode = 'learn' | 'review'

type Screen =
  | { name: Tab }
  | { name: 'quiz'; mode: Mode; questions: Question[]; key: number; levelBefore: number }
  | { name: 'result'; summary: SetSummary; levelUp: number | null }

type Load =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; items: Item[] }

const userId = readUserId()
/** 開発用：/?check=sentences で例文の読み上げチェック画面（ID 不要） */
const checkMode = new URLSearchParams(window.location.search).get('check') === 'sentences'

export default function App() {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  // 進捗：起動時に get_state で 1 回読み、あとはメモリで管理（SPEC 8.4）
  const [progress, setProgress] = useState<Map<string, ProgressRow>>(new Map())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [unsaved, setUnsaved] = useState(false)
  // 時間帯（朝・昼・夕）。配色とホームの海辺が切り替わる
  const time = useTimeOfDay()
  // 日ごとの解答数（分析画面の棒グラフ用）
  const [studyDays, setStudyDays] = useState<Map<string, number>>(new Map())

  useEffect(() => onUnsavedChange(setUnsaved), [])

  // 例文チェック画面：題庫だけ読む
  useEffect(() => {
    if (!checkMode) return
    fetch('/data/items.json')
      .then((r) => r.json() as Promise<Item[]>)
      .then((items) => setLoad({ state: 'ready', items }))
      .catch(() => setLoad({ state: 'error', message: '問題データを読み込めませんでした。' }))
  }, [])

  useEffect(() => {
    if (checkMode || !userId) return
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
        setStudyDays(new Map(state.study_days.map((d) => [d.day, d.answered])))
        setLoad({ state: 'ready', items })
      })
      .catch(() => setLoad({ state: 'error', message: 'データを読み込めませんでした。' }))
  }, [])

  // Learn の出題候補：未学習、頻度の高い順（SPEC 6.2）
  const learnPool = useMemo(() => {
    if (load.state !== 'ready') return []
    return load.items
      .filter((it) => !progress.has(it.id))
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

  // S 類：同じ語の別品詞の詞条（解説で「動詞なら第 2 音節」と出す）
  const siblings = useMemo(() => {
    const m = new Map<string, Item>()
    if (load.state !== 'ready') return m
    const byWord = new Map<string, Item[]>()
    for (const it of load.items) if (it.class === 'S') byWord.set(it.word, [...(byWord.get(it.word) ?? []), it])
    for (const group of byWord.values()) for (const it of group) {
      const other = group.find((g) => g.id !== it.id)
      if (other) m.set(it.id, other)
    }
    return m
  }, [load])
  const siblingOf = (item: Item) => siblings.get(item.id)

  const counts = useMemo(() => {
    let mastered = 0
    let learning = 0
    for (const p of progress.values()) {
      if (p.status === 'mastered') mastered++
      else learning++
    }
    return { mastered, learning }
  }, [progress])

  if (checkMode) {
    return <Shell>{load.state === 'ready' ? <SentenceCheck items={load.items} /> : <p className="mt-24 text-center text-sub">読み込み中…</p>}</Shell>
  }
  if (!userId) {
    return (
      <Shell>
        <p className="mt-24 text-center text-lg font-bold">リンクが正しくありません</p>
        <p className="mt-2 text-center text-sm text-sub">送られてきたリンクをもう一度開いてください。</p>
      </Shell>
    )
  }
  if (load.state === 'error') {
    return (
      <Shell>
        <p className="mt-24 text-center">{load.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mx-auto mt-4 rounded-lg border-[3px] border-ink bg-primary px-6 py-3 font-bold text-white shadow-[0_4px_0_var(--ink)]"
        >
          再読み込み
        </button>
      </Shell>
    )
  }
  if (load.state === 'loading') {
    return <Shell><p className="mt-24 text-center text-sub">読み込み中…</p></Shell>
  }

  function start(mode: Mode) {
    // Learn：1 語の問題 + 仲間はずれ。Review：1 語の問題だけ（S 類は例文）
    const questions =
      mode === 'learn' ? buildLearnSet(learnPool, SET_SIZE) : reviewPool.slice(0, SET_SIZE).map(singleQuestion)
    if (questions.length > 0)
      setScreen({ name: 'quiz', mode, questions, key: Date.now(), levelBefore: levelOf(counts.mastered).level })
  }

  // 採点：Learn は SPEC 6.2、Review は SPEC 6.3（間隔は src/srs.ts）
  function handleAnswer(mode: Mode, item: Item, correct: boolean, countAnswer: boolean) {
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
    if (countAnswer) setStudyDays((m) => new Map(m).set(day, (m.get(day) ?? 0) + 1))
    saveAnswer({
      p_user_id: userId!,
      p_item_id: row.item_id,
      p_status: row.status,
      p_stage: row.stage,
      p_due_date: row.due_date,
      p_correct: correct,
      p_count_answer: countAnswer,
    })
  }

  const isTab = screen.name === 'home' || screen.name === 'notebook' || screen.name === 'analysis'
  const notebookRows = [...progress.values()]
    .filter((r) => r.status === 'learning')
    .map((row) => ({ row, item: itemById.get(row.item_id) }))
    .filter((r): r is { row: ProgressRow; item: Item } => !!r.item)
  const stats = tagStats(load.items, progress)

  return (
    <>
      {unsaved && (
        <div className="fixed inset-x-0 top-[env(safe-area-inset-top)] z-30 mx-auto w-fit rounded-b-lg border-2 border-t-0 border-ink bg-accent px-4 py-1 text-xs font-bold text-ink">
          未保存（自動で再送信中…）
        </div>
      )}
      {screen.name === 'home' ? (
        <Home
          time={time}
          learnCount={learnPool.length}
          reviewCount={reviewPool.length}
          masteredCount={counts.mastered}
          isNew={progress.size === 0}
          answeredToday={studyDays.get(today) ?? 0}
          onLearn={() => start('learn')}
          onReview={() => start('review')}
        />
      ) : (
        <Shell padBottom={isTab}>
      {screen.name === 'quiz' && (
        <Quiz
          key={screen.key}
          questions={screen.questions}
          sibling={siblingOf}
          onAnswer={(item, correct, countAnswer) => handleAnswer(screen.mode, item, correct, countAnswer)}
          onFinish={(summary) => {
            const after = levelOf(counts.mastered).level
            setScreen({ name: 'result', summary, levelUp: after > screen.levelBefore ? after : null })
          }}
          onReport={(id) => reportItem(userId!, id)}
          level={levelOf(counts.mastered).level}
          onQuit={() => setScreen({ name: 'home' })}
        />
      )}
      {screen.name === 'notebook' && <Notebook rows={notebookRows} today={today} />}
      {screen.name === 'analysis' && (
        <Analysis
          stats={stats}
          weakest={weakestTags(stats)}
          totals={{ mastered: counts.mastered, learning: counts.learning, fresh: learnPool.length }}
          days={lastDays(studyDays, today)}
        />
      )}
      {screen.name === 'result' && (
        <Result summary={screen.summary} levelUp={screen.levelUp} onHome={() => setScreen({ name: 'home' })} />
      )}
        </Shell>
      )}
      {isTab && (
        <NavBar
          tab={screen.name as Tab}
          variant={screen.name === 'home' ? 'scene' : 'plain'}
          onChange={(t) => setScreen({ name: t })}
        />
      )}
    </>
  )
}

function Shell({ children, padBottom = false }: { children: React.ReactNode; padBottom?: boolean }) {
  return (
    <div
      className={`mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pt-[env(safe-area-inset-top)] ${padBottom ? 'pb-28' : 'pb-6'}`}
    >
      {children}
    </div>
  )
}
