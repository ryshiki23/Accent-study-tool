import { useMemo, useState } from 'react'
import type { Item, ProgressRow } from '../types'
import StressedWord from '../components/StressedWord'

interface Props {
  rows: { item: Item; row: ProgressRow }[]
  today: string
}

function dueLabel(due: string | null, today: string) {
  if (!due) return ''
  if (due <= today) return '今日'
  const [, m, d] = due.split('-').map(Number)
  return `${m}/${d}`
}

/** 間違いノート（SPEC 7.4）：learning の詞条一覧。タグで絞り込み */
export default function Notebook({ rows, today }: Props) {
  const [tag, setTag] = useState<string | null>(null)

  const tags = useMemo(() => {
    const count = new Map<string, number>()
    for (const { item } of rows) for (const t of item.tags) count.set(t, (count.get(t) ?? 0) + 1)
    return [...count.entries()].sort((a, b) => b[1] - a[1])
  }, [rows])

  const shown = useMemo(
    () =>
      rows
        .filter(({ item }) => !tag || item.tags.includes(tag))
        .sort((a, b) => (a.row.due_date ?? '').localeCompare(b.row.due_date ?? '') || a.item.word.localeCompare(b.item.word)),
    [rows, tag],
  )

  return (
    <div className="pt-8">
      <h1 className="text-2xl font-bold">間違いノート</h1>
      <p className="mt-1 text-sm text-sub">復習中の単語 {rows.length} 語</p>

      {rows.length === 0 ? (
        <p className="mt-16 text-center text-sub">まだ間違えた単語はありません。</p>
      ) : (
        <>
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <Chip active={!tag} onClick={() => setTag(null)}>すべて</Chip>
            {tags.map(([t, n]) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                {t} <span className="opacity-60">{n}</span>
              </Chip>
            ))}
          </div>

          <ul className="mt-3 divide-y divide-tile rounded-lg border-[3px] border-ink bg-white px-4">
            {shown.map(({ item, row }) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <StressedWord item={item} className="text-lg" />
                <div className="shrink-0 text-right text-xs text-sub">
                  <p>
                    次回 <span className="font-semibold text-ink">{dueLabel(row.due_date, today)}</span>
                  </p>
                  <p>間違い {row.wrong_count} 回</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${
        active ? 'bg-primary text-white' : 'bg-white text-sub border-2 border-ink'
      }`}
    >
      {children}
    </button>
  )
}
