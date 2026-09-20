import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { fromIsoDate, toIsoDate } from './dates.ts'
import type { IsoDate } from './scores.ts'

type Props = {
  /** Days that have scores, ascending. Every other day is disabled. */
  playedDates: IsoDate[]
  selected: IsoDate
  onSelect: (date: IsoDate) => void
}

export function DayCalendar({ playedDates, selected, onSelect }: Props) {
  const played = new Set<string>(playedDates)

  // Follow the selection when it changes from outside (the date select) to another month.
  const [month, setMonth] = useState(fromIsoDate(selected))
  const [shownFor, setShownFor] = useState(selected)
  if (shownFor !== selected) {
    setShownFor(selected)
    setMonth(fromIsoDate(selected))
  }

  return (
    <DayPicker
      mode="single"
      required
      weekStartsOn={1}
      selected={fromIsoDate(selected)}
      onSelect={(date) => onSelect(toIsoDate(date))}
      month={month}
      onMonthChange={setMonth}
      startMonth={fromIsoDate(playedDates[0])}
      endMonth={fromIsoDate(playedDates[playedDates.length - 1])}
      disabled={(date) => !played.has(toIsoDate(date))}
      modifiers={{ played: (date) => played.has(toIsoDate(date)) }}
      modifiersClassNames={{ played: 'played' }}
    />
  )
}
