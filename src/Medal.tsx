const MEDALS = [
  { emoji: '🥇', label: 'Gold' },
  { emoji: '🥈', label: 'Silver' },
  { emoji: '🥉', label: 'Bronze' },
]

/** Medal for the podium, plain place number from 4th down. */
export function Medal({ rank }: { rank: number }) {
  const medal = MEDALS[rank - 1]
  if (!medal) return <span className="place">{rank}.</span>
  return (
    <span className="medal" role="img" aria-label={medal.label} title={medal.label}>
      {medal.emoji}
    </span>
  )
}
