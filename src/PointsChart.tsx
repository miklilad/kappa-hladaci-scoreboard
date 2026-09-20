import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { formatDate, formatShortDate } from './dates.ts'
import type { PointsHistory } from './ranking.ts'

const HEIGHT = 260
const MARGIN = { top: 12, right: 16, bottom: 28, left: 40 }
/** Extra right margin when player names are written at the line ends. */
const END_LABEL_WIDTH = 64
const MAX_END_LABELS = 4
const MIN_END_LABEL_GAP = 14
const MIN_X_LABEL_GAP = 56
const MIN_MARKER_GAP = 16
const SERIES_COLORS = 8

const formatValue = new Intl.NumberFormat()
const formatTick = new Intl.NumberFormat(undefined, { notation: 'compact' })

/** Colour follows the player (order of first appearance), never the current rank. */
const seriesColor = (index: number) => (index < SERIES_COLORS ? `var(--series-${index + 1})` : 'var(--muted)')

/** Round axis maximum and step giving at most ~5 ticks. */
function niceScale(max: number) {
  const rough = Math.max(max, 1) / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = Math.max(1, [1, 2, 5, 10].find((m) => m * magnitude >= rough)! * magnitude)
  const top = Math.ceil(Math.max(max, 1) / step) * step
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) }
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(ref.current!)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

type Props = {
  history: PointsHistory
  /** What the totals count, for the accessible description. */
  unit?: string
}

export function PointsChart({ history, unit = 'point' }: Props) {
  const { dates, series } = history
  const [ref, width] = useWidth()
  const [active, setActive] = useState<number | null>(null)

  const last = dates.length - 1
  const scale = niceScale(Math.max(...series.flatMap((s) => s.totals)))
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const y = (value: number) => MARGIN.top + plotHeight * (1 - value / scale.top)

  // Name the line ends only while the names have room; the legend always carries identity.
  const endYs = series.map((s) => y(s.totals[last])).sort((a, b) => a - b)
  const showEndLabels =
    series.length <= MAX_END_LABELS && endYs.every((endY, i) => i === 0 || endY - endYs[i - 1] >= MIN_END_LABEL_GAP)

  const right = MARGIN.right + (showEndLabels ? END_LABEL_WIDTH : 0)
  const plotWidth = Math.max(width - MARGIN.left - right, 0)
  const step = last > 0 ? plotWidth / last : 0
  const x = (day: number) => MARGIN.left + (last > 0 ? day * step : plotWidth / 2)

  const xLabelStride = step > 0 ? Math.ceil(MIN_X_LABEL_GAP / step) : 1
  const showMarkers = last === 0 || step >= MIN_MARKER_GAP

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const pointerX = event.clientX - event.currentTarget.getBoundingClientRect().left
    const day = step > 0 ? Math.round((pointerX - MARGIN.left) / step) : 0
    setActive(Math.min(Math.max(day, 0), last))
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const move = { ArrowLeft: -1, ArrowRight: 1 }[event.key]
    if (!move) return
    event.preventDefault()
    setActive((day) => Math.min(Math.max((day ?? last) + move, 0), last))
  }

  return (
    <figure className="chart">
      <ul className="chart-legend">
        {series.map((s, i) => (
          <li key={s.player}>
            <span className="line-key" style={{ background: seriesColor(i) }} />
            {s.player}
          </li>
        ))}
      </ul>

      <div
        ref={ref}
        className="chart-plot"
        tabIndex={0}
        role="group"
        aria-label={`Line chart of each player's running ${unit} total. Use the left and right arrow keys to read the values day by day.`}
        onFocus={() => setActive((day) => day ?? last)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            aria-hidden="true"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActive(null)}
          >
            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line
                  className={tick === 0 ? 'chart-axis' : 'chart-grid'}
                  x1={MARGIN.left}
                  x2={MARGIN.left + plotWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                />
                <text className="chart-tick" x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">
                  {formatTick.format(tick)}
                </text>
              </g>
            ))}

            {dates.map(
              (date, day) =>
                // Count the stride back from the latest day so that one is always labelled.
                (last - day) % xLabelStride === 0 && (
                  <text key={date} className="chart-tick" x={x(day)} y={HEIGHT - 8} textAnchor="middle">
                    {formatShortDate(date)}
                  </text>
                ),
            )}

            {active !== null && (
              <line className="chart-crosshair" x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
            )}

            {series.map((s, i) => (
              <g key={s.player}>
                <polyline
                  className="chart-line"
                  stroke={seriesColor(i)}
                  points={s.totals.map((total, day) => `${x(day)},${y(total)}`).join(' ')}
                />
                {s.totals.map(
                  (total, day) =>
                    (showMarkers || day === last || day === active) && (
                      <circle
                        key={day}
                        className="chart-marker"
                        cx={x(day)}
                        cy={y(total)}
                        r={day === active ? 5 : 4}
                        fill={seriesColor(i)}
                      />
                    ),
                )}
                {showEndLabels && (
                  <text className="chart-end-label" x={x(last) + 10} y={y(s.totals[last])} dy="0.32em">
                    {s.player}
                  </text>
                )}
              </g>
            ))}
          </svg>
        )}

        {active !== null && (
          <div
            className={`chart-tooltip ${x(active) > width / 2 ? 'left' : 'right'}`}
            style={{ left: x(active) }}
            role="status"
          >
            <div className="chart-tooltip-date">{formatDate(dates[active])}</div>
            {series
              .map((s, i) => ({ ...s, color: seriesColor(i) }))
              .sort((a, b) => b.totals[active] - a.totals[active])
              .map((s) => (
                <div key={s.player} className="chart-tooltip-row">
                  <span className="line-key" style={{ background: s.color }} />
                  <strong>{formatValue.format(s.totals[active])}</strong>
                  <span>{s.player}</span>
                  <span className="chart-tooltip-gain">+{formatValue.format(s.totals[active] - (s.totals[active - 1] ?? 0))}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      <details>
        <summary>Show as table</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                {series.map((s) => (
                  <th scope="col" className="num" key={s.player}>
                    {s.player}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date, day) => (
                <tr key={date}>
                  <th scope="row">{formatShortDate(date)}</th>
                  {series.map((s) => (
                    <td className="num" key={s.player}>
                      {formatValue.format(s.totals[day])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
