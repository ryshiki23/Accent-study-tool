import { useEffect, useState } from 'react'
import { SKY, THEMES, timeOfDay, type TimeOfDay } from './seaside'

/** 時間帯の配色を CSS 変数に入れる（:root の --ink など） */
export function applyTheme(time: TimeOfDay) {
  const t = THEMES[time]
  const vars: Record<string, string> = {
    '--ink': t.ink,
    '--sub': t.sub,
    '--primary': t.primary,
    '--accent': t.accent,
    '--accent-text': t.accentText,
    '--tile': t.tile,
    '--correct': t.correct,
    '--wrong': t.wrong,
    '--sky0': t.sky0,
    '--ground': SKY[time].ground,
    '--quiz-bg': `linear-gradient(160deg, ${t.quizBg.join(', ')})`,
  }
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.ink)
}

/** 今の時間帯。1 分ごとに確認し、変わったら配色も切り替える */
export function useTimeOfDay(): TimeOfDay {
  const [time, setTime] = useState<TimeOfDay>(() => timeOfDay())
  useEffect(() => {
    applyTheme(time)
  }, [time])
  useEffect(() => {
    const id = setInterval(() => setTime(timeOfDay()), 60_000)
    return () => clearInterval(id)
  }, [])
  return time
}
