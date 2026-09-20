import { describe, expect, it } from 'vitest'
import { overallStandings, pointsHistory, rankDay, rankScores } from './ranking.ts'
import type { Session } from './scores.ts'

describe('rankScores', () => {
  it('gives first place as many points as there are players and last place 1', () => {
    expect(rankScores([10, 30, 20], true)).toEqual([
      { score: 10, rank: 3, points: 1 },
      { score: 30, rank: 1, points: 3 },
      { score: 20, rank: 2, points: 2 },
    ])
  })

  it('ranks the lowest score first when lower is better', () => {
    expect(rankScores([10, 30, 20], false).map((p) => p.rank)).toEqual([1, 3, 2])
  })

  it('scales points with the number of players', () => {
    expect(rankScores([5, 4, 3, 2, 1], true).map((p) => p.points)).toEqual([5, 4, 3, 2, 1])
  })

  it('lets tied scores share the better rank', () => {
    expect(rankScores([50, 50, 10], true).map((p) => [p.rank, p.points])).toEqual([
      [1, 3],
      [1, 3],
      [3, 1],
    ])
  })
})

const session = (date: Session['date'], players: string[], scores: number[]): Session => ({
  date,
  players,
  sreality: scores,
  bazos: scores,
  geoguessr: scores,
})

describe('rankDay', () => {
  it('sums points over all games', () => {
    const rows = rankDay(session('2026-01-01', ['A', 'B', 'C'], [3, 2, 1]))
    expect(rows.map((r) => [r.player, r.points])).toEqual([
      ['A', 9],
      ['B', 6],
      ['C', 3],
    ])
  })
})

describe('overallStandings', () => {
  it('accumulates points and medals across days, best first', () => {
    const standings = overallStandings([
      session('2026-01-01', ['A', 'B', 'C'], [3, 2, 1]),
      session('2026-01-02', ['C', 'B', 'A'], [3, 2, 1]),
      session('2026-01-03', ['A', 'B', 'C', 'D'], [1, 2, 3, 4]),
    ])
    expect(standings).toEqual([
      { player: 'C', rank: 1, points: 21, gold: 3, silver: 3, bronze: 3 },
      { player: 'B', rank: 2, points: 18, gold: 0, silver: 6, bronze: 3 },
      { player: 'A', rank: 3, points: 15, gold: 3, silver: 0, bronze: 3 },
      { player: 'D', rank: 4, points: 12, gold: 3, silver: 0, bronze: 0 },
    ])
  })

  it('shares a rank between players equal on points and medals', () => {
    const standings = overallStandings([
      session('2026-01-01', ['A', 'B'], [2, 1]),
      session('2026-01-02', ['A', 'B'], [1, 2]),
    ])
    expect(standings.map((s) => s.rank)).toEqual([1, 1])
  })
})

describe('pointsHistory', () => {
  it('keeps a running total per player, covering late joiners and skipped days', () => {
    const history = pointsHistory([
      session('2026-01-01', ['A', 'B'], [2, 1]),
      session('2026-01-02', ['A', 'C'], [1, 2]),
      session('2026-01-03', ['B', 'C'], [2, 1]),
    ])
    expect(history).toEqual({
      dates: ['2026-01-01', '2026-01-02', '2026-01-03'],
      series: [
        { player: 'A', totals: [6, 9, 9] },
        { player: 'B', totals: [3, 3, 9] },
        { player: 'C', totals: [0, 6, 9] },
      ],
    })
  })
})
