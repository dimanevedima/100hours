import { Flame, Coins, Zap, Calendar } from 'lucide-react'
import { useStore } from '../app/store'
import { calculateLevel, getLevelName } from '../utils/scoring'
import { formatHours } from '../utils/time'

export function ProgressHeader() {
  const { challenge, days, totalPoints, totalCoins, streak } = useStore()
  const totalMinutes = days.reduce((s, d) => s + d.completedMinutes, 0)
  const goalMinutes = challenge.totalGoalHours * 60
  const pct = Math.min(100, Math.round((totalMinutes / goalMinutes) * 100))
  const todayDay = days.find(d => d.date === new Date().toISOString().split('T')[0])
  const currentDayNum = todayDay?.dayNumber ?? 1
  const level = calculateLevel(totalPoints)
  const levelName = getLevelName(level)

  const progressColor =
    pct < 25 ? 'from-accent/60 to-accent' :
    pct < 50 ? 'from-accent to-accent' :
    pct < 75 ? 'from-accent to-teal-300' :
    'from-orange to-orange'

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      {/* top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono text-text">{challenge.title}</h1>
          <p className="text-sm text-muted mt-0.5">{levelName}</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <Stat icon={<Calendar className="w-4 h-4 text-accent" />} label="Day" value={`${currentDayNum} / ${challenge.daysCount}`} />
          <Stat icon={<Flame className="w-4 h-4 text-orange" />} label="Streak" value={`${streak}d`} />
          <Stat icon={<Coins className="w-4 h-4 text-warning" />} label="Coins" value={totalCoins.toLocaleString()} />
          <Stat icon={<Zap className="w-4 h-4 text-accent" />} label="Level" value={level} />
        </div>
      </div>

      {/* progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-mono-num text-accent font-semibold text-glow">
            {formatHours(totalMinutes)}
          </span>
          <span className="text-muted font-mono-num">{challenge.totalGoalHours}h · {pct}%</span>
        </div>
        <div className="h-3 bg-bg rounded-full overflow-hidden border border-border">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
            style={{ width: `${pct}%`, boxShadow: pct > 0 ? '0 0 12px rgba(20,184,166,0.4)' : 'none' }}
          />
        </div>
        <div className="flex justify-between text-xs text-subtle">
          <span>Start</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div className="text-right">
        <div className="text-xs text-muted leading-none">{label}</div>
        <div className="font-mono-num text-sm font-semibold text-text leading-tight">{value}</div>
      </div>
    </div>
  )
}
