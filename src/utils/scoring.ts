import type { FocusSession, DayProgress } from '../app/types'

export function calculateSessionPoints(session: FocusSession): number {
  let points = session.actualMinutes

  if (session.noYoutube) points += 25
  if (session.mode === 'soft_start') points += 15
  if (session.actualMinutes >= 60) points += 25
  if (session.actualMinutes >= 120) points += 75
  if (session.focusQuality >= 4) points += 20

  return points
}

export function calculateSessionCoins(session: FocusSession): number {
  const m = session.actualMinutes
  if (m >= 120) return 70
  if (m >= 90) return 50
  if (m >= 60) return 30
  if (m >= 45) return 20
  if (m >= 25) return 10
  return 5
}

export function calculateDayBonus(day: DayProgress): { points: number; coins: number } {
  if (day.completedMinutes >= day.goalMinutes) {
    return { points: 50, coins: 100 }
  }
  return { points: 0, coins: 0 }
}

export function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / 500) + 1
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Open Project',
  2: 'Soft Starter',
  3: 'Loop Breaker',
  4: 'Arrangement Worker',
  5: 'Mix Survivor',
  6: 'Export Hunter',
  7: 'Release Candidate',
  8: 'Closed Version',
  9: 'End of Loop',
  10: '100h Finisher',
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level, 10)] ?? '100h Finisher'
}

export function calculateStreak(days: DayProgress[]): { current: number; longest: number } {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date))
  let current = 0
  let longest = 0
  let streak = 0
  const today = new Date().toISOString().split('T')[0]

  for (const day of sorted) {
    if (day.date > today) continue
    if (day.completedMinutes >= day.goalMinutes) {
      streak++
      if (streak > longest) longest = streak
    } else {
      if (current === 0) current = streak
      streak = 0
    }
  }
  if (current === 0) current = streak

  return { current, longest }
}
