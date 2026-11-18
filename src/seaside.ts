/*
 * アクセント練習 / ホーム画面の海辺シーン + ねこ形象（1b）。Claude Design の handoff（seaside.js）を TS に移植。
 * <canvas width="94" height="190"> に描画し、CSS で拡大、image-rendering: pixelated で表示する。
 *
 *   drawSeaside(ctx, frame, time, level, mood)
 *     frame : 125ms ごとに +1（= 8fps）。Math.floor(performance.now() / 125)
 *   catSprite(level, mood) → 16×16（各セル '#rrggbb' または 0 = 透明）
 *   THEMES[time] → UI の色
 */

export type TimeOfDay = 'morning' | 'noon' | 'evening'
export type CatMood = 'normal' | 'happy' | 'sad' | 'sleep' | 'blink'
type Cell = string | 0
type Grid = Cell[][]

const N = 16
const G = (): Grid => Array.from({ length: N }, () => Array<Cell>(N).fill(0))
function R(g: Grid, x: number, y: number, w: number, h: number, c: Cell) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < N && j >= 0 && j < N) g[j][i] = c
}
function P(g: Grid, pts: number[][], c: Cell) {
  for (const [x, y] of pts) if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c
}
function outline(g: Grid, c: string): Grid {
  const o = g.map((r) => r.slice())
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (g[y][x]) continue
      if (
        [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const X = x + dx
          const Y = y + dy
          return X >= 0 && X < N && Y >= 0 && Y < N && g[Y][X]
        })
      )
        o[y][x] = c
    }
  return o
}
const ZZ = [[13, 0], [14, 0], [15, 0], [14, 1], [13, 2], [14, 2], [15, 2]]
const SPARK = [[1, 13], [0, 14], [1, 14], [2, 14], [1, 15], [14, 13], [13, 14], [14, 14], [15, 14], [14, 15], [0, 4], [15, 5]]

const CAT = {
  o: '#3A2E4F', f: '#FFF3E4', F: '#EBCFB4', st: '#F2994A', ear: '#F7A1B5', e: '#3A2E4F', n: '#E8708F', c: '#F7B3C2',
  w: '#FFFFFF', ws: '#D6DEF0', collar: '#E5484D', gold: '#F6C445', stc: '#8C93B8', tear: '#8FD3F4', pink: '#F27FA5', z: '#8C93B8',
}

/** 1b ねこ。Lv2 赤い首輪 → Lv3 鈴 + 斑 → Lv4 ナースキャップ → Lv5 白衣 + 聴診器 → Lv6 金のキャップ + キラキラ */
export function catSprite(level: number, mood: CatMood): Grid {
  const lv = Math.max(1, Math.min(6, level))
  const g = G()
  const C = CAT
  R(g, 3, 4, 10, 1, C.f); R(g, 2, 5, 12, 7, C.f); P(g, [[2, 5], [13, 5], [2, 11], [13, 11]], 0)
  P(g, [[3, 2], [3, 3], [4, 3], [5, 3], [12, 2], [12, 3], [11, 3], [10, 3]], C.f); P(g, [[4, 3], [11, 3]], C.ear)
  P(g, [[7, 4], [8, 4], [7, 5], [8, 5], [5, 5], [10, 5]], C.st)
  R(g, 4, 12, 8, 3, C.f); P(g, [[6, 13], [7, 13], [8, 13], [9, 13]], C.w); P(g, [[7, 14], [8, 14]], C.F)
  P(g, [[12, 13], [13, 12], [13, 11], [14, 10]], C.st)
  if (lv >= 2 && lv < 5) R(g, 4, 12, 8, 1, C.collar)
  if (lv >= 3) P(g, [[11, 6], [12, 6], [11, 7], [12, 7], [12, 8]], C.st)
  if (lv >= 3 && lv < 5) P(g, [[7, 13], [8, 13]], C.gold)
  if (lv >= 4) { R(g, 6, 2, 4, 2, C.w); R(g, 6, 3, 4, 1, lv >= 6 ? C.gold : C.pink) }
  if (lv >= 5) { R(g, 4, 12, 8, 3, C.w); P(g, [[4, 14], [11, 14], [7, 14], [8, 14]], C.ws); P(g, [[5, 12], [6, 13], [9, 13], [10, 12]], C.stc) }
  if (mood === 'normal') { P(g, [[5, 8], [5, 9], [10, 8], [10, 9]], C.e); P(g, [[4, 10], [11, 10]], C.c); P(g, [[7, 10], [8, 10]], C.n) }
  if (mood === 'happy') { P(g, [[4, 9], [5, 8], [6, 9], [9, 9], [10, 8], [11, 9]], C.e); P(g, [[4, 10], [11, 10]], C.c); P(g, [[7, 10], [8, 10], [7, 11], [8, 11]], C.n) }
  if (mood === 'sad') { P(g, [[5, 9], [6, 8], [10, 9], [9, 8]], C.e); P(g, [[4, 10], [4, 11]], C.tear); P(g, [[11, 10]], C.c); P(g, [[7, 10], [8, 10]], C.e) }
  if (mood === 'sleep' || mood === 'blink') { P(g, [[4, 9], [5, 9], [10, 9], [11, 9]], C.e); P(g, [[4, 10], [11, 10]], C.c); P(g, [[7, 10], [8, 10]], C.n) }
  const o = outline(g, C.o)
  if (mood === 'sleep') P(o, ZZ, C.z)
  if (lv >= 6 && mood !== 'sleep' && mood !== 'blink') P(o, SPARK, C.gold)
  return o
}

