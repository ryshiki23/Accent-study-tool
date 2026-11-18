import { useEffect, useRef } from 'react'
import { capCount } from '../srs'
import { levelOf } from '../level'
import type { Mood } from '../components/Avatar'
import PixelIcon from '../components/PixelIcon'
import { drawSeaside, SCENE_H, SCENE_W, type TimeOfDay } from '../seaside'

interface Props {
  learnCount: number
  reviewCount: number
  masteredCount: number
  /** 進捗の行が 1 つもない（はじめて） */
  isNew: boolean
  answeredToday: number
  time: TimeOfDay
  onLearn: () => void
  onReview: () => void
}

function todayLabel() {
  const d = new Date()
  const w = '日月火水木金土'[d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`
}

/** 形象のひとこと（SPEC 7.6） */
function greeting({ isNew, reviewCount, answeredToday }: Pick<Props, 'isNew' | 'reviewCount' | 'answeredToday'>): {
  text: string
  mood: Mood
} {
  if (isNew) return { text: 'はじめまして！まずは Learn からやってみよう', mood: 'happy' }
  if (reviewCount > 0) return { text: `復習が ${capCount(reviewCount)} 個たまってるよ`, mood: 'normal' }
  if (answeredToday > 0) return { text: `今日の復習は完了！ ${answeredToday} 問がんばったね`, mood: 'happy' }
  return { text: '今日の復習は完了！ zzz…', mood: 'sleep' }
}

/** デザインの基準幅 375px での長さ → 画面幅に比例した長さ（cqw） */
const u = (px: number) => `calc(${px} * 100cqw / 375)`

/**
 * 画面の高さが足りないとき（Safari のツールバーがあるときなど）、シーンを上にずらして
 * 猫・吹き出し・カードを下部ナビの上に収める（空を切る）。ずらすのは最大 200（基準幅換算）まで。
 * カードの下端 = 504 + カード（(幅 - 52) / 2）、その下に余白 16 + ナビ 68 + セーフエリア。
 */
const SHIFT = `clamp(0px, calc(${u(504)} + (100cqw - 52px) / 2 + 84px + env(safe-area-inset-bottom) - 100dvh), ${u(200)})`
const shifted = (px: number) => `calc(${u(px)} - var(--shift))`

/** 海辺のシーン。125ms ごとに 1 コマ。動きを減らす設定なら 1 コマだけ */
function Scene({ time, level, mood }: { time: TimeOfDay; level: number; mood: Mood }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawSeaside(ctx, 0, time, level, mood)
      return
    }
    let last = -1
    let raf = 0
    const loop = () => {
      const fr = Math.floor(performance.now() / 125)
      if (fr !== last) {
        last = fr
        drawSeaside(ctx, fr, time, level, mood)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [time, level, mood])
  return (
    <canvas
      ref={ref}
      width={SCENE_W}
      height={SCENE_H}
      aria-hidden
      className="pixelated absolute inset-x-0 block w-full bg-[var(--sky0)]"
      style={{ top: 'calc(-1 * var(--shift))' }}
    />
  )
}

export default function Home(props: Props) {
  const { learnCount, reviewCount, masteredCount, time, onLearn, onReview } = props
  const lv = levelOf(masteredCount)
  const { text, mood } = greeting(props)
  const filled = lv.toNext === null ? 10 : Math.round(lv.progress * 10)

  return (
    <div className="mx-auto w-full max-w-[480px] bg-[var(--ground)]" style={{ containerType: 'inline-size' }}>
    <div
      className="relative overflow-hidden"
      style={{ ['--shift' as string]: SHIFT, minHeight: `max(100dvh, calc(${u(504)} + (100cqw - 52px) / 2 + 84px + env(safe-area-inset-bottom) - var(--shift)))` }}
    >
      <Scene time={time} level={lv.level} mood={mood} />

      {/* 頭：日付・タイトル・Lv */}
      <div className="absolute inset-x-5 flex items-start justify-between" style={{ top: `max(${u(52)}, calc(env(safe-area-inset-top) + 8px))` }}>
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-bold text-ink">{todayLabel()}</p>
          <h1 className="font-pixel text-[26px] leading-tight text-ink">アクセント練習</h1>
        </div>
        <div className="flex w-[132px] flex-col gap-[5px] rounded-md border-2 border-ink bg-white/92 px-[9px] py-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-pixel text-[17px] leading-none text-primary">Lv{lv.level}</span>
            <span className="text-[11px] font-bold text-sub">{lv.toNext === null ? '最高レベル！' : `あと ${lv.toNext} 語`}</span>
          </div>
          <div className="flex h-1.5 gap-0.5" aria-label={`レベルの進み具合 ${filled} / 10`}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`flex-1 ${i < filled ? 'bg-primary' : 'bg-tile'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 吹き出し（猫の右） */}
      <div
        className="absolute w-max max-w-[186px] rounded border-2 border-ink bg-white px-2.5 py-1.5 font-pixel text-[13px] leading-[1.45] text-ink shadow-[0_3px_0_var(--ink)]"
        style={{ top: shifted(364), left: u(166) }}
      >
        <span className="absolute top-3 -left-[7px] h-2 w-2 rotate-45 border-b-2 border-l-2 border-ink bg-white" />
        {text}
      </div>

      {/* Learn / Review */}
      <div className="absolute inset-x-5 flex gap-3" style={{ top: shifted(504) }}>
        <button
          onClick={onLearn}
          disabled={learnCount === 0}
          className="flex aspect-square flex-1 flex-col justify-between rounded-[10px] border-[3px] border-ink bg-white/95 p-3.5 text-left shadow-[0_5px_0_rgba(0,0,0,.35)] transition active:scale-[0.98] disabled:opacity-50"
        >
          <CardTop label="Learn" labelClass="text-primary" boxClass="bg-primary" />
          <div>
            <p className="font-pixel text-[32px] leading-none text-ink">{learnCount}</p>
            <p className="mt-1 text-[13px] font-bold text-sub">新しい単語・残り</p>
          </div>
        </button>

        {reviewCount > 0 ? (
          <button
            onClick={onReview}
            className="flex aspect-square flex-1 flex-col justify-between rounded-[10px] border-[3px] border-ink bg-white/95 p-3.5 text-left shadow-[0_5px_0_rgba(0,0,0,.35)] transition active:scale-[0.98]"
          >
            <CardTop label="Review" labelClass="text-accent-text" boxClass="bg-accent" />
            <div>
              <p className="font-pixel text-[32px] leading-none text-ink">{capCount(reviewCount)}</p>
              <p className="mt-1 text-[13px] font-bold text-sub">復習・今日</p>
            </div>
          </button>
        ) : (
          <div className="flex aspect-square flex-1 flex-col justify-between rounded-[10px] border-[3px] border-dashed border-white/80 bg-white/35 p-3.5 text-white">
            <p className="font-pixel text-base tracking-[.06em]">Review</p>
            <div>
              <p className="font-pixel text-[22px] leading-none">完了！</p>
              <p className="mt-1 text-[13px] font-bold">今日の復習は完了</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

function CardTop({ label, labelClass, boxClass }: { label: string; labelClass: string; boxClass: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className={`font-pixel text-base tracking-[.06em] ${labelClass}`}>{label}</span>
      <span className={`flex h-[34px] w-[34px] items-center justify-center border-2 border-ink ${boxClass}`}>
        <PixelIcon name="play" size={18} className="text-white" />
      </span>
    </div>
  )
}
