import { useState } from 'react'
import { DayCalendar } from './DayCalendar.tsx'
import { DayResults } from './DayResults.tsx'
import { PointsChart } from './PointsChart.tsx'
import { Standings } from './Standings.tsx'
import { formatDate, formatMediumDate } from './dates.ts'
import { pointsHistory } from './ranking.ts'
import { scores, type IsoDate } from './scores.ts'

const sessions = [...scores].sort((a, b) => a.date.localeCompare(b.date))
const playedDates = sessions.map((session) => session.date)
const history = pointsHistory(sessions)

function App() {
  const [selectedDate, setSelectedDate] = useState(playedDates[playedDates.length - 1])
  const session = sessions.find((s) => s.date === selectedDate)

  if (!session) {
    return (
      <main>
        <h1>Hladači scoreboard</h1>
        <p>No games played yet.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Hladači scoreboard</h1>

      <section>
        <h2>Overall standings</h2>
        <p className="hint">
          Running total over {sessions.length} {sessions.length === 1 ? 'day' : 'days'}.
        </p>
        <Standings sessions={sessions} />
        <h3 className="chart-title">Points over time</h3>
        <PointsChart history={history} />
      </section>

      <section>
        <h2>Daily results</h2>
        <div className="day">
          <div className="day-picker">
            <select
              aria-label="Played day"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value as IsoDate)}
            >
              {playedDates.toReversed().map((date) => (
                <option key={date} value={date}>
                  {formatMediumDate(date)}
                </option>
              ))}
            </select>
            <DayCalendar playedDates={playedDates} selected={selectedDate} onSelect={setSelectedDate} />
          </div>
          <div className="day-results">
            <h3>{formatDate(session.date)}</h3>
            <DayResults session={session} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
