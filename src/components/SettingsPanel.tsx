import { useState } from 'react'
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react'
import { useStore } from '../app/store'
import { exportJSON, importJSON } from '../utils/storage'

export function SettingsPanel() {
  const { settings, updateSettings, resetChallenge, loadFromState } = useStore()
  const state = useStore(s => s)
  const [showReset, setShowReset] = useState(false)
  const [importError, setImportError] = useState('')

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importJSON(file)
      loadFromState(imported)
      setImportError('')
    } catch {
      setImportError('Invalid file. Make sure it\'s a 100 Hours JSON export.')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Settings</h2>

      {/* challenge config */}
      <Section title="Challenge">
        <Field label="Start Date">
          <input
            type="date"
            value={settings.startDate}
            onChange={e => updateSettings({ startDate: e.target.value })}
            className="input-field"
          />
        </Field>
        <Field label={`Total Hours Goal: ${settings.totalHoursGoal}h`}>
          <input
            type="range" min={20} max={200} step={10}
            value={settings.totalHoursGoal}
            onChange={e => updateSettings({ totalHoursGoal: +e.target.value })}
            className="w-full accent-teal-500"
          />
        </Field>
        <Field label={`Days Count: ${settings.daysCount}`}>
          <input
            type="range" min={7} max={60} step={1}
            value={settings.daysCount}
            onChange={e => updateSettings({ daysCount: +e.target.value })}
            className="w-full accent-teal-500"
          />
        </Field>
        <Field label={`Daily Goal: ${settings.dailyGoalHours}h`}>
          <input
            type="range" min={1} max={12} step={0.5}
            value={settings.dailyGoalHours}
            onChange={e => updateSettings({ dailyGoalHours: +e.target.value })}
            className="w-full accent-teal-500"
          />
        </Field>
        <Field label={`Default Session: ${settings.defaultSessionMinutes}min`}>
          <input
            type="range" min={15} max={120} step={5}
            value={settings.defaultSessionMinutes}
            onChange={e => updateSettings({ defaultSessionMinutes: +e.target.value })}
            className="w-full accent-teal-500"
          />
        </Field>
      </Section>

      {/* toggles */}
      <Section title="Features">
        <SettingToggle
          label="Coins & Gamification"
          value={settings.enableCoins}
          onChange={v => updateSettings({ enableCoins: v })}
        />
        <SettingToggle
          label="Achievements"
          value={settings.enableAchievements}
          onChange={v => updateSettings({ enableAchievements: v })}
        />
        <SettingToggle
          label="Supportive Phrases"
          value={settings.enableSupportivePhrases}
          onChange={v => updateSettings({ enableSupportivePhrases: v })}
        />
        <SettingToggle
          label="Noise Reminder"
          value={settings.noiseReminderEnabled}
          onChange={v => updateSettings({ noiseReminderEnabled: v })}
        />
        <SettingToggle
          label="Strict Mode"
          value={settings.strictMode}
          onChange={v => updateSettings({ strictMode: v })}
        />
      </Section>

      {/* data */}
      <Section title="Data">
        <button
          onClick={() => exportJSON(state)}
          className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-text hover:border-accent hover:text-accent transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>

        <label className="flex items-center gap-2 px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-muted hover:border-accent hover:text-text transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          Import JSON
          <input type="file" accept=".json" onChange={handleImport} className="sr-only" />
        </label>

        {importError && (
          <p className="text-xs text-danger">{importError}</p>
        )}
      </Section>

      {/* danger zone */}
      <Section title="Danger Zone">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger hover:bg-danger/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Reset Challenge
          </button>
        ) : (
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm font-semibold">This will erase all progress. Are you sure?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { resetChallenge(); setShowReset(false) }}
                className="px-4 py-2 bg-danger rounded-lg text-sm text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="px-4 py-2 bg-bg border border-border rounded-lg text-sm text-muted cursor-pointer hover:text-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted">{label}</label>
      {children}
    </div>
  )
}

function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${value ? 'bg-accent' : 'bg-border'}`}
        role="switch"
        aria-checked={value}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-text shadow transition-all ${value ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  )
}
