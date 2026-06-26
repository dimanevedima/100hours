import { CalendarDays } from 'lucide-react'
import { useStore } from '../app/store'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function getDateParts(dateISO: string) {
  const [year, month, day] = dateISO.split('-').map(Number)
  return { year, month, day }
}

function toDateISO(year: number, month: number, day: number) {
  const safeDay = Math.min(day, new Date(year, month, 0).getDate())
  const mm = String(month).padStart(2, '0')
  const dd = String(safeDay).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function SettingsPanel() {
  const { settings, updateSettings } = useStore()
  const { year, month, day } = getDateParts(settings.startDate)
  const years = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 3 + index)
  const daysInMonth = new Date(year, month, 0).getDate()

  const updateDate = (next: Partial<{ year: number; month: number; day: number }>) => {
    updateSettings({
      startDate: toDateISO(
        next.year ?? year,
        next.month ?? month,
        next.day ?? day,
      ),
    })
  }

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="text-sm font-semibold uppercase tracking-wider text-muted">Settings</h1>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-text">
            <CalendarDays className="h-4 w-4 text-accent" />
            Start Date
          </div>

          <div className="grid grid-cols-[1fr_1.4fr_1.2fr] gap-2">
            <DateSelect
              label="Day"
              value={day}
              onChange={value => updateDate({ day: value })}
            >
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </DateSelect>

            <DateSelect
              label="Month"
              value={month}
              onChange={value => updateDate({ month: value })}
            >
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>{label}</option>
              ))}
            </DateSelect>

            <DateSelect
              label="Year"
              value={year}
              onChange={value => updateDate({ year: value })}
            >
              {years.map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </DateSelect>
          </div>
        </div>
      </div>
    </section>
  )
}

function DateSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  children: React.ReactNode
}) {
  return (
    <label className="space-y-1">
      <span className="block text-xs text-muted">{label}</span>
      <select
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="h-11 w-full rounded-xl border border-border bg-bg px-2 font-mono-num text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        {children}
      </select>
    </label>
  )
}
