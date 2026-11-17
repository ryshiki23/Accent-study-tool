import { useState } from 'react'

export type Mood = 'normal' | 'happy' | 'sad' | 'sleep'

/**
 * 形象（SPEC 7.6）。public/avatar/lv{レベル}_{状態}.png を表示する。
 * その画像がなければ下のレベルを順に探し、どれもなければ仮の画像（ドット絵）を出す。
 * → 画像を public/avatar/ に置くだけで差し替わる。
 */
export default function Avatar({ level, mood, size = 96, bounceKey }: { level: number; mood: Mood; size?: number; bounceKey?: number }) {
  // 試すレベル（level, level-1, …, 1）。読み込みに失敗したら次へ
  const [tryLevel, setTryLevel] = useState(level)
  const [forKey, setForKey] = useState(`${level}_${mood}`)
  const key = `${level}_${mood}`
  if (forKey !== key) {
    setForKey(key)
    setTryLevel(level)
  }
  return (
    <div key={bounceKey} className={bounceKey ? 'animate-hop' : ''} style={{ width: size, height: size }}>
      {tryLevel >= 1 ? (
        <img
          src={`/avatar/lv${tryLevel}_${mood}.png`}
          alt=""
          width={size}
          height={size}
          style={{ imageRendering: 'pixelated', width: size, height: size }}
          onError={() => setTryLevel((l) => l - 1)}
        />
      ) : (
        <PlaceholderAvatar mood={mood} level={level} size={size} />
      )}
    </div>
  )
}

// ===== 仮の形象（12×12 のドット絵）=====
// . 透明  B 体  W 光  E 目・口  C ほっぺ  T 涙
const BODY = [
  '....BBBB....',
  '..BBBBBBBB..',
  '.BBWBBBBBBB.',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '.BBBBBBBBBB.',
  '..BBBBBBBB..',
  '...BB..BB...',
]
const FACES: Record<Mood, Record<number, string>> = {
  normal: { 4: 'BBBEBBBBEBBB', 5: 'BBBEBBBBEBBB', 7: 'BBCBBEEBBCBB' },
  happy: { 4: 'BBBEBBBBEBBB', 5: 'BBEBEBBEBEBB', 7: 'BBCBEEEEBCBB', 8: '.BBBBEEBBBB.' },
  sad: { 4: 'BBBEBBBBEBBB', 5: 'BBBEBBBBEBBB', 6: 'BBBBBBBBTBBB', 7: 'BBCBBEEBBCBB', 8: '.BBBEBBEBBB.' },
  sleep: { 5: 'BBEEBBBBEEBB', 7: 'BBCBBBEBBCBB' },
}
/** レベルごとの体の色 */
const BODY_COLORS = ['#c7d2fe', '#a5b4fc', '#93c5fd', '#86efac', '#fcd34d', '#f9a8d4']
const COLORS: Record<string, string> = { W: '#ffffff', E: '#1e293b', C: '#fda4af', T: '#38bdf8' }

export function PlaceholderAvatar({ mood, level, size }: { mood: Mood; level: number; size: number }) {
  const rows = BODY.map((r, i) => FACES[mood][i] ?? r)
  const body = BODY_COLORS[Math.min(Math.max(level, 1), BODY_COLORS.length) - 1]
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((r, y) =>
        [...r].map((ch, x) =>
          ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={ch === 'B' ? body : COLORS[ch]} />,
        ),
      )}
      {mood === 'sleep' && (
        <text x={9.2} y={2.2} fontSize={2.6} fontWeight={700} fill="#64748b">z</text>
      )}
    </svg>
  )
}
