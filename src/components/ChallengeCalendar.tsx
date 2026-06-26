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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {days.map(day => (
            <DayCell key={day.id} day={day} onClick={() => setSelectedDay(day)} />
          ))}
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
