import { useState } from 'react'
import { X, Plus, Clock, Zap, MessageSquare, ChevronRight, Trash2 } from 'lucide-react'
import { useStore } from '../app/store'
import { formatMinutes, formatDisplayDate, todayISO } from '../utils/time'
import { WORK_MODE_LABELS } from './FocusTimer'
import type { WorkMode } from '../app/types'

const QUICK_TIMES = [15, 25, 45, 60, 90, 120]

interface Props {
  dayId: string
  onClose: () => void
}

export function DayModal({ dayId, onClose }: Props) {
  const day = useStore(s => s.days.find(d => d.id === dayId))
  const addQuickTime = useStore(s => s.addQuickTime)
  const deleteSession = useStore(s => s.deleteSession)
  const updateDayNote = useStore(s => s.updateDayNote)
  const [note, setNote] = useState(day?.note ?? '')
  const [quickMode, setQuickMode] = useState<WorkMode>('arrangement')
  const [customMin, setCustomMin] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  if (!day) return null

  const pct = Math.min(100, Math.round((day.completedMinutes / day.goalMinutes) * 100))
  const isToday = day.date === todayISO()

  const handleQuick = (min: number) => {
    addQuickTime(dayId, min, quickMode)
    onClose()
  }

  const handleCustom = () => {
    const m = parseInt(customMin)
    if (m > 0 && m <= 480) {
      addQuickTime(dayId, m, quickMode)
      onClose()
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Delete this recorded time?')) {
      deleteSession(dayId, sessionId)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-text">Day {day.dayNumber}</h2>
            <p className="text-sm text-muted">{formatDisplayDate(day.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface2 text-muted hover:text-text transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-mono-num text-accent font-semibold">{formatMinutes(day.completedMinutes)}</span>
              <span className="text-muted font-mono-num">Goal: {formatMinutes(day.goalMinutes)} · {pct}%</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%`, boxShadow: pct > 0 ? '0 0 8px rgba(20,184,166,0.4)' : 'none' }}
              />
            </div>
          </div>

          {/* sessions list */}
          {day.sessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Sessions</h3>
              <div className="space-y-1.5">
                {day.sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3 bg-bg rounded-lg py-1.5 pl-3 pr-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      <span className="text-sm text-text font-mono-num">{formatMinutes(s.actualMinutes)}</span>
                      <span className="text-xs text-muted">{WORK_MODE_LABELS[s.mode]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-subtle">
                      <div className="flex items-center gap-2">
                        {s.noYoutube && <span className="text-success">no YT</span>}
                        <span>Q{s.focusQuality}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(s.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger/50 cursor-pointer"
                        aria-label={`Delete ${formatMinutes(s.actualMinutes)} session`}
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* quick add (today or past days) */}
          {day.date <= new Date().toISOString().split('T')[0] && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Quick Add Time
              </h3>

              {/* mode picker */}
              <select
                value={quickMode}
                onChange={e => setQuickMode(e.target.value as WorkMode)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text cursor-pointer focus:outline-none focus:border-accent"
              >
                {Object.entries(WORK_MODE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                {QUICK_TIMES.map(m => (
                  <button
                    key={m}
                    onClick={() => handleQuick(m)}
                    className="py-2 rounded-lg bg-bg border border-border text-sm font-mono-num text-text hover:border-accent hover:text-accent transition-all cursor-pointer"
                  >
                    +{m}m
                  </button>
                ))}
                <button
                  onClick={() => setShowCustom(v => !v)}
                  className="py-2 rounded-lg bg-bg border border-border text-sm text-muted hover:border-accent hover:text-accent transition-all cursor-pointer"
                >
                  Custom
                </button>
              </div>

              {showCustom && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customMin}
                    onChange={e => setCustomMin(e.target.value)}
                    placeholder="Minutes"
                    min={1}
                    max={480}
                    className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={handleCustom}
                    className="px-4 py-2 bg-accent rounded-lg text-sm font-semibold text-bg hover:bg-accent-dim transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* note */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Day Note
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => updateDayNote(dayId, note)}
              placeholder="What did you work on? What's next?"
              rows={3}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text resize-none focus:outline-none focus:border-accent placeholder:text-subtle"
            />
          </div>

          {/* start session shortcut */}
          {isToday && (
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent rounded-xl text-bg font-semibold hover:bg-accent-dim transition-colors cursor-pointer shadow-glow"
            >
              <Zap className="w-4 h-4" />
              Start Focus Session
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
