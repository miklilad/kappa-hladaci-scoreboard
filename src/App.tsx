import { useState } from 'react'
import { DayCalendar } from './DayCalendar.tsx'
import { DayResults } from './DayResults.tsx'
import { Standings } from './Standings.tsx'
import { formatDate } from './dates.ts'
import { scores } from './scores.ts'

const sessions = [...scores].sort((a, b) => a.date.localeCompare(b.date))
const playedDates = sessions.map((session) => session.date)

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
      </section>

      <section>
        <h2>Daily results</h2>
        <div className="day">
          <DayCalendar playedDates={playedDates} selected={selectedDate} onSelect={setSelectedDate} />
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
