import { useState, useEffect } from 'react'
import {
  LayoutGrid, Timer, BarChart2, Disc, Trophy, Settings, Zap, Sun, Moon,
} from 'lucide-react'
import { ProgressHeader } from '../components/ProgressHeader'
import { ChallengeCalendar } from '../components/ChallengeCalendar'
import { FocusTimer } from '../components/FocusTimer'
import { StatsPanel } from '../components/StatsPanel'
import { ReleaseBoard } from '../components/ReleaseBoard'
import { AchievementsPanel } from '../components/AchievementsPanel'
import { SettingsPanel } from '../components/SettingsPanel'
import { useStore } from './store'
import type { ActiveView } from './types'

const NAV_ITEMS: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'timer',     label: 'Focus',     icon: <Timer className="w-5 h-5" /> },
  { id: 'stats',     label: 'Stats',     icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'release',   label: 'Release',   icon: <Disc className="w-5 h-5" /> },
  { id: 'achievements', label: 'Awards', icon: <Trophy className="w-5 h-5" /> },
  { id: 'settings',  label: 'Settings',  icon: <Settings className="w-5 h-5" /> },
]

export default function App() {
  const [view, setView] = useState<ActiveView>('dashboard')
  const { settings, updateSettings } = useStore()

  const isDark = settings.theme === 'dark'

  // Apply theme attribute to <html> whenever it changes
  useEffect(() => {
    const el = document.documentElement
    if (isDark) {
      el.removeAttribute('data-theme')
    } else {
      el.setAttribute('data-theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () =>
    updateSettings({ theme: isDark ? 'light' : 'dark' })

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* top nav */}
      <header className="sticky top-0 z-40 bg-header-glass backdrop-blur border-b border-border transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <Zap className="w-5 h-5 text-accent" />
            <span className="font-mono font-bold text-text text-sm hidden sm:block">100 Hours</span>
          </div>

          <nav className="flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                aria-label={item.label}
                aria-current={view === item.id ? 'page' : undefined}
                className={`flex flex-col sm:flex-row items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer
                  ${view === item.id
                    ? 'text-accent bg-accent/10'
                    : 'text-muted hover:text-text hover:bg-surface2'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:block">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="shrink-0 p-2 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-all duration-150 cursor-pointer"
          >
            {isDark
              ? <Sun className="w-5 h-5" />
              : <Moon className="w-5 h-5" />
            }
          </button>
        </div>
      </header>

      {/* main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {view === 'dashboard' && (
          <>
            <ProgressHeader />
            <ChallengeCalendar />
            <TodayCard onStartSession={() => setView('timer')} />
          </>
        )}
        {view === 'timer'        && <FocusTimer onBack={() => setView('dashboard')} />}
        {view === 'stats'        && <StatsPanel />}
        {view === 'release'      && <ReleaseBoard />}
        {view === 'achievements' && <AchievementsPanel />}
        {view === 'settings'     && <SettingsPanel />}
      </main>
    </div>
  )
}

function TodayCard({ onStartSession }: { onStartSession: () => void }) {
  const PHRASES = [
    '15 минут достаточно, чтобы войти.',
    'Сегодня цель — контакт, не идеал.',
    'Поток приходит после начала.',
    'Я не обязан доделать. Я обязан только начать.',
    'Один экспорт лучше, чем бесконечная демка.',
  ]
  const phrase = PHRASES[new Date().getDay() % PHRASES.length]

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <p className="text-muted text-sm italic">"{phrase}"</p>
      <button
        onClick={onStartSession}
        className="flex items-center gap-2 px-5 py-3 bg-accent rounded-xl text-white font-bold cursor-pointer hover:bg-accent-dim transition-all shadow-glow animate-pulse-glow"
      >
        <Zap className="w-5 h-5" />
        Start Focus Session
      </button>
    </div>
  )
}
