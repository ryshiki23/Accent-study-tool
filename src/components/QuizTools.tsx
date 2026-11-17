import { useState } from 'react'
import type { Item } from '../types'
import { canSpeak, speak } from '../speech'

/** 発音ボタン。S 類は例文だけ（SPEC 4.5） */
export function SpeakButton({ item, small = false }: { item: Item; small?: boolean }) {
  if (!canSpeak) return null
  const sentence = item.class === 'S'
  const text = sentence ? item.sentence : item.word
  if (!text) return null
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 font-semibold text-indigo-600 active:bg-indigo-100 ${
        small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
      aria-label={sentence ? '例文を聞く' : '発音を聞く'}
    >
      🔊{!small && (sentence ? ' 例文を聞く' : ' 発音')}
    </button>
  )
}

/** 「この問題を報告」（SPEC 5.6）。答えがおかしいと思ったときに押す */
export function ReportButton({ onReport }: { onReport: () => Promise<boolean> }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle')
  if (state === 'done') return <span className="text-xs text-slate-400">報告しました ✓</span>
  return (
    <button
      type="button"
      disabled={state === 'sending'}
      onClick={async () => {
        setState('sending')
        setState((await onReport()) ? 'done' : 'failed')
      }}
      className="text-xs text-slate-400 underline underline-offset-2"
    >
      {state === 'failed' ? '送れませんでした。もう一度' : 'この問題を報告'}
    </button>
  )
}
