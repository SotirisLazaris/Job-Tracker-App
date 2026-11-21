import { countByStatus, dueFollowUps, followUpLabel, isoToday, STATUSES, useStore } from '../store'

export default function Dashboard({ onEdit }) {
  const { apps } = useStore()
  const counts = countByStatus(apps)
  const total = apps.length
  const rate = total ? Math.round(((counts.Interview + counts.Offer) / total) * 100) : 0
  const due = dueFollowUps(apps)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = isoToday()

  return (
    <>
      <div className="hero">
        <h1>{greeting}</h1>
        <p className="muted">
          {due.length === 0 ? "You're all caught up." : due.length === 1 ? '1 follow-up needs attention.' : `${due.length} follow-ups need attention.`}
        </p>
      </div>

      <section className="stats">
        <Stat label="Applications" value={total} />
        <Stat label="Interviewing" value={counts.Interview} />
        <Stat label="Offers" value={counts.Offer} />
        <Stat label="Interview rate" value={`${rate}%`} />
      </section>

      <section className="card">
        <h2>Pipeline</h2>
        <div className="stack" role="img" aria-label="Pipeline by status">
          {STATUSES.filter((s) => counts[s]).map((s) => (
            <div key={s} className={`seg-fill ${s}`} style={{ flexGrow: counts[s] }} title={`${s}: ${counts[s]}`} />
          ))}
        </div>
        <ul className="legend">
          {STATUSES.map((s) => (
            <li key={s} className={s}><i className="dot" />{s}<b>{counts[s]}</b></li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Follow-up reminders</h2>
        {due.length === 0 && <p className="muted">Nothing due in the next 7 days.</p>}
        {due.map((a) => (
          <button className="reminder" key={a.id} onClick={() => onEdit(a)}>
            <span><b>{a.company}</b> <span className="muted">· {a.role}</span></span>
            <span className={a.followUp < today ? 'late' : 'muted'}>{followUpLabel(a.followUp)}</span>
          </button>
        ))}
      </section>
    </>
  )
}

const Stat = ({ label, value }) => (
  <div className="card">
    <div className="muted small">{label}</div>
    <div className="value">{value}</div>
  </div>
)
