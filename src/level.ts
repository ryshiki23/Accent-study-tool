/** 形象のレベル（SPEC 7.6）：覚えた詞条の数で決まる。Lv1 0 / Lv2 50 / … / Lv6 1000 */
export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 600, 1000] as const
export const MAX_LEVEL = LEVEL_THRESHOLDS.length

export interface LevelInfo {
  level: number
  /** 次のレベルまであと何語（最高レベルなら null） */
  toNext: number | null
  /** 今のレベルの中での進み具合 0〜1 */
  progress: number
}

export function levelOf(mastered: number): LevelInfo {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) if (mastered >= LEVEL_THRESHOLDS[i]) level = i + 1
  if (level >= MAX_LEVEL) return { level, toNext: null, progress: 1 }
  const lo = LEVEL_THRESHOLDS[level - 1]
  const hi = LEVEL_THRESHOLDS[level]
  return { level, toNext: hi - mastered, progress: (mastered - lo) / (hi - lo) }
}
