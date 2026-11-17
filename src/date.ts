/** 日付は 'YYYY-MM-DD' の文字列で扱う */

/** 「今日」：日本時間、朝 4 時で日付が変わる（SPEC 6.3） */
export function studyToday(now: Date = new Date()): string {
  // UTC+9 して 4 時間戻す = UTC+5 の日付
  const shifted = new Date(now.getTime() + (9 - 4) * 3600 * 1000)
  return shifted.toISOString().slice(0, 10)
}

export function addDays(day: string, n: number): string {
  const d = new Date(day + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
