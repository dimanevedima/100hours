import { useEffect, useState } from 'react'
import { LayoutGrid, Moon, Sun, Trophy } from 'lucide-react'
import { AchievementsPanel } from '../components/AchievementsPanel'
import { ChallengeCalendar } from '../components/ChallengeCalendar'
import { ProgressHeader } from '../components/ProgressHeader'
import { useStore } from './store'
import type { ActiveView } from './types'

const NAV_ITEMS: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'achievements', label: 'Awards', icon: <Trophy className="h-4 w-4" /> },
]

export default function App() {
  const [view, setView] = useState<ActiveView>('dashboard')
  const { settings, updateSettings } = useStore()
  const isDark = settings.theme === 'dark'

  useEffect(() => {
    const el = document.documentElement
    if (isDark) {
      el.removeAttribute('data-theme')
    } else {
      el.setAttribute('data-theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => updateSettings({ theme: isDark ? 'light' : 'dark' })

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-header-glass backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <div className="font-mono text-sm font-bold text-text">100 Hours</div>

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                aria-current={view === item.id ? 'page' : undefined}
                className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent
                  ${view === item.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:bg-surface2 hover:text-text'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface2 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-5">
        {view === 'dashboard' && (
          <>
            <ProgressHeader />
            <ChallengeCalendar />
          </>
        )}
        {view === 'achievements' && <AchievementsPanel />}
      </main>
    </div>
  )
}
