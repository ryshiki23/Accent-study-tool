export type Tab = 'home' | 'notebook' | 'analysis'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '🏠' },
  { id: 'notebook', label: '間違いノート', icon: '📒' },
  { id: 'analysis', label: '分析', icon: '📊' },
]

export default function NavBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-white/60 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-[480px]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold ${
              tab === t.id ? 'text-indigo-600' : 'text-slate-400'
            }`}
          >
            <span className={`text-xl ${tab === t.id ? '' : 'opacity-60 grayscale'}`}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
