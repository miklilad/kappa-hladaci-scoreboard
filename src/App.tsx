import { useState } from 'react'
import { DayCalendar } from './DayCalendar.tsx'
import { DayResults } from './DayResults.tsx'
import { PointsChart } from './PointsChart.tsx'
import { Standings } from './Standings.tsx'
import { formatDate, formatMediumDate } from './dates.ts'
import { pointsHistory, scoreHistory } from './ranking.ts'
import { GAMES, GAME_INFO, scores, type Game, type IsoDate } from './scores.ts'

const sessions = [...scores].sort((a, b) => a.date.localeCompare(b.date))
const playedDates = sessions.map((session) => session.date)

type View = 'overall' | Game

const VIEWS: { view: View; label: string }[] = [
  { view: 'overall', label: 'Overall' },
  ...GAMES.map((game) => ({ view: game, label: GAME_INFO[game].label })),
]

function App() {
  const [view, setView] = useState<View>('overall')
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

  const game = view === 'overall' ? undefined : view

  return (
    <main>
      <h1>Hladači scoreboard</h1>

      <nav className="segmented" aria-label="View">
        {VIEWS.map((option) => (
          <button
            key={option.view}
            type="button"
            aria-pressed={option.view === view}
            onClick={() => setView(option.view)}
          >
            {option.label}
          </button>
        ))}
      </nav>

      <section>
        <h2>{game ? `${GAME_INFO[game].label} standings` : 'Overall standings'}</h2>
        <p className="hint">
          Running total over {sessions.length} {sessions.length === 1 ? 'day' : 'days'}
          {game ? ', counting this game only.' : ', all games.'}
        </p>
        <Standings sessions={sessions} game={game} />
        <h3 className="chart-title">Points over time</h3>
        <PointsChart history={pointsHistory(sessions, game && [game])} />
        {game && (
          <>
            <h3 className="chart-title">Score over time</h3>
            <p className="hint">Raw {GAME_INFO[game].label} scores added up day by day.</p>
            <PointsChart history={scoreHistory(sessions, game)} unit="score" />
          </>
        )}
      </section>

      {!game && (
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
      )}
    </main>
  )
}

export default App
