import { useState } from 'react'
import { useStore } from '../app/store'
import { DayCell } from './DayCell'
import { DayModal } from './DayModal'
import type { DayProgress } from '../app/types'

export function ChallengeCalendar() {
  const days = useStore(s => s.days)
  const [selectedDay, setSelectedDay] = useState<DayProgress | null>(null)

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">20-Day Sprint</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {days.map(day => (
            <DayCell key={day.id} day={day} onClick={() => setSelectedDay(day)} />
          ))}
        </div>
      </div>

      {selectedDay && (
        <DayModal
          dayId={selectedDay.id}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  )
}
