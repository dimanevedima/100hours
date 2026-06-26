import { Award, CalendarCheck, Flame, Target } from 'lucide-react'
import { useStore } from '../app/store'
import { formatHours, formatMinutes } from '../utils/time'

type AwardCardData = {
  id: string
  title: string
  description: string
  progress: string
  unlocked: boolean
  icon: React.ReactNode
}

const MILESTONES = [
  { title: 'First 15 Minutes', minutes: 15 },
  { title: 'First Hour', minutes: 60 },
  { title: '5 Hours Total', minutes: 300 },
  { title: '10 Hours Total', minutes: 600 },
  { title: '25 Hours Total', minutes: 1500 },
  { title: '50 Hours Total', minutes: 3000 },
  { title: '75 Hours Total', minutes: 4500 },
  { title: '100 Hours', minutes: 6000 },
]

const STREAKS = [
  { title: '3-Day Streak', days: 3 },
  { title: '7-Day Streak', days: 7 },
  { title: '14-Day Streak', days: 14 },
  { title: '20-Day Streak', days: 20 },
]

export function AchievementsPanel() {
  const { days, longestStreak } = useStore()
  const totalMinutes = days.reduce((sum, day) => sum + day.completedMinutes, 0)

  const milestoneAwards = MILESTONES.map(milestone => ({
    id: `milestone-${milestone.minutes}`,
    title: milestone.title,
    description: `Reach ${formatHours(milestone.minutes)} total.`,
    progress: `${formatHours(Math.min(totalMinutes, milestone.minutes))} / ${formatHours(milestone.minutes)}`,
    unlocked: totalMinutes >= milestone.minutes,
    icon: <Target className="h-5 w-5" />,
  }))

  const closedDayAwards = days.map(day => ({
    id: `day-${day.dayNumber}`,
    title: `Day ${day.dayNumber} Closed`,
    description: `Complete 5 hours on Day ${day.dayNumber}.`,
    progress: `Day ${day.dayNumber}: ${formatMinutes(day.completedMinutes)} / ${formatMinutes(day.goalMinutes)}`,
    unlocked: day.completedMinutes >= day.goalMinutes,
    icon: <CalendarCheck className="h-5 w-5" />,
  }))

  const streakAwards = STREAKS.map(streak => ({
    id: `streak-${streak.days}`,
    title: streak.title,
    description: `Close ${streak.days} days in a row.`,
    progress: `${Math.min(longestStreak, streak.days)} / ${streak.days} days`,
    unlocked: longestStreak >= streak.days,
    icon: <Flame className="h-5 w-5" />,
  }))

  const allAwards = [...milestoneAwards, ...closedDayAwards, ...streakAwards]
  const unlockedCount = allAwards.filter(award => award.unlocked).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-sm font-semibold uppercase tracking-wider text-muted">Awards</h1>
        <span className="font-mono-num text-sm text-accent">{unlockedCount} / {allAwards.length}</span>
      </div>

      <AwardGroup title="Milestones" awards={milestoneAwards} />
      <AwardGroup title="Closed Days" awards={closedDayAwards} />
      <AwardGroup title="Streaks" awards={streakAwards} />
    </div>
  )
}

function AwardGroup({ title, awards }: { title: string; awards: AwardCardData[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {awards.map(award => (
          <AwardCard key={award.id} award={award} />
        ))}
      </div>
    </section>
  )
}

function AwardCard({ award }: { award: AwardCardData }) {
  return (
    <div
      className={`flex min-h-24 items-start gap-3 rounded-xl border p-3 transition-colors
        ${award.unlocked
          ? 'border-accent/50 bg-accent/10'
          : 'border-border bg-surface opacity-60'
        }`}
    >
      <div className={`mt-0.5 ${award.unlocked ? 'text-accent' : 'text-subtle'}`}>
        {award.icon ?? <Award className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${award.unlocked ? 'text-text' : 'text-muted'}`}>{award.title}</div>
        <div className="mt-0.5 text-xs text-muted">{award.description}</div>
        <div className="mt-2 font-mono-num text-xs text-accent">{award.progress}</div>
      </div>
    </div>
  )
}
