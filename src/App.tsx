import { useEffect, useMemo, useState } from 'react'
import type { AnswerRecord, Item, Status } from './types'
import Home from './screens/Home'
import Quiz from './screens/Quiz'
import Result from './screens/Result'

const SET_SIZE = 10

type Screen =
  | { name: 'home' }
  | { name: 'quiz'; items: Item[] }
  | { name: 'result'; records: AnswerRecord[] }

export default function App() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  // 進捗（第 1 步ではメモリのみ。リロードで消える）
  const [progress, setProgress] = useState<Map<string, Status>>(new Map())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  useEffect(() => {
    fetch('/data/items.json')
      .then((r) => r.json())
      .then((data: Item[]) => setItems(data))
      .catch(() => setLoadError(true))
  }, [])

  // Learn の出題候補：未学習、頻度の高い順。
  // S 類（名前動後）は品詞ラベル・例文つきの出題が必要なので第 4 步まで出さない。
  const learnPool = useMemo(() => {
    if (!items) return []
    return items
      .filter((it) => it.class !== 'S' && !progress.has(it.id))
      .sort((a, b) => b.zipf - a.zipf)
  }, [items, progress])

  function startLearn() {
    const set = learnPool.slice(0, SET_SIZE)
    if (set.length > 0) setScreen({ name: 'quiz', items: set })
  }

  function handleAnswer(item: Item, correct: boolean) {
    setProgress((prev) => {
      const next = new Map(prev)
      next.set(item.id, correct ? 'mastered' : 'learning')
      return next
    })
  }

  if (loadError) {
    return <Shell><p className="mt-20 text-center">問題データを読み込めませんでした。</p></Shell>
  }
  if (!items) {
    return <Shell><p className="mt-20 text-center text-slate-500">読み込み中…</p></Shell>
  }

  return (
    <Shell>
      {screen.name === 'home' && (
        <Home
          learnCount={learnPool.length}
          masteredCount={[...progress.values()].filter((s) => s === 'mastered').length}
          learningCount={[...progress.values()].filter((s) => s === 'learning').length}
          onLearn={startLearn}
        />
      )}
      {screen.name === 'quiz' && (
        <Quiz
          key={screen.items.map((i) => i.id).join(',')}
          items={screen.items}
          onAnswer={handleAnswer}
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
