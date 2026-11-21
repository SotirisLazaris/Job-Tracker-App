import { useState } from 'react'
import { isoToday, STATUSES } from '../store'

export default function ApplicationForm({ app, onSave, onClose }) {
  const isEdit = Boolean(app.id)
  const [f, setF] = useState({
    company: '', role: '', status: 'Applied', dateApplied: isoToday(), followUp: '', link: '', notes: '',
    ...app,
  })
  const set = (key) => (e) => setF({ ...f, [key]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    onSave({ ...f, company: f.company.trim(), role: f.role.trim() })
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit application' : 'Add application'}
        onSubmit={submit}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <h2>{isEdit ? 'Edit application' : 'Add application'}</h2>
        <label>Company<input value={f.company} onChange={set('company')} required autoFocus /></label>
        <label>Role<input value={f.role} onChange={set('role')} required /></label>
        <label>Status
          <select value={f.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <div className="two">
          <label>Date applied<input type="date" value={f.dateApplied} onChange={set('dateApplied')} required /></label>
          <label>Follow up on<input type="date" value={f.followUp} onChange={set('followUp')} /></label>
        </div>
        <label>Job posting link<input type="url" value={f.link} onChange={set('link')} placeholder="https://…" /></label>
        <label>Notes<textarea rows="3" value={f.notes} onChange={set('notes')} /></label>
        <div className="actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