export function paintSprite(ctx: CanvasRenderingContext2D, g: Grid, x0: number, y0: number, s = 1) {
  for (let y = 0; y < g.length; y++)
    for (let x = 0; x < g[0].length; x++) {
      const c = g[y][x]
      if (!c) continue
      ctx.fillStyle = c
      ctx.fillRect(x0 + x * s, y0 + y * s, s, s)
    }
}

interface Sky {
  sky: string[]; clouds: 'streak' | 'puff'; cloudC: string[]; sun: [number, number, number]; sunC: string; glow: string
  hillF: string; hillN: string; coast: string; city: string; sea: string[]; refl: string | null; wave: string
  railHl: string; rail: string; railSh: string; ground: string; groundL: string; plant: string; bird: string | null
}

export const SKY: Record<TimeOfDay, Sky> = {
  morning: { sky: ['#A9C8EE', '#B9D3F1', '#CBDDF2', '#DFE7EF', '#F1E9DE', '#FBE2C9', '#FDD8B4'], clouds: 'streak', cloudC: ['#FFFFFF', '#F6EFF0'], sun: [47, 68, 6], sunC: '#FFF6D8', glow: '#FFE9BE', hillF: '#A6B1D6', hillN: '#7F8EC0', coast: '#5E6FA6', city: '#BDB9D9', sea: ['#FBE0C2', '#D3DFEC', '#B2C9E5', '#93B2DA', '#7A9CCD', '#6788BF'], refl: '#FFF3D6', wave: '#DCE6F3', railHl: '#FFDDB8', rail: '#3E5A9A', railSh: '#2F4580', ground: '#2A3966', groundL: '#33457A', plant: '#3F5A92', bird: '#5A6A90' },
  noon: { sky: ['#4F9FE6', '#60AAEA', '#73B5ED', '#88C1F0', '#9FCDF2', '#B8DAF4', '#D2E8F6'], clouds: 'puff', cloudC: ['#FFFFFF', '#DCEAF7'], sun: [76, 16, 6], sunC: '#FFFBEA', glow: '#CFE7FA', hillF: '#7FB6B0', hillN: '#5E9C8F', coast: '#4A8577', city: '#A9D0D6', sea: ['#C7EEF0', '#86D3DE', '#5CBBD4', '#43A2C9', '#378ABD', '#2F74AC'], refl: null, wave: '#A8E0EA', railHl: '#FFFFFF', rail: '#2F5E9E', railSh: '#244C85', ground: '#24405F', groundL: '#2C4B6E', plant: '#3A6E64', bird: '#3C5A80' },
  evening: { sky: ['#BCA9E3', '#D5B0DD', '#EBBAD6', '#F7CBD9', '#FCE0DE', '#F9CCD7', '#F2AFC7'], clouds: 'streak', cloudC: ['#FFF2EC', '#E3C8EC'], sun: [47, 67, 4], sunC: '#FFF4DE', glow: '#FBD9DF', hillF: '#8070AE', hillN: '#6A5C9E', coast: '#5F5490', city: '#C98DB6', sea: ['#E9AECB', '#BC9DD1', '#A097D3', '#8891D0', '#7285C8', '#6074BC'], refl: '#FAC8D8', wave: '#B6B8EA', railHl: '#F2A3BE', rail: '#3A4A8A', railSh: '#2A3570', ground: '#2E2A4F', groundL: '#36315A', plant: '#4A4580', bird: null },
}

