import styles from './AdminCharts.module.css'

type Point = { label: string; value: number }

export function AreaChart({ data }: { data: Point[] }) {
  const width = 640
  const height = 220
  const padding = 24
  const max = Math.max(...data.map((point) => point.value))
  const min = Math.min(...data.map((point) => point.value))
  const range = max - min || 1

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const area = `${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`
  const line = points.join(' ')

  return (
    <div className={styles.chart}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg} role="img" aria-label="График визитов">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 214, 10, 0.45)" />
            <stop offset="100%" stopColor="rgba(255, 214, 10, 0)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = padding + (lineIndex / 3) * (height - padding * 2)
          return <line key={lineIndex} x1={padding} y1={y} x2={width - padding} y2={y} className={styles.gridLine} />
        })}
        <polygon points={area} fill="url(#areaFill)" />
        <polyline points={line} className={styles.line} />
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * (width - padding * 2)
          const y = height - padding - ((point.value - min) / range) * (height - padding * 2)
          return <circle key={point.label} cx={x} cy={y} r="5" className={styles.dot} />
        })}
      </svg>
      <div className={styles.labels}>
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  )
}

export function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[]
}) {
  const max = Math.max(...data.map((item) => item.value))

  return (
    <div className={styles.barChart}>
      {data.map((item) => (
        <div key={item.label} className={styles.barRow}>
          <div className={styles.barMeta}>
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ width: `${(item.value / max) * 100}%`, background: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let offset = 0
  const colors = ['#ff6333', '#0e0e0e', '#5cff9a', '#8a8a8a']

  const segments = data.map((item, index) => {
    const percent = (item.value / total) * 100
    const segment = { ...item, percent, color: colors[index % colors.length], offset }
    offset += percent
    return segment
  })

  const gradient = `conic-gradient(${segments
    .map((segment) => `${segment.color} ${segment.offset}% ${segment.offset + segment.percent}%`)
    .join(', ')})`

  return (
    <div className={styles.donutWrap}>
      <div className={styles.donut} style={{ background: gradient }}>
        <div className={styles.donutHole}>
          <strong>{total}%</strong>
          <span>трафик</span>
        </div>
      </div>
      <div className={styles.legend}>
        {segments.map((segment) => (
          <div key={segment.label} className={styles.legendItem}>
            <span style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <strong>{segment.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
