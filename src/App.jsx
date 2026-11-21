import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import ApplicationForm from './components/ApplicationForm'

const THEMES = [['light', '☀', 'Light'], ['system', '◐', 'System'], ['dark', '☾', 'Dark']]

export default function App() {
  const { dispatch } = useStore()
  const [editing, setEditing] = useState(null) // null = closed, {} = new, object with id = edit
  const [toast, setToast] = useState(null)
  const [pref, setPref] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'system'
    } catch {
      return 'system'
    }
  })

  // Theme: light, dark, or follow the operating system.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme = pref === 'system' ? (mq?.matches ? 'dark' : 'light') : pref
    }
    apply()
    mq?.addEventListener?.('change', apply)
    try {
      localStorage.setItem('theme', pref)
    } catch {
      /* ignore */
    }
    return () => mq?.removeEventListener?.('change', apply)
  }, [pref])

  // Toasts disappear on their own.
  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(id)
  }, [toast])

  // Keyboard shortcuts: A = add application, F = find (search).
  useEffect(() => {
    const onKey = (e) => {
      if (editing || e.metaKey || e.ctrlKey || e.altKey) return
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
      const key = e.key?.toLowerCase()
      if (key === 'a') {
        e.preventDefault()
        setEditing({})
      } else if (key === 'f') {
        e.preventDefault()
        document.querySelector('[data-search]')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])

  const save = (app) => {
    dispatch({ type: app.id ? 'update' : 'add', app })
    setEditing(null)
    setToast({ msg: app.id ? 'Changes saved' : 'Application added' })
  }

  const remove = (app) => {
    dispatch({ type: 'remove', id: app.id })
    setToast({
      msg: `Deleted ${app.company}`,
      undo: () => {
        dispatch({ type: 'restore', app })
        setToast(null)
      },
    })
  }

  return (
    <div className="wrap">
      <header>
        <div className="brand">Job Tracker</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/applications">Applications</NavLink>
        </nav>
        <div className="tools">
          <div className="seg" role="group" aria-label="Theme">
            {THEMES.map(([value, icon, label]) => (
              <button key={value} aria-pressed={pref === value} aria-label={`${label} theme`} title={`${label} theme`} onClick={() => setPref(value)}>
                {icon}
              </button>
            ))}
          </div>
          <button className="primary" onClick={() => setEditing({})}>+ Add application</button>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Dashboard onEdit={setEditing} />} />
        <Route path="/applications" element={<Applications onEdit={setEditing} onDelete={remove} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="muted small">
        Press <kbd>A</kbd> to add · <kbd>F</kbd> to search · drag cards on the board
      </footer>

      {editing && <ApplicationForm app={editing} onSave={save} onClose={() => setEditing(null)} />}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.msg}</span>
          {toast.undo && <button onClick={toast.undo}>Undo</button>}
        </div>
      )}
    </div>
  )
}
