import { Medal } from './Medal.tsx'
import { overallStandings } from './ranking.ts'
import type { Session } from './scores.ts'

export function Standings({ sessions }: { sessions: Session[] }) {
  const standings = overallStandings(sessions)

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
              <td className="num points">{standing.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
