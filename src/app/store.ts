import { create } from 'zustand'
import { nanoid } from './nanoid'
import type {
  AppState,
  AppSettings,
  Challenge,
  DayProgress,
  FocusSession,
  WorkMode,
  ReleaseBoard,
} from './types'
import { saveState, loadState } from '../utils/storage'
import { calculateSessionPoints, calculateSessionCoins, calculateDayBonus, calculateStreak } from '../utils/scoring'
import { ALL_ACHIEVEMENTS, checkAchievements } from '../utils/achievements'
import { todayISO, addDays } from '../utils/time'

function buildDefaultReleaseBoard(): ReleaseBoard {
  return {
    track: [
      { id: nanoid(), label: 'Arrangement', done: false },
      { id: nanoid(), label: 'Transitions', done: false },
      { id: nanoid(), label: 'Sound Design', done: false },
      { id: nanoid(), label: 'Rough Mix', done: false },
      { id: nanoid(), label: 'Final Mix', done: false },
      { id: nanoid(), label: 'Export WAV', done: false },
      { id: nanoid(), label: 'Reference Check', done: false },
      { id: nanoid(), label: 'Release Candidate', done: false },
    ],
    artwork: [
      { id: nanoid(), label: 'Idea', done: false },
      { id: nanoid(), label: 'Draft', done: false },
      { id: nanoid(), label: 'Final Cover', done: false },
      { id: nanoid(), label: '3000×3000 Export', done: false },
    ],
    distribution: [
      { id: nanoid(), label: 'Artist Name', done: false },
      { id: nanoid(), label: 'Track Title', done: false },
      { id: nanoid(), label: 'Genre', done: false },
      { id: nanoid(), label: 'Explicit Tag', done: false },
      { id: nanoid(), label: 'ISRC / UPC', done: false },
      { id: nanoid(), label: 'Distributor', done: false },
      { id: nanoid(), label: 'Release Date', done: false },
      { id: nanoid(), label: 'Uploaded', done: false },
      { id: nanoid(), label: 'Approved', done: false },
      { id: nanoid(), label: 'Released', done: false },
    ],
  }
}

function buildDays(startDate: string, daysCount: number, dailyGoalHours: number): DayProgress[] {
  return Array.from({ length: daysCount }, (_, i) => ({
    id: nanoid(),
    date: addDays(startDate, i),
    dayNumber: i + 1,
    goalMinutes: dailyGoalHours * 60,
    completedMinutes: 0,
    sessions: [],
    status: 'empty' as const,
  }))
}

function buildInitialState(): AppState {
  const startDate = todayISO()
  const settings: AppSettings = {
    startDate,
    totalHoursGoal: 100,
    daysCount: 20,
    dailyGoalHours: 5,
    defaultSessionMinutes: 45,
    enableCoins: true,
    enableAchievements: true,
    enableSupportivePhrases: true,
    theme: 'dark',
    noiseReminderEnabled: true,
    strictMode: false,
  }
  const challenge: Challenge = {
    id: nanoid(),
    title: '100 Hours',
    totalGoalHours: 100,
    daysCount: 20,
    dailyGoalHours: 5,
    startDate,
    createdAt: new Date().toISOString(),
  }
  return {
    challenge,
    days: buildDays(startDate, 20, 5),
    achievements: ALL_ACHIEVEMENTS.map(a => ({ ...a })),
    settings,
    releaseBoard: buildDefaultReleaseBoard(),
    totalPoints: 0,
    totalCoins: 0,
    streak: 0,
    longestStreak: 0,
  }
}

function getDayStatus(completedMinutes: number, goalMinutes: number, date: string): DayProgress['status'] {
  const today = todayISO()
  if (completedMinutes === 0) {
    if (date < today) return 'skipped'
    return 'empty'
  }
  if (completedMinutes < goalMinutes * 0.5) return 'started'
  if (completedMinutes < goalMinutes) return 'partial'
  if (completedMinutes >= goalMinutes * 1.0) {
    if (completedMinutes > goalMinutes) return 'overcompleted'
    return 'completed'
  }
  return 'partial'
}

function recalculateProgress(days: DayProgress[]): Pick<AppState, 'totalPoints' | 'totalCoins' | 'streak' | 'longestStreak'> {
  const totals = days.reduce(
    (acc, day) => {
      for (const session of day.sessions) {
        acc.points += calculateSessionPoints(session)
        acc.coins += calculateSessionCoins(session)
      }

      const dayBonus = calculateDayBonus(day)
      acc.points += dayBonus.points
      acc.coins += dayBonus.coins

      return acc
    },
    { points: 0, coins: 0 },
  )

  const { current, longest } = calculateStreak(days)
  let streakBonus = 0
  if (longest >= 3) streakBonus += 100
  if (longest >= 7) streakBonus += 250

  return {
    totalPoints: totals.points + streakBonus,
    totalCoins: totals.coins,
    streak: current,
    longestStreak: longest,
  }
}

