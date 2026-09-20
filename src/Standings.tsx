import { Medal } from './Medal.tsx'
import { overallStandings, scoreTotals } from './ranking.ts'
import type { Game, Session } from './scores.ts'

const formatScore = new Intl.NumberFormat()

type Props = {
  sessions: Session[]
  /** Count only this game, and show its summed raw scores. All games when omitted. */
  game?: Game
}

export function Standings({ sessions, game }: Props) {
  const standings = overallStandings(sessions, game && [game])
  const scores = game && scoreTotals(sessions, game)

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col" className="num">
              #
            </th>
            <th scope="col">Player</th>
            <th scope="col" className="num">
              <Medal rank={1} />
            </th>
            <th scope="col" className="num">
              <Medal rank={2} />
            </th>
            <th scope="col" className="num">
              <Medal rank={3} />
            </th>
            {scores && (
              <th scope="col" className="num">
                Total score
              </th>
            )}
            <th scope="col" className="num">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <tr key={standing.player}>
              <td className="num">{standing.rank}.</td>
              <th scope="row">{standing.player}</th>
              <td className="num">{standing.gold}</td>
              <td className="num">{standing.silver}</td>
              <td className="num">{standing.bronze}</td>
              {scores && <td className="num score">{formatScore.format(scores.get(standing.player) ?? 0)}</td>}
              <td className="num points">{standing.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
