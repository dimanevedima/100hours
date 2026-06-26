import {
  Zap, Clock, Youtube, Brain, Timer, Trophy, Flame,
  Download, Star, Target, Award, RotateCcw, Music,
  Send, Image, FileText, Upload,
} from 'lucide-react'
import { useStore } from '../app/store'
import type { Achievement } from '../app/types'

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Youtube: <Youtube className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Timer: <Timer className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Download: <Download className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  RotateCcw: <RotateCcw className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Send: <Send className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Upload: <Upload className="w-5 h-5" />,
}

function AchievementCard({ a }: { a: Achievement }) {
  const unlocked = !!a.unlockedAt
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all
        ${unlocked
          ? 'border-accent/40 bg-accent/5'
          : 'border-border bg-surface opacity-50 grayscale'
        }`}
    >
      <div className={`mt-0.5 ${unlocked ? 'text-accent' : 'text-subtle'}`}>
        {ICON_MAP[a.icon] ?? <Award className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${unlocked ? 'text-text' : 'text-muted'}`}>{a.title}</p>
        <p className="text-xs text-muted">{a.description}</p>
        {unlocked && a.unlockedAt && (
          <p className="text-xs text-subtle mt-0.5">
            {new Date(a.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      {unlocked && (
        <div className="ml-auto shrink-0">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
        </div>
      )}
    </div>
  )
}

export function AchievementsPanel() {
  const achievements = useStore(s => s.achievements)
  const unlocked = achievements.filter(a => a.unlockedAt).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Achievements</h2>
        <span className="text-xs font-mono-num text-accent">{unlocked} / {achievements.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {achievements.map(a => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  )
}
