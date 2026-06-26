import { CheckCircle2, Trophy, Flame, Circle } from 'lucide-react'
import type { DayProgress } from '../app/types'
import { formatMinutes } from '../utils/time'
import { todayISO } from '../utils/time'

interface Props {
  day: DayProgress
  onClick: () => void
}

const STATUS_STYLES: Record<DayProgress['status'], string> = {
  empty: 'border-border bg-surface hover:border-subtle',
  started: 'border-warning/40 bg-surface hover:border-warning/60',
  partial: 'border-accent/40 bg-surface hover:border-accent/60',
  completed: 'border-success/60 bg-success/5 hover:border-success shadow-glow-sm',
  overcompleted: 'border-orange/60 bg-orange/5 hover:border-orange shadow-glow-orange',
  skipped: 'border-border/40 bg-bg opacity-50 hover:opacity-70',
}

export function DayCell({ day, onClick }: Props) {
  const today = todayISO()
  const isToday = day.date === today
  const isFuture = day.date > today
  const pct = Math.min(100, Math.round((day.completedMinutes / day.goalMinutes) * 100))
  const displayDate = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const barColor =
    day.status === 'completed' || day.status === 'overcompleted' ? 'bg-success' :
    day.status === 'partial' ? 'bg-accent' :
    day.status === 'started' ? 'bg-warning' : 'bg-subtle'

  return (
    <button
      onClick={onClick}
      aria-label={`Day ${day.dayNumber} — ${displayDate}`}
      className={`
        relative rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer
        ${STATUS_STYLES[day.status]}
        ${isToday ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg' : ''}
        ${isFuture ? 'opacity-40' : ''}
        focus:outline-none focus:ring-2 focus:ring-accent
      `}
    >
      {/* day number + badge */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className={`text-xs font-semibold ${isToday ? 'text-accent text-glow' : 'text-muted'}`}>
            Day {day.dayNumber}
          </div>
          <div className="text-xs text-subtle">{displayDate}</div>
        </div>
        <StatusIcon status={day.status} isToday={isToday} />
      </div>

      {/* time */}
      <div className="font-mono-num text-sm font-semibold text-text mb-2">
        {day.completedMinutes > 0 ? formatMinutes(day.completedMinutes) : (isFuture ? '—' : '0m')}
        <span className="text-subtle font-normal"> / {formatMinutes(day.goalMinutes)}</span>
      </div>

      {/* mini progress bar */}
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* today indicator */}
      {isToday && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-pulse-glow" />
      )}
    </button>
  )
}

function StatusIcon({ status, isToday }: { status: DayProgress['status']; isToday: boolean }) {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-success" />
  if (status === 'overcompleted') return <Trophy className="w-4 h-4 text-orange" />
  if (status === 'started' || status === 'partial') return <Flame className="w-4 h-4 text-warning" />
  if (isToday) return <Circle className="w-4 h-4 text-accent" />
  return null
}
