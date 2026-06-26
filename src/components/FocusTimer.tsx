import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Play, Pause, Square, CheckCircle2, Youtube, Volume2, Zap, ChevronRight, ArrowLeft
} from 'lucide-react'
import { useStore } from '../app/store'
import { formatTimer, todayISO } from '../utils/time'
import type { WorkMode } from '../app/types'

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  soft_start: 'Soft Start (15 min)',
  arrangement: 'Arrange / Form',
  mixing: 'Mixing',
  transitions: 'Transitions',
  sound_design: 'Sound Design',
  export: 'Export / Render',
  cover: 'Cover / Artwork',
  metadata: 'Metadata',
  distribution: 'Distribution',
  review: 'Notes / Review',
}

const SUPPORTIVE_PHRASES = [
  '15 минут достаточно, чтобы войти.',
  'Сегодня цель — контакт, не идеал.',
  'Один экспорт лучше, чем бесконечная демка.',
  'Страх не защищает трек, он крадёт следующие треки.',
  'Закрываю, чтобы освободить место для следующего.',
  'Не проверяю талант. Делаю одну техническую правку.',
  'Поток приходит после начала.',
  'Я не обязан доделать. Я обязан только начать.',
]

const PLANNED_OPTIONS = [15, 25, 45, 60, 90, 120]

type Stage = 'setup' | 'running' | 'paused' | 'done'

interface Props {
  onBack: () => void
}

