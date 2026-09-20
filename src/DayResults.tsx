import { Medal } from './Medal.tsx'
import { rankDay } from './ranking.ts'
import { GAMES, GAME_INFO, type Session } from './scores.ts'

const formatScore = new Intl.NumberFormat()

export function DayResults({ session }: { session: Session }) {
  const rows = rankDay(session).sort((a, b) => b.points - a.points)

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Player</th>
            {GAMES.map((game) => (
              <th scope="col" key={game}>
                {GAME_INFO[game].label}
              </th>
            ))}
            <th scope="col" className="num">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.player}>
              <th scope="row">{row.player}</th>
              {GAMES.map((game) => (
                <td key={game}>
                  <span className="result">
                    <Medal rank={row.games[game].rank} />
                    <span className="score">{formatScore.format(row.games[game].score)}</span>
                  </span>
                </td>
              ))}
              <td className="num points">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
