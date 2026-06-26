import type { Achievement, AppState, FocusSession, DayProgress } from '../app/types'

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_contact', title: 'First Contact', description: 'Completed your first focus session', icon: 'Zap' },
  { id: 'fifteen_minutes', title: '15 Minutes Count', description: 'Logged a 15-minute session on an anxious day', icon: 'Clock' },
  { id: 'no_youtube', title: 'No YouTube Block', description: 'Completed a session without YouTube', icon: 'Youtube' },
  { id: 'deep_work_1h', title: 'Deep Work 1h', description: 'Completed a 60+ minute session', icon: 'Brain' },
  { id: 'two_hour', title: 'Two-Hour Session', description: 'Completed a 120+ minute session', icon: 'Timer' },
  { id: 'five_hour_day', title: 'Five-Hour Day', description: 'Reached 5 hours in a single day', icon: 'Trophy' },
  { id: 'streak_3', title: 'Three-Day Streak', description: 'Worked 3 days in a row', icon: 'Flame' },
  { id: 'streak_7', title: 'Seven-Day Streak', description: 'Worked 7 days in a row', icon: 'Flame' },
  { id: 'first_export', title: 'First Export', description: 'Completed an Export session', icon: 'Download' },
  { id: 'release_candidate', title: 'Release Candidate', description: 'Completed a Release Candidate export', icon: 'Star' },
  { id: 'halfway', title: 'Halfway', description: 'Reached 50 hours total', icon: 'Target' },
  { id: 'end_of_loop', title: 'End of Loop', description: 'Completed all 100 hours!', icon: 'Award' },
  { id: 'comeback', title: 'Comeback', description: 'Returned after a skipped day', icon: 'RotateCcw' },
  { id: 'mixing_fear', title: 'Mixing Fear Faced', description: 'Completed a Mixing session', icon: 'Music' },
  { id: 'distribution_step', title: 'Distribution Step', description: 'Completed a Distribution session', icon: 'Send' },
  { id: 'cover_done', title: 'Cover Done', description: 'Completed a Cover session', icon: 'Image' },
  { id: 'metadata_done', title: 'Metadata Done', description: 'Completed a Metadata session', icon: 'FileText' },
  { id: 'track_uploaded', title: 'Track Uploaded', description: 'Manually marked upload as complete', icon: 'Upload' },
]

export function checkAchievements(
  state: AppState,
  newSession: FocusSession,
  updatedDay: DayProgress,
  prevSkippedDays: number,
): string[] {
  const unlocked: string[] = []
  const already = new Set(state.achievements.filter(a => a.unlockedAt).map(a => a.id))
  const totalMinutes = state.days.reduce((s, d) => s + d.completedMinutes, 0) + newSession.actualMinutes

  const check = (id: string, condition: boolean) => {
    if (condition && !already.has(id)) unlocked.push(id)
  }

  const allSessions = state.days.flatMap(d => d.sessions)
  const sessionCount = allSessions.length + 1

  check('first_contact', sessionCount === 1)
  check('fifteen_minutes', newSession.actualMinutes <= 20)
  check('no_youtube', newSession.noYoutube)
  check('deep_work_1h', newSession.actualMinutes >= 60)
  check('two_hour', newSession.actualMinutes >= 120)
  check('five_hour_day', updatedDay.completedMinutes >= updatedDay.goalMinutes)
  check('streak_3', state.streak >= 3)
  check('streak_7', state.streak >= 7)
  check('first_export', newSession.mode === 'export')
  check('release_candidate', newSession.mode === 'export' && newSession.focusQuality >= 4)
  check('halfway', totalMinutes >= 3000)
  check('end_of_loop', totalMinutes >= 6000)
  check('comeback', prevSkippedDays > 0)
  check('mixing_fear', newSession.mode === 'mixing')
  check('distribution_step', newSession.mode === 'distribution')
  check('cover_done', newSession.mode === 'cover')
  check('metadata_done', newSession.mode === 'metadata')

  return unlocked
}
