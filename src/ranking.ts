import { GAMES, GAME_INFO, type Game, type Session } from './scores.ts'

export type Placement = {
  /** Raw score from the game. */
  score: number
  /** 1-based; tied scores share the better rank (1, 1, 3). */
  rank: number
  /** First place is worth the number of players, last place 1. */
  points: number
}

export type MedalCounts = { gold: number; silver: number; bronze: number }

export type DayRow = {
  player: string
  games: Record<Game, Placement>
  points: number
}

export type Standing = MedalCounts & {
  player: string
  points: number
  /** 1-based; players equal on points and medals share a rank. */
  rank: number
}

export function rankScores(scores: number[], higherIsBetter: boolean): Placement[] {
  return scores.map((score) => {
    const beatenBy = scores.filter((other) => (higherIsBetter ? other > score : other < score)).length
    const rank = beatenBy + 1
    return { score, rank, points: scores.length - rank + 1 }
  })
}

export function rankDay(session: Session): DayRow[] {
  const placements = Object.fromEntries(
    GAMES.map((game) => [game, rankScores(session[game], GAME_INFO[game].higherIsBetter)]),
  ) as Record<Game, Placement[]>

  return session.players.map((player, i) => {
    const games = Object.fromEntries(GAMES.map((game) => [game, placements[game][i]])) as Record<Game, Placement>
    const points = GAMES.reduce((sum, game) => sum + games[game].points, 0)
    return { player, games, points }
  })
}

const MEDALS = ['gold', 'silver', 'bronze'] as const

const compareStandings = (a: Omit<Standing, 'rank'>, b: Omit<Standing, 'rank'>) =>
  b.points - a.points || b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze

/** Running totals over all given sessions, best first. */
export function overallStandings(sessions: Session[]): Standing[] {
  const totals = new Map<string, Omit<Standing, 'rank'>>()

  for (const session of sessions) {
    for (const row of rankDay(session)) {
      const total = totals.get(row.player) ?? { player: row.player, points: 0, gold: 0, silver: 0, bronze: 0 }
      total.points += row.points
      for (const game of GAMES) {
        const medal = MEDALS[row.games[game].rank - 1]
        if (medal) total[medal] += 1
      }
      totals.set(row.player, total)
    }
  }

  const sorted = [...totals.values()].sort((a, b) => compareStandings(a, b) || a.player.localeCompare(b.player))
  return sorted.map((total) => ({
    ...total,
    rank: sorted.findIndex((other) => compareStandings(other, total) === 0) + 1,
  }))
}
