import { GAMES, GAME_INFO, type Game, type IsoDate, type Session } from './scores.ts'

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

const sumPoints = (row: DayRow, games: readonly Game[]) => games.reduce((sum, game) => sum + row.games[game].points, 0)

/** Running totals over all given sessions, best first. Pass `games` to count only some of the games. */
export function overallStandings(sessions: Session[], games: readonly Game[] = GAMES): Standing[] {
  const totals = new Map<string, Omit<Standing, 'rank'>>()

  for (const session of sessions) {
    for (const row of rankDay(session)) {
      const total = totals.get(row.player) ?? { player: row.player, points: 0, gold: 0, silver: 0, bronze: 0 }
      total.points += sumPoints(row, games)
      for (const game of games) {
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

export type PointsHistory = {
  dates: IsoDate[]
  /** One entry per player, in order of first appearance; `totals` is indexed like `dates`. */
  series: { player: string; totals: number[] }[]
}

/**
 * Running point totals after each session. Sessions must be in date order.
 * Pass `games` to count only some of the games.
 */
export function pointsHistory(sessions: Session[], games: readonly Game[] = GAMES): PointsHistory {
  const series = new Map<string, number[]>()

  sessions.forEach((session, day) => {
    for (const row of rankDay(session)) {
      // A player who joins later has 0 points on the days before.
      const totals = series.get(row.player) ?? Array<number>(day).fill(0)
      totals[day] = (totals[day - 1] ?? 0) + sumPoints(row, games)
      series.set(row.player, totals)
    }
    // Players who sat this day out keep their total.
    for (const totals of series.values()) totals[day] ??= totals[day - 1]
  })

  return {
    dates: sessions.map((session) => session.date),
    series: [...series].map(([player, totals]) => ({ player, totals })),
  }
}

/** Each player's raw scores in one game, summed over all sessions. */
export function scoreTotals(sessions: Session[], game: Game): Map<string, number> {
  const totals = new Map<string, number>()
  for (const session of sessions) {
    session.players.forEach((player, i) => totals.set(player, (totals.get(player) ?? 0) + session[game][i]))
  }
  return totals
}
