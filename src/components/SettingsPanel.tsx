import { CalendarDays } from 'lucide-react'
import { useStore } from '../app/store'

export function SettingsPanel() {
  const { settings, updateSettings } = useStore()

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-sm font-semibold uppercase tracking-wider text-muted">Settings</h1>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium text-text">
            <CalendarDays className="h-4 w-4 text-accent" />
            Start Date
          </span>
          <input
            type="date"
            value={settings.startDate}
            onChange={event => updateSettings({ startDate: event.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-bg px-3 font-mono-num text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
      </div>
    </section>
  )
}
