export type WorkMode =
  | 'soft_start'
  | 'arrangement'
  | 'mixing'
  | 'transitions'
  | 'sound_design'
  | 'export'
  | 'cover'
  | 'metadata'
  | 'distribution'
  | 'review'

export type DayStatus = 'empty' | 'started' | 'partial' | 'completed' | 'overcompleted' | 'skipped'

export interface Challenge {
  id: string
  title: string
  totalGoalHours: number
  daysCount: number
  dailyGoalHours: number
  startDate: string
  createdAt: string
}

export interface FocusSession {
  id: string
  date: string
  startedAt: string
  endedAt?: string
  plannedMinutes: number
  actualMinutes: number
  mode: WorkMode
  focusQuality: 1 | 2 | 3 | 4 | 5
  noYoutube: boolean
  usedNoise: boolean
  note: string
  nextStep?: string
}

export interface DayProgress {
  id: string
  date: string
  dayNumber: number
  goalMinutes: number
  completedMinutes: number
  sessions: FocusSession[]
  moodBefore?: number
  moodAfter?: number
  note?: string
  status: DayStatus
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
}

export type ReleaseBoardItem = {
  id: string
  label: string
  done: boolean
}

export interface ReleaseBoard {
  track: ReleaseBoardItem[]
  artwork: ReleaseBoardItem[]
  distribution: ReleaseBoardItem[]
}

export interface AppSettings {
  startDate: string
  totalHoursGoal: number
  daysCount: number
  dailyGoalHours: number
  defaultSessionMinutes: number
  enableCoins: boolean
  enableAchievements: boolean
  enableSupportivePhrases: boolean
  theme: 'dark' | 'light' | 'system'
  noiseReminderEnabled: boolean
  strictMode: boolean
}

export interface AppState {
  challenge: Challenge
  days: DayProgress[]
  achievements: Achievement[]
  settings: AppSettings
  releaseBoard: ReleaseBoard
  totalPoints: number
  totalCoins: number
  streak: number
  longestStreak: number
}

export type ActiveView = 'dashboard' | 'achievements' | 'settings'