export function FocusTimer({ onBack }: Props) {
  const addSession = useStore(s => s.addSession)
  const days = useStore(s => s.days)
  const settings = useStore(s => s.settings)

  const todayDay = days.find(d => d.date === todayISO())

  const [stage, setStage] = useState<Stage>('setup')
  const [mode, setMode] = useState<WorkMode>('arrangement')
  const [plannedMin, setPlannedMin] = useState(settings.defaultSessionMinutes)
  const [tinyTask, setTinyTask] = useState('')
  const [noYoutube, setNoYoutube] = useState(true)
  const [usedNoise, setUsedNoise] = useState(false)
  const [moodBefore, setMoodBefore] = useState(3)

  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // post session
  const [note, setNote] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [moodAfter, setMoodAfter] = useState(3)
  const [focusQuality, setFocusQuality] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [hadYoutube, setHadYoutube] = useState(false)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  const phraseIdx = useRef(Math.floor(Math.random() * SUPPORTIVE_PHRASES.length))

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)
    setStage('running')
  }, [elapsed])

  const pauseTimer = () => {
    stopInterval()
    setStage('paused')
  }

  const finishTimer = () => {
    stopInterval()
    setStage('done')
  }

  useEffect(() => () => stopInterval(), [])

  const handleSave = () => {
    if (!todayDay) return
    const actualMinutes = Math.max(1, Math.round(elapsed / 60))
    const unlocked = addSession(todayDay.id, {
      date: todayISO(),
      startedAt: new Date(startTimeRef.current).toISOString(),
      endedAt: new Date().toISOString(),
      plannedMinutes: plannedMin,
      actualMinutes,
      mode,
      focusQuality,
      noYoutube: !hadYoutube,
      usedNoise,
      note,
      nextStep,
    })
    setNewlyUnlocked(unlocked)
  }

  const phrase = SUPPORTIVE_PHRASES[phraseIdx.current]

  if (newlyUnlocked.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-success" />
        <h2 className="text-2xl font-bold text-text">Session Saved!</h2>
        <div className="space-y-2 text-center">
          {newlyUnlocked.map(id => (
            <div key={id} className="px-4 py-2 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
              🏆 Achievement unlocked!
            </div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-accent rounded-xl text-bg font-semibold cursor-pointer hover:bg-accent-dim transition-colors shadow-glow"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="space-y-5 animate-slide-up max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-text">Session Complete</h2>
          <span className="ml-auto font-mono-num text-2xl font-bold text-accent text-glow">
            {formatTimer(elapsed)}
          </span>
        </div>

        <div className="space-y-3">
          <Field label="What did you accomplish?">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Finished the drop arrangement, fixed transition..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text resize-none focus:outline-none focus:border-accent placeholder:text-subtle"
            />
          </Field>
          <Field label="Next tiny step">
            <input
              value={nextStep}
              onChange={e => setNextStep(e.target.value)}
              placeholder="Open the project and fix the reverb tail"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent placeholder:text-subtle"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mood after (1-5)">
              <MoodPicker value={moodAfter} onChange={setMoodAfter} />
            </Field>
            <Field label="Focus quality (1-5)">
              <MoodPicker value={focusQuality} onChange={v => setFocusQuality(v as 1|2|3|4|5)} />
            </Field>
          </div>

          <div className="flex gap-4">
            <Toggle label="Used YouTube" value={hadYoutube} onChange={setHadYoutube} color="danger" />
            <Toggle label="Used noise" value={usedNoise} onChange={setUsedNoise} color="accent" />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-accent rounded-xl text-bg font-bold cursor-pointer hover:bg-accent-dim transition-colors shadow-glow"
        >
          Save Session
        </button>
      </div>
    )
  }

  if (stage === 'running' || stage === 'paused') {
    const isOver = elapsed > plannedMin * 60
    return (
      <div className="flex flex-col items-center space-y-8 min-h-[60vh] justify-center animate-fade-in">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted">{WORK_MODE_LABELS[mode]}</p>
          {tinyTask && <p className="text-text font-medium">"{tinyTask}"</p>}
        </div>

        <div className={`font-mono-num text-7xl font-bold transition-colors ${isOver ? 'text-orange text-glow' : 'text-accent text-glow'} ${stage === 'running' ? 'animate-tick' : ''}`}>
          {formatTimer(elapsed)}
        </div>

        <p className="text-muted text-sm italic max-w-xs text-center">{phrase}</p>

        <div className="flex gap-3">
          {stage === 'running' ? (
            <TimerBtn onClick={pauseTimer} icon={<Pause />} label="Pause" variant="secondary" />
          ) : (
            <TimerBtn onClick={startTimer} icon={<Play />} label="Resume" variant="primary" />
          )}
          <TimerBtn onClick={finishTimer} icon={<Square />} label="Finish" variant="secondary" />
        </div>

        <button
          onClick={() => { setElapsed(Math.min(elapsed, 15 * 60)); finishTimer() }}
          className="text-xs text-subtle hover:text-muted underline cursor-pointer"
        >
          I only did 15 min — count it anyway
        </button>
      </div>
    )
  }

  // SETUP
  return (
    <div className="space-y-5 max-w-lg mx-auto animate-slide-up">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-surface2 text-muted hover:text-text transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-text">Focus Session</h2>
      </div>

      {/* ritual */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-accent">Before you start:</p>
        <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
          <li>Close YouTube and the browser</li>
          {settings.noiseReminderEnabled && <li>Turn on brown noise / rain if needed</li>}
          <li>Open only the release project</li>
          <li>Say: "I don't need to finish. I only need to begin."</li>
          <li>Pick one tiny task below</li>
        </ol>
      </div>

      <div className="space-y-4">
        <Field label="Planned duration">
          <div className="flex flex-wrap gap-2">
            {PLANNED_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => setPlannedMin(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono-num border transition-all cursor-pointer
                  ${plannedMin === m
                    ? 'bg-accent text-bg border-accent shadow-glow-sm'
                    : 'bg-bg border-border text-muted hover:border-accent hover:text-accent'
                  }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </Field>

        <Field label="Work mode">
          <select
            value={mode}
            onChange={e => setMode(e.target.value as WorkMode)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text cursor-pointer focus:outline-none focus:border-accent"
          >
            {Object.entries(WORK_MODE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>

        <Field label="Tiny task (one thing to do)">
          <input
            value={tinyTask}
            onChange={e => setTinyTask(e.target.value)}
            placeholder="Fix the reverb on the pad, finish the drop..."
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent placeholder:text-subtle"
          />
        </Field>

        <Field label="Mood before (1-5)">
          <MoodPicker value={moodBefore} onChange={setMoodBefore} />
        </Field>

        <div className="flex gap-4">
          <Toggle
            label={<span className="flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5" />No YouTube</span>}
            value={noYoutube}
            onChange={setNoYoutube}
            color="success"
          />
          <Toggle
            label={<span className="flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" />Neutral noise</span>}
            value={usedNoise}
            onChange={setUsedNoise}
            color="accent"
          />
        </div>
      </div>

      <button
        onClick={startTimer}
        className="w-full flex items-center justify-center gap-2 py-4 bg-accent rounded-xl text-bg font-bold text-lg cursor-pointer hover:bg-accent-dim transition-all shadow-glow animate-pulse-glow"
      >
        <Zap className="w-5 h-5" />
        Start Session
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function MoodPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-all cursor-pointer
            ${value === n ? 'bg-accent border-accent text-bg' : 'bg-bg border-border text-muted hover:border-accent'}`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
  color = 'accent',
}: {
  label: React.ReactNode
  value: boolean
  onChange: (v: boolean) => void
  color?: string
}) {
  const activeColor = color === 'success' ? 'bg-success' : color === 'danger' ? 'bg-danger' : 'bg-accent'
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted">
      <div
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${value ? activeColor : 'bg-border'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-text shadow transition-all ${value ? 'left-5' : 'left-0.5'}`}
        />
      </div>
      {label}
    </label>
  )
}

function TimerBtn({
  onClick,
  icon,
  label,
  variant,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  variant: 'primary' | 'secondary'
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer
        ${variant === 'primary'
          ? 'bg-accent text-bg hover:bg-accent-dim shadow-glow'
          : 'bg-surface2 border border-border text-text hover:border-accent'
        }`}
    >
      {icon}
      {label}
    </button>
  )
}
