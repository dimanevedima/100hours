import { X } from 'lucide-react'
import { useStore } from '../app/store'
import { formatDisplayDate, formatMinutes } from '../utils/time'

interface Props {
  dayId: string
  onClose: () => void
}

export function DayModal({ dayId, onClose }: Props) {
  const day = useStore(s => s.days.find(d => d.id === dayId))
  const setDayMinutes = useStore(s => s.setDayMinutes)

  if (!day) return null

  const pct = Math.min(100, Math.round((day.completedMinutes / day.goalMinutes) * 100))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-glow-sm animate-slide-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text">Day {day.dayNumber}</h2>
            <p className="mt-1 text-sm text-muted">{formatDisplayDate(day.date)}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface2 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-8 text-center">
          <div className="font-mono-num text-5xl font-bold text-accent">{formatMinutes(day.completedMinutes)}</div>
          <div className="mt-2 font-mono-num text-sm text-muted">
            {formatMinutes(day.completedMinutes)} / {formatMinutes(day.goalMinutes)} · {pct}%
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={day.goalMinutes}
            step={15}
            value={day.completedMinutes}
            onChange={event => setDayMinutes(day.id, Number(event.target.value))}
            aria-label={`Progress for Day ${day.dayNumber}`}
            className="mini-slider w-full cursor-pointer"
          />
          <div className="flex justify-between font-mono-num text-xs text-muted">
            <span>0h</span>
            <span>5h</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 h-11 w-full rounded-xl bg-accent font-semibold text-bg transition-colors hover:bg-accent-dim focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  )
}