export interface Theme {
  ink: string; sub: string; primary: string; accent: string; accentText: string; tile: string
  quizBg: string[]; correct: string; wrong: string; sky0: string
}

/** UI の色。時間帯ごとに切り替える（出題画面も同じ時間帯の色を使う） */
export const THEMES: Record<TimeOfDay, Theme> = {
  morning: { ink: '#22325A', sub: '#5E6B8C', primary: '#3F6FB8', accent: '#F29A5B', accentText: '#C0602A', tile: '#E6EEF8', quizBg: ['#EAF2FB', '#FDEBD9'], correct: '#2E9E6A', wrong: '#E0484F', sky0: '#A9C8EE' },
  noon: { ink: '#173A5E', sub: '#4F6A86', primary: '#2786C0', accent: '#F2B33D', accentText: '#9A6A0C', tile: '#E1F2F7', quizBg: ['#E4F3FB', '#D5EEF2'], correct: '#24966A', wrong: '#DE4452', sky0: '#4F9FE6' },
  evening: { ink: '#2E2A4F', sub: '#66648A', primary: '#5466C0', accent: '#F08A5D', accentText: '#C2582B', tile: '#EEEAFB', quizBg: ['#FDE4EC', '#E6DDF6', '#CFDBF4'], correct: '#2A9A68', wrong: '#DE4459', sky0: '#BCA9E3' },
}

/** 日本時間の時刻 → 時間帯（4–10 朝 / 10–16 昼 / それ以外 夕。4 時に日付が変わる SPEC に合わせる） */
export function timeOfDay(date: Date = new Date()): TimeOfDay {
  const h = (date.getUTCHours() + 9) % 24
  if (h >= 4 && h < 10) return 'morning'
  if (h >= 10 && h < 16) return 'noon'
  return 'evening'
}

type Fill = (x: number, y: number, w: number, h: number, c: string) => void
function F(ctx: CanvasRenderingContext2D): Fill {
  return (x, y, w, h, c) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, w, h)
  }
}
function disc(f: Fill, cx: number, cy: number, r: number, c: string, maxY = 999) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r)
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + r * 0.6 && cy + dy < maxY) f(cx + dx, cy + dy, 1, 1, c)
}
function puff(f: Fill, x: number, y: number, s: number, C: string[]) {
  disc(f, x, y, 3 * s, C[0]); disc(f, x + 5 * s, y - 2 * s, 4 * s, C[0]); disc(f, x + 10 * s, y, 3 * s, C[0])
  f(Math.round(x - 2 * s), Math.round(y + 2 * s), Math.round(15 * s), 1, C[1])
}
function zz(ctx: CanvasRenderingContext2D, x: number, y: number, fr: number, color: string) {
  const f = F(ctx)
  for (let i = 0; i < 2; i++) {
    const p = ((fr >> 1) + i * 10) % 20
    const X = x + (p >> 3)
    const Y = y - (p >> 1)
    ;[[0, 0], [1, 0], [2, 0], [1, 1], [0, 2], [1, 2], [2, 2]].forEach(([a, b]) => f(X + a, Y + b, 1, 1, color))
  }
}

export const SCENE_W = 94
export const SCENE_H = 190
/** 形象の位置（キャンバス座標、2 倍描画で 32×32）。吹き出しはこの右側に置く */
export const CAT_POS = { x: 6, y: 86, scale: 2 }

