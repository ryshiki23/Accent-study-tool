import type { SetSummary } from '../types'
import { useState } from 'react'
import { labelWithPos } from '../questions'
import Avatar from '../components/Avatar'

interface Props {
  summary: SetSummary
  onHome: () => void
  /** この組でレベルが上がったら、新しいレベル */
  levelUp: number | null
}

export default function Result({ summary, onHome, levelUp }: Props) {
  const { total, correct, wrong } = summary
  const [showLevelUp, setShowLevelUp] = useState(levelUp !== null)
  return (
    <div className="flex flex-1 flex-col pt-12">
      {showLevelUp && levelUp !== null && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 px-6" onClick={() => setShowLevelUp(false)}>
          <div className="animate-fade-in w-full max-w-xs rounded-lg border-[3px] border-ink bg-white p-6 text-center shadow-[0_5px_0_var(--ink)]">
            <p className="text-2xl font-extrabold text-primary">レベルアップ！</p>
            <div className="mt-4 flex justify-center">
              <Avatar level={levelUp} mood="happy" size={112} bounceKey={1} />
            </div>
            <p className="mt-3 text-lg font-bold">Lv{levelUp - 1} → Lv{levelUp}</p>
            <button className="mt-5 h-12 w-full rounded-lg border-[3px] border-ink bg-primary font-bold text-white shadow-[0_4px_0_var(--ink)]">やったね！</button>
          </div>
        </div>
      )}
      <p className="text-center text-sub">おつかれさま！</p>
      <p className="mt-2 text-center text-6xl font-bold">
        {correct}
        <span className="text-2xl text-sub"> / {total}</span>
      </p>

      {wrong.length > 0 ? (
        <div className="mt-8 rounded-lg border-[3px] border-ink bg-white p-4">
          <p className="font-bold text-wrong">間違えた単語</p>
          <ul className="mt-2 divide-y divide-tile">
            {wrong.map((r) => (
              <li key={r.item.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-lg font-semibold">{labelWithPos(r.item)}</span>
                <span className="shrink-0 text-sm text-sub">
                  第 {r.item.stress} 音節{r.chosen !== undefined && `（あなた：${r.chosen}）`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-center text-lg font-bold text-correct">全問正解！🎉</p>
      )}

      <button
        onClick={onHome}
        className="mt-auto h-[54px] rounded-lg border-[3px] border-ink bg-primary text-lg font-black text-white shadow-[0_5px_0_var(--ink)] active:translate-y-0.5"
      >
        ホームへ
      </button>
    </div>
  )
}
