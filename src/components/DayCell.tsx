import type { DayProgress } from '../app/types'
import { formatDisplayDateShort, formatMinutes, todayISO } from '../utils/time'

interface Props {
  day: DayProgress
  onClick: () => void
}

export function DayCell({ day, onClick }: Props) {
  const pct = Math.min(100, Math.round((day.completedMinutes / day.goalMinutes) * 100))
  const isToday = day.date === todayISO()
  const isCompleted = day.completedMinutes >= day.goalMinutes

  return (
    <button
      onClick={onClick}
      aria-label={`Day ${day.dayNumber}, ${formatMinutes(day.completedMinutes)} of ${formatMinutes(day.goalMinutes)}`}
      className={`relative min-h-36 overflow-hidden rounded-2xl border bg-surface p-4 text-left transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent
        ${isCompleted ? 'border-accent/70' : 'border-border hover:border-accent/60'}
        ${isToday ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''}
      `}
    >
      <div
        className="absolute inset-y-0 left-0 bg-accent/20 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-60" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-text">Day {day.dayNumber}</div>
          <div className="mt-1 text-sm text-muted">{formatDisplayDateShort(day.date)}</div>
        </div>

        <div>
          <div className="font-mono-num text-lg font-semibold text-text">
            {formatMinutes(day.completedMinutes)}
            <span className="text-sm font-normal text-muted"> / {formatMinutes(day.goalMinutes)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  )
}
