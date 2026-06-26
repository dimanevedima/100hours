import { useStore } from '../app/store'
import { getLevelName } from '../utils/scoring'
import { formatHours } from '../utils/time'

export function ProgressHeader() {
  const { challenge, days, totalCoins, streak } = useStore()
  const totalMinutes = days.reduce((sum, day) => sum + day.completedMinutes, 0)
  const goalMinutes = challenge.totalGoalHours * 60
  const pct = Math.min(100, Math.round((totalMinutes / goalMinutes) * 100))
  const currentDay = days.find(day => day.completedMinutes < day.goalMinutes)?.dayNumber ?? challenge.daysCount
  const level = Math.min(10, Math.floor(totalMinutes / 600) + 1)
  const levelName = getLevelName(level)

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold text-text">{challenge.title}</h1>
          <p className="mt-1 text-sm text-muted">{levelName}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4 sm:text-right">
          <Stat label="Day" value={`${currentDay} / ${challenge.daysCount}`} />
          <Stat label="Streak" value={`${streak}d`} />
          <Stat label="Coins" value={totalCoins.toLocaleString()} />
          <Stat label="Level" value={level} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono-num text-lg font-semibold text-accent">{formatHours(totalMinutes)}</span>
          <span className="font-mono-num text-sm text-muted">
            {challenge.totalGoalHours}h · {pct}%
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full border border-border bg-bg">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="font-mono-num text-sm font-semibold text-text">{value}</div>
    </div>
  )
}
