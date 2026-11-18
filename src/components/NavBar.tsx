import PixelIcon from './PixelIcon'

export type Tab = 'home' | 'notebook' | 'analysis'

const TABS: { id: Tab; label: string; icon: 'home' | 'note' | 'chart' }[] = [
  { id: 'home', label: 'ホーム', icon: 'home' },
  { id: 'notebook', label: '間違いノート', icon: 'note' },
  { id: 'analysis', label: '分析', icon: 'chart' },
]

/**
 * 下部ナビ。ホームは海の上に重ねる暗い半透明（scene）、ほかの画面は白地（plain）。
 * アイコンはドット絵（PixelIcon）。色は CSS でつける。
 */
export default function NavBar({ tab, onChange, variant }: { tab: Tab; onChange: (t: Tab) => void; variant: 'scene' | 'plain' }) {
  const scene = variant === 'scene'
  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-10 pb-[env(safe-area-inset-bottom)] ${
        scene ? 'bg-[rgba(12,14,36,.5)]' : 'border-t-[3px] border-ink bg-white'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[480px]">
        {TABS.map((t) => {
          const active = tab === t.id
          const color = scene ? (active ? '#FFFFFF' : '#C9CEE6') : active ? 'var(--primary)' : 'var(--sub)'
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={active ? 'page' : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold"
              style={{ color }}
            >
              <PixelIcon name={t.icon} size={24} />
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
