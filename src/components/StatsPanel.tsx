import { useStore } from '../app/store'
import { formatMinutes, formatHours } from '../utils/time'
import { WORK_MODE_LABELS } from './FocusTimer'
import type { WorkMode } from '../app/types'

export function StatsPanel() {
  const { days, totalPoints, streak, longestStreak } = useStore()

  const allSessions = days.flatMap(d => d.sessions)
  const totalMinutes = days.reduce((s, d) => s + d.completedMinutes, 0)
  const completedDays = days.filter(d => d.status === 'completed' || d.status === 'overcompleted').length
  const bestDay = days.reduce((best, d) => d.completedMinutes > best.completedMinutes ? d : best, days[0])
  const sessionsNoYT = allSessions.filter(s => s.noYoutube).length

  const modeMinutes: Record<string, number> = {}
  for (const s of allSessions) {
    modeMinutes[s.mode] = (modeMinutes[s.mode] ?? 0) + s.actualMinutes
  }
  const sortedModes = Object.entries(modeMinutes).sort((a, b) => b[1] - a[1])
  const maxModeMin = sortedModes[0]?.[1] ?? 1

  const avgMoodBefore = avg(allSessions.map(s => s.focusQuality))

  // bar chart data — last 14 days
  const today = new Date()
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })
  const dayMap = new Map(days.map(d => [d.date, d]))
  const maxMin = Math.max(...last14.map(date => dayMap.get(date)?.completedMinutes ?? 0), 300)

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Statistics</h2>

      {/* key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Hours" value={formatHours(totalMinutes)} />
        <StatCard label="Total Points" value={totalPoints.toLocaleString()} />
        <StatCard label="Current Streak" value={`${streak}d`} />
        <StatCard label="Longest Streak" value={`${longestStreak}d`} />
        <StatCard label="Days Completed" value={`${completedDays}`} />
        <StatCard label="Sessions" value={allSessions.length} />
        <StatCard label="No-YT Sessions" value={sessionsNoYT} />
        <StatCard label="Avg Focus Q" value={avgMoodBefore.toFixed(1)} />
      </div>

      {/* bar chart */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Last 14 Days</p>
        <div className="flex items-end gap-1 h-24">
          {last14.map(date => {
            const d = dayMap.get(date)
            const min = d?.completedMinutes ?? 0
            const h = Math.round((min / maxMin) * 100)
            const isToday = date === today.toISOString().split('T')[0]
            const isCompleted = d?.status === 'completed' || d?.status === 'overcompleted'
            const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric' })
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday ? 'bg-accent shadow-glow-sm' :
                      isCompleted ? 'bg-success/70' :
                      min > 0 ? 'bg-accent/40' : 'bg-border'
                    }`}
                    style={{ height: `${Math.max(h, min > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-xs text-subtle">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* modes */}
      {sortedModes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Time by Mode</p>
          <div className="space-y-1.5">
            {sortedModes.map(([mode, min]) => (
              <div key={mode} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">{WORK_MODE_LABELS[mode as WorkMode] ?? mode}</span>
                  <span className="font-mono-num text-text">{formatMinutes(min)}</span>
                </div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent/60 rounded-full"
                    style={{ width: `${Math.round((min / maxModeMin) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bestDay && bestDay.completedMinutes > 0 && (
        <div className="p-3 bg-bg border border-border rounded-xl">
          <p className="text-xs text-muted">Best Day</p>
          <p className="font-mono-num text-accent font-semibold">
            Day {bestDay.dayNumber} — {formatMinutes(bestDay.completedMinutes)}
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-bg border border-border rounded-xl p-3 space-y-0.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-mono-num text-lg font-bold text-text">{value}</p>
    </div>
  )
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}
