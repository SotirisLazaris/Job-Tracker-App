import { useState } from 'react'
import { followUpLabel, isoToday, STATUSES, useStore } from '../store'

const readView = () => {
  try {
    return localStorage.getItem('jt-view') === 'board' ? 'board' : 'list'
  } catch {
    return 'list'
  }
}

export default function Applications({ onEdit, onDelete }) {
  const { apps, dispatch } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [view, setView] = useState(readView)

  const chooseView = (v) => {
    setView(v)
    try {
      localStorage.setItem('jt-view', v)
    } catch {
      /* ignore */
    }
  }

  const needle = q.trim().toLowerCase()
  const matches = apps
    .filter((a) => `${a.company} ${a.role}`.toLowerCase().includes(needle))
    .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))
  const list = status === 'All' ? matches : matches.filter((a) => a.status === status)

  return (
    <>
      <div className="page-head">
        <h1>Applications</h1>
        <div className="seg" role="group" aria-label="View">
          {['list', 'board'].map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => chooseView(v)}>
              {v === 'list' ? 'List' : 'Board'}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar">
        <input data-search placeholder="Search company or role" value={q} onChange={(e) => setQ(e.target.value)} />
        {view === 'list' && (
          <div className="chips">
            {['All', ...STATUSES].map((s) => (
              <button key={s} className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {s}<span>{s === 'All' ? matches.length : matches.filter((a) => a.status === s).length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'board' ? (
        <Board apps={matches} dispatch={dispatch} onEdit={onEdit} />
      ) : (
        <section className="card">
          {list.length === 0 && (
            <p className="muted center">{apps.length ? 'No applications match your filters.' : 'No applications yet. Add your first one!'}</p>
          )}
          {list.map((a) => (
            <article className={`item ${a.status}`} key={a.id}>
              <div className="avatar">{a.company.charAt(0).toUpperCase()}</div>
              <div className="grow">
                <div>{a.link ? <a href={a.link} target="_blank" rel="noopener noreferrer"><b>{a.company}</b></a> : <b>{a.company}</b>}</div>
                <div className="muted">{a.role}</div>
                {a.notes && <div className="muted small">{a.notes}</div>}
              </div>
              <div className="meta small muted">
                <div>Applied {a.dateApplied}</div>
                {a.followUp && <div>Follow up: {followUpLabel(a.followUp)}</div>}
              </div>
              <select
                className={`badge ${a.status}`}
                aria-label={`Status of ${a.company}`}
                value={a.status}
                onChange={(e) => dispatch({ type: 'update', app: { id: a.id, status: e.target.value } })}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => onEdit(a)}>Edit</button>
              <button className="x" aria-label={`Delete ${a.company}`} onClick={() => onDelete(a)}>✕</button>
            </article>
          ))}
        </section>
      )}
    </>
  )
}

/** Kanban board: drag a card onto another column to change its status. */
function Board({ apps, dispatch, onEdit }) {
  const [over, setOver] = useState(null)
  const today = isoToday()

  const drop = (status) => (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) dispatch({ type: 'update', app: { id, status } })
    setOver(null)
  }

  return (
    <div className="board">
      {STATUSES.map((s) => {
        const cards = apps.filter((a) => a.status === s)
        return (
          <div
            key={s}
            className={`col ${s}${over === s ? ' over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(s)
            }}
            onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setOver(null)}
            onDrop={drop(s)}
          >
            <div className="col-head"><i className="dot" />{s}<span className="count">{cards.length}</span></div>
            {cards.map((a) => (
              <article
                key={a.id}
                className={`kcard ${a.status}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', a.id)}
                onDragEnd={() => setOver(null)}
                onClick={() => onEdit(a)}
              >
                <b>{a.company}</b>
                <div className="muted small">{a.role}</div>
                {a.followUp && s !== 'Offer' && s !== 'Rejected' && (
                  <div className={`small ${a.followUp < today ? 'late' : 'muted'}`}>{followUpLabel(a.followUp)}</div>
                )}
              </article>
            ))}
          </div>
        )
      })}
    </div>
  )
}
