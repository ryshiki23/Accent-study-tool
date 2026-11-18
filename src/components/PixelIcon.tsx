import { ICONS, type IconName } from './icons'

/** ドット絵アイコン。色は親の color（currentColor）。size は 9 の倍数がくっきり（24 も 3 倍画面ではちょうど 8px/マス） */
export default function PixelIcon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 9 9" width={size} height={size} shapeRendering="crispEdges" aria-hidden className={className}>
      {ICONS[name].flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  )
}
