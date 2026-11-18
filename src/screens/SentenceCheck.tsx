import { useEffect, useMemo, useRef, useState } from 'react'
import type { Item } from '../types'
import { POS_LABEL } from '../questions'
import { canSpeak, speak, stopSpeaking, voiceName } from '../speech'
import Sentence from '../components/Sentence'

const STORAGE_KEY = 'sentence-check-ng'

function loadNg(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}
function saveNg(ng: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ng]))
  } catch {
    /* 保存できなくても画面は動く */
  }
}

/**
 * 例文の読み上げチェック（SPEC 4.5）。開発用の画面：/?check=sentences
 * S 類の例文を全部聞いて、強勢を読み間違えているものに NG をつける。NG の一覧をコピーして修正に使う。
 */
export default function SentenceCheck({ items }: { items: Item[] }) {
  const sItems = useMemo(
    () => items.filter((i) => i.class === 'S').sort((a, b) => a.word.localeCompare(b.word) || a.id.localeCompare(b.id)),
    [items],
  )
  const [ng, setNg] = useState<Set<string>>(loadNg)
  const [playing, setPlaying] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const stopped = useRef(false)

  useEffect(() => () => stopSpeaking(), [])

  function toggleNg(id: string) {
    setNg((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveNg(next)
      return next
    })
  }

  function playFrom(i: number) {
    if (i >= sItems.length || stopped.current) {
      setPlaying(null)
      return
    }
    setPlaying(i)
    rows.current[i]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    speak(sItems[i].sentence!, () => setTimeout(() => playFrom(i + 1), 700))
  }

  function startAll(from = 0) {
    stopped.current = false
    playFrom(from)
  }
  function stopAll() {
    stopped.current = true
    stopSpeaking()
    setPlaying(null)
  }

  const ngList = sItems.filter((i) => ng.has(i.id))
  const ngText = ngList.map((i) => `${i.id}\t${i.sentence}`).join('\n')

  return (
    <div className="pt-6 pb-40">
      <h1 className="text-xl font-bold">例文の読み上げチェック</h1>
      <p className="mt-1 text-sm text-slate-500">
        {sItems.length} 文。下線の語の強勢が正しく読まれているか聞いて、違うものに NG をつける。
      </p>
      {canSpeak ? (
        <p className="mt-1 text-xs text-slate-400">音声：{voiceName() ?? '（端末の標準）'}</p>
      ) : (
        <p className="mt-2 text-sm font-semibold text-rose-500">このブラウザでは読み上げが使えません。</p>
      )}

      <ul className="mt-4 space-y-2">
        {sItems.map((it, i) => {
          const isNg = ng.has(it.id)
          return (
            <li
              key={it.id}
              ref={(el) => {
                rows.current[i] = el
              }}
              className={`rounded-2xl p-3 shadow-sm transition ${
                playing === i ? 'bg-indigo-50 ring-2 ring-indigo-400' : isNg ? 'bg-rose-50' : 'bg-white/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  <span className="font-bold text-slate-700">{it.word}</span>（{POS_LABEL[it.pos ?? ''] ?? it.pos}）
                  正しくは <span className="font-bold text-indigo-600">第 {it.stress} 音節</span>
                </span>
                <span className="text-slate-400">{i + 1}</span>
              </div>
              <p className="mt-1.5 text-lg leading-loose">
                <Sentence item={it} />
              </p>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => {
                    stopAll()
                    speak(it.sentence!)
                  }}
                  className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600 active:bg-indigo-100"
                >
                  🔊 再生
                </button>
                <button
                  onClick={() => startAll(i)}
                  className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm active:bg-slate-50"
                >
                  ここから続けて
                </button>
                <button
                  onClick={() => toggleNg(it.id)}
                  aria-pressed={isNg}
                  className={`ml-auto rounded-full px-4 py-1.5 text-sm font-bold ${
                    isNg ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 shadow-sm'
                  }`}
                >
                  NG
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* 下部：連続再生と NG 一覧 */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/60 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto max-w-[480px] px-4 py-3">
          <div className="flex items-center gap-2">
            {playing === null ? (
              <button onClick={() => startAll(0)} className="h-11 flex-1 rounded-2xl bg-indigo-500 font-bold text-white">
                ▶ 最初から順番に再生
              </button>
            ) : (
              <button onClick={stopAll} className="h-11 flex-1 rounded-2xl bg-slate-700 font-bold text-white">
                ■ 停止（{playing + 1} / {sItems.length}）
              </button>
            )}
            <button
              disabled={ngList.length === 0}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(ngText)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                } catch {
                  /* コピーできないときは下の一覧を長押しで */
                }
              }}
              className="h-11 rounded-2xl bg-rose-500 px-4 font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
            >
              {copied ? 'コピーしました' : `NG ${ngList.length} 件をコピー`}
            </button>
          </div>
          {ngList.length > 0 && (
            <pre className="mt-2 max-h-20 overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] whitespace-pre-wrap text-slate-600 select-all">
              {ngText}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