interface StoreActions {
  addSession: (dayId: string, session: Omit<FocusSession, 'id'>) => string[]
  addQuickTime: (dayId: string, minutes: number, mode: WorkMode) => void
  deleteSession: (dayId: string, sessionId: string) => void
  updateDayNote: (dayId: string, note: string) => void
  toggleReleaseItem: (section: keyof ReleaseBoard, itemId: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  resetChallenge: () => void
  loadFromState: (state: AppState) => void
  getDay: (dayId: string) => DayProgress | undefined
  getTodayDay: () => DayProgress | undefined
}

type Store = AppState & StoreActions

export const useStore = create<Store>((set, get) => {
  const persisted = loadState()
  const initial = persisted ?? buildInitialState()

  return {
    ...initial,

    addSession: (dayId, sessionData) => {
      const state = get()
      const dayIdx = state.days.findIndex(d => d.id === dayId)
      if (dayIdx === -1) return []

      const session: FocusSession = { ...sessionData, id: nanoid() }
      const day = state.days[dayIdx]
      const newCompleted = day.completedMinutes + session.actualMinutes
      const newStatus = getDayStatus(newCompleted, day.goalMinutes, day.date)

      const updatedDay: DayProgress = {
        ...day,
        completedMinutes: newCompleted,
        sessions: [...day.sessions, session],
        status: newStatus,
      }

      const sessionPoints = calculateSessionPoints(session)
      const sessionCoins = calculateSessionCoins(session)
      const dayBonus = newStatus === 'completed' && day.status !== 'completed'
        ? calculateDayBonus(updatedDay)
        : { points: 0, coins: 0 }

      const newDays = state.days.map((d, i) => i === dayIdx ? updatedDay : d)
      const { current, longest } = calculateStreak(newDays)

      let streakBonus = 0
      if (current === 3) streakBonus = 100
      if (current === 7) streakBonus = 250

      const newPoints = state.totalPoints + sessionPoints + dayBonus.points + streakBonus
      const newCoins = state.totalCoins + sessionCoins + dayBonus.coins

      const prevSkippedDays = state.days.filter(d => d.status === 'skipped').length

      const newState: AppState = {
        ...state,
        days: newDays,
        totalPoints: newPoints,
        totalCoins: newCoins,
        streak: current,
        longestStreak: Math.max(state.longestStreak, longest),
      }

      const newlyUnlocked = checkAchievements(newState, session, updatedDay, prevSkippedDays)
      const now = new Date().toISOString()
      const updatedAchievements = newState.achievements.map(a =>
        newlyUnlocked.includes(a.id) ? { ...a, unlockedAt: now } : a,
      )

      const finalState = { ...newState, achievements: updatedAchievements }
      set(finalState)
      saveState(finalState)
      return newlyUnlocked
    },

    addQuickTime: (dayId, minutes, mode) => {
      const now = new Date().toISOString()
      get().addSession(dayId, {
        date: todayISO(),
        startedAt: now,
        endedAt: now,
        plannedMinutes: minutes,
        actualMinutes: minutes,
        mode,
        focusQuality: 3,
        noYoutube: false,
        usedNoise: false,
        note: `Quick log: ${minutes} min`,
      })
    },

    deleteSession: (dayId, sessionId) => {
      const state = get()
      const dayIdx = state.days.findIndex(d => d.id === dayId)
      if (dayIdx === -1) return

      const day = state.days[dayIdx]
      const sessions = day.sessions.filter(s => s.id !== sessionId)
      if (sessions.length === day.sessions.length) return

      const completedMinutes = sessions.reduce((sum, session) => sum + session.actualMinutes, 0)
      const updatedDay: DayProgress = {
        ...day,
        completedMinutes,
        sessions,
        status: getDayStatus(completedMinutes, day.goalMinutes, day.date),
      }
      const days = state.days.map((d, i) => i === dayIdx ? updatedDay : d)
      const next = {
        ...state,
        days,
        ...recalculateProgress(days),
      }

      set(next)
      saveState(next)
    },

    updateDayNote: (dayId, note) => {
      const state = get()
      const newDays = state.days.map(d => d.id === dayId ? { ...d, note } : d)
      const next = { ...state, days: newDays }
      set(next)
      saveState(next)
    },

    toggleReleaseItem: (section, itemId) => {
      const state = get()
      const newBoard = {
        ...state.releaseBoard,
        [section]: state.releaseBoard[section].map(item =>
          item.id === itemId ? { ...item, done: !item.done } : item,
        ),
      }
      const next = { ...state, releaseBoard: newBoard }
      set(next)
      saveState(next)
    },

    updateSettings: (partial) => {
      const state = get()
      const newSettings = { ...state.settings, ...partial }
      let newDays = state.days
      let newChallenge = state.challenge

      if (
        partial.startDate !== undefined ||
        partial.daysCount !== undefined ||
        partial.dailyGoalHours !== undefined
      ) {
        const sd = newSettings.startDate
        const dc = newSettings.daysCount
        const dg = newSettings.dailyGoalHours
        newChallenge = { ...state.challenge, startDate: sd, daysCount: dc, dailyGoalHours: dg }

        const existingByDate = new Map(state.days.map(d => [d.date, d]))
        newDays = Array.from({ length: dc }, (_, i) => {
          const date = addDays(sd, i)
          return existingByDate.get(date) ?? {
            id: nanoid(),
            date,
            dayNumber: i + 1,
            goalMinutes: dg * 60,
            completedMinutes: 0,
            sessions: [],
            status: 'empty' as const,
          }
        })
      }

      const next = { ...state, settings: newSettings, days: newDays, challenge: newChallenge }
      set(next)
      saveState(next)
    },

    resetChallenge: () => {
      const fresh = buildInitialState()
      set(fresh)
      saveState(fresh)
    },

    loadFromState: (state) => {
      set(state)
      saveState(state)
    },

    getDay: (dayId) => get().days.find(d => d.id === dayId),
    getTodayDay: () => {
      const today = todayISO()
      return get().days.find(d => d.date === today)
    },
  }
})
