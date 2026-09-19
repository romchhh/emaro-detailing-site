import styles from './AdminUi.module.css'

type StatCardProps = {
  label: string
  value: string
  delta: string
  hint: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, delta, hint, trend = 'neutral' }: StatCardProps) {
  return (
    <article className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <div className={styles.statRow}>
        <strong className={styles.statValue}>{value}</strong>
        <span className={`${styles.statDelta} ${styles[`trend_${trend}`]}`}>{delta}</span>
      </div>
      <p className={styles.statHint}>{hint}</p>
    </article>
  )
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h2 className={styles.pageHeaderTitle}>{title}</h2>
        <p className={styles.pageHeaderLead}>{description}</p>
      </div>
      {action ? <div className={styles.pageHeaderAction}>{action}</div> : null}
    </div>
  )
}

export function AdminCard({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`${styles.card} ${className ?? ''}`}>
      {title ? (
        <header className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>{title}</h3>
            {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
          </div>
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'Nowa',
    in_progress: 'W toku',
    done: 'Zamknięta',
    archived: 'Archiwum',
  }
  return (
    <span className={`${styles.badge} ${styles[`badge_${status}`] ?? ''}`}>
      {map[status] ?? status}
    </span>
  )
}

type BtnProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function GhostButton({ children, onClick, disabled, type = 'button' }: BtnProps) {
  return (
    <button type={type} className={styles.ghostBtn} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function PrimaryButton({ children, onClick, disabled, type = 'button' }: BtnProps) {
  return (
    <button type={type} className={styles.primaryBtn} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function DangerButton({ children, onClick, disabled, type = 'button' }: BtnProps) {
  return (
    <button type={type} className={styles.dangerBtn} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
