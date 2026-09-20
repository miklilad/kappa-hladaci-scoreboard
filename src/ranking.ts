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
  /** 1-based; players the tie-breaks cannot separate share a rank. */
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

type Total = Omit<Standing, 'rank'>

const compareMedals = (a: Total, b: Total) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze

const sumPoints = (row: DayRow, games: readonly Game[]) => games.reduce((sum, game) => sum + row.games[game].points, 0)

/**
 * Running totals over all given sessions, best first. Pass `games` to count only some of the games.
 *
 * Ties on points are broken by medals. For a single game the summed raw score decides first;
 * across games raw scores are not comparable, so there it is medals only.
 */
export function overallStandings(sessions: Session[], games: readonly Game[] = GAMES): Standing[] {
  const totals = new Map<string, Total>()

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

  const compareScores = (a: Total, b: Total) => {
    if (games.length !== 1) return 0
    const scores = scoreTotals(sessions, games[0])
    const difference = (scores.get(b.player) ?? 0) - (scores.get(a.player) ?? 0)
    return GAME_INFO[games[0]].higherIsBetter ? difference : -difference
  }
  const compare = (a: Total, b: Total) => b.points - a.points || compareScores(a, b) || compareMedals(a, b)

  const sorted = [...totals.values()].sort((a, b) => compare(a, b) || a.player.localeCompare(b.player))
  return sorted.map((total) => ({
    ...total,
    rank: sorted.findIndex((other) => compare(other, total) === 0) + 1,
  }))
}

/** Running totals per player; used for points and for raw scores alike. */
export type PointsHistory = {
  dates: IsoDate[]
  /** One entry per player, in order of first appearance; `totals` is indexed like `dates`. */
  series: { player: string; totals: number[] }[]
}

/** Accumulates each session's `[player, value]` gains. Sessions must be in date order. */
function runningTotals(sessions: Session[], gains: (session: Session) => [player: string, value: number][]): PointsHistory {
  const series = new Map<string, number[]>()

  sessions.forEach((session, day) => {
    for (const [player, value] of gains(session)) {
      // A player who joins later has 0 on the days before.
      const totals = series.get(player) ?? Array<number>(day).fill(0)
      totals[day] = (totals[day - 1] ?? 0) + value
      series.set(player, totals)
    }
    // Players who sat this day out keep their total.
    for (const totals of series.values()) totals[day] ??= totals[day - 1]
  })

  return {
    dates: sessions.map((session) => session.date),
    series: [...series].map(([player, totals]) => ({ player, totals })),
  }
}

/** Running point totals after each session. Pass `games` to count only some of the games. */
export function pointsHistory(sessions: Session[], games: readonly Game[] = GAMES): PointsHistory {
  return runningTotals(sessions, (session) => rankDay(session).map((row) => [row.player, sumPoints(row, games)]))
}

/** Running totals of the raw scores in one game after each session. */
export function scoreHistory(sessions: Session[], game: Game): PointsHistory {
  return runningTotals(sessions, (session) => session.players.map((player, i) => [player, session[game][i]]))
}

/** Each player's raw scores in one game, summed over all sessions. */
export function scoreTotals(sessions: Session[], game: Game): Map<string, number> {
  const totals = new Map<string, number>()
  for (const session of sessions) {
    session.players.forEach((player, i) => totals.set(player, (totals.get(player) ?? 0) + session[game][i]))
  }
  return totals
}