export function drawSeaside(ctx: CanvasRenderingContext2D, fr: number, time: TimeOfDay, level: number, mood: Exclude<CatMood, 'blink'>) {
  const T = SKY[time] || SKY.evening
  const f = F(ctx)
  const W = SCENE_W
  ctx.clearRect(0, 0, SCENE_W, SCENE_H)
  T.sky.forEach((c, i) => f(0, i * 10, W, 10, c))
  for (let i = 1; i < T.sky.length; i++) for (let x = i % 2; x < W; x += 2) f(x, i * 10 - 1, 1, 1, T.sky[i])
  const [sx, sy, sr] = T.sun
  disc(f, sx, sy, sr + 2, T.glow, 70); disc(f, sx, sy, sr, T.sunC, 70)
  if (T.clouds === 'streak') {
    ;[[4, 8, 22], [40, 14, 30], [10, 22, 26], [56, 27, 24], [0, 36, 20], [30, 42, 34], [64, 48, 22], [14, 54, 18], [50, 58, 26]].forEach(([x, y, w], i) => {
      const px = ((x + (fr >> 4)) % 124) - 16
      f(px, y, w, 1, T.cloudC[i % 2])
      if (i % 3 === 0) f(px + 4, y - 1, w - 8, 1, T.cloudC[i % 2])
    })
  } else {
    ;[[8, 30, 1], [50, 44, 1.3], [20, 58, 0.8]].forEach(([x, y, s]) => puff(f, ((x + (fr >> 5)) % 130) - 20, y, s, T.cloudC))
  }
  const bird = T.bird
  if (bird)
    [[0, 22], [46, 32]].forEach(([o, y], i) => {
      const x = ((o + (fr >> 2)) % 120) - 10
      const up = ((fr >> 2) + i) % 4 < 2
      f(x, y, 1, 1, bird); f(x + 1, y + (up ? 1 : 0), 1, 1, bird); f(x + 2, y, 1, 1, bird)
    })
  for (let x = 0; x <= 40; x++) { const t = Math.round(56 + Math.abs(x - 12) * 0.42); if (t < 70) f(x, t, 1, 70 - t, T.hillF) }
  for (let x = 0; x <= 22; x++) { const t = Math.round(62 + Math.abs(x - 4) * 0.45); if (t < 73) f(x, t, 1, 73 - t, T.coast) }
  for (let x = 62; x < W; x++) { const t = Math.round(58 + Math.abs(x - 82) * 0.5); if (t < 70) f(x, t, 1, 70 - t, T.hillN) }
  ;[[38, 66, 2, 4], [41, 67, 1, 3], [44, 65, 2, 5], [56, 67, 2, 3], [59, 66, 1, 4], [78, 55, 1, 5]].forEach((r) => f(r[0], r[1], r[2], r[3], T.city))
  let y = 70
  ;[2, 4, 6, 9, 12, 15].forEach((h, i) => { f(0, y, W, h, T.sea[i]); y += h })
  for (let i = 0; i < 20; i++) {
    const d = i % 2 ? 1 : -1
    const x = (((i * 31 + (fr >> 2) * d) % W) + W) % W
    const yy = 73 + ((i * 7) % 42)
    f(x, yy, 2 + (i % 4), 1, T.wave)
  }
  const refl = T.refl
  if (refl) {
    for (let yy = 70; yy < 112; yy++) {
      const half = Math.max(1, 6 - ((yy - 70) >> 3))
      for (let x = sx - half; x <= sx + half; x++) if ((x * 3 + yy * 5 + (fr >> 1)) % 4 === 0) f(x, yy, 1, 1, refl)
    }
  } else {
    for (let i = 0; i < 16; i++) {
      const x = (i * 37) % W
      const yy = 74 + ((i * 13) % 40)
      const ph = ((fr >> 2) + i) % 5
      if (ph === 0) { f(x, yy, 1, 1, '#FFFFFF'); f(x - 1, yy, 1, 1, '#E6F7FA'); f(x + 1, yy, 1, 1, '#E6F7FA') }
      else if (ph === 1) f(x, yy, 1, 1, '#FFFFFF')
    }
  }
  f(70, 104, 16, 5, T.coast); f(74, 101, 9, 3, T.coast); f(74, 101, 4, 1, T.railHl)
  f(0, 118, W, 1, T.railHl); f(0, 119, W, 3, T.rail); f(0, 122, W, 1, T.railSh); f(0, 123, W, 67, T.ground)
  ;[6, 50, 86].forEach((x) => f(x, 123, 3, 16, T.rail))
  for (let yy = 140; yy < 190; yy += 12) f(0, yy, W, 1, T.groundL)
  ;[[14, 126], [22, 130], [36, 127], [62, 129], [72, 126], [80, 131]].forEach(([x, yy]) => {
    f(x, yy, 1, 1, T.plant); f(x + 1, yy + 1, 1, 1, T.plant); f(x + 2, yy + 2, 1, 2, T.plant); f(x - 1, yy + 2, 1, 2, T.plant)
  })
  // 形象：normal は約 4 秒に 1 回まばたき、happy は 3 秒ごとに小さくジャンプ、sleep は Z が浮かぶ。歩き回らない
  let m: CatMood = mood
  let dy = 0
  if (mood === 'normal' && fr % 32 < 2) m = 'blink'
  if (mood === 'happy') {
    const J = [0, -2, -4, -2, 0]
    const p = fr % 24
    dy = p < 5 ? J[p] : 0
  }
  paintSprite(ctx, catSprite(level, m), CAT_POS.x, CAT_POS.y + dy, CAT_POS.scale)
  if (mood === 'sleep') zz(ctx, CAT_POS.x + 30, CAT_POS.y + 2, fr, '#FFFFFF')
}
