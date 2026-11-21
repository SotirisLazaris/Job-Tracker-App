import { createContext, useContext, useEffect, useReducer } from 'react'

export const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected']
const ACTIVE = ['Applied', 'Interview']
const KEY = 'job-tracker:v1'

// ---------- date helpers ----------
export const isoToday = () => new Date().toLocaleDateString('en-CA')

/** Whole days from `from` to `iso` (negative when `iso` is in the past). */
export const daysUntil = (iso, from = isoToday()) =>
  Math.round((new Date(iso + 'T00:00:00') - new Date(from + 'T00:00:00')) / 864e5)

export function followUpLabel(iso, from) {
  const d = daysUntil(iso, from)
  if (d < 0) return `${-d}d overdue`
  return d === 0 ? 'Today' : `In ${d}d`
}

/** Active applications whose follow-up is overdue or due within `withinDays`, soonest first. */
export function dueFollowUps(apps, from = isoToday(), withinDays = 7) {
  return apps
    .filter((a) => ACTIVE.includes(a.status) && a.followUp && daysUntil(a.followUp, from) <= withinDays)
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
}

export const countByStatus = (apps) =>
  Object.fromEntries(STATUSES.map((s) => [s, apps.filter((a) => a.status === s).length]))

// ---------- reducer ----------
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return [{ ...action.app, id: newId() }, ...state]
    case 'update':
      return state.map((a) => (a.id === action.app.id ? { ...a, ...action.app } : a))
    case 'restore':
      return [action.app, ...state]
    case 'remove':
      return state.filter((a) => a.id !== action.id)
    default:
      return state
  }
}

// ---------- persistence ----------
function sample() {
  const off = (n) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toLocaleDateString('en-CA')
  }
  return [
    { id: 's1', company: 'Northwind Labs', role: 'Junior Java Developer', status: 'Interview', dateApplied: off(-9), followUp: off(1), link: '', notes: 'Technical round next week.' },
    { id: 's2', company: 'Acme Corp', role: 'React Developer', status: 'Applied', dateApplied: off(-5), followUp: off(-1), link: '', notes: '' },
    { id: 's3', company: 'Globex', role: 'Backend Engineer', status: 'Offer', dateApplied: off(-21), followUp: '', link: '', notes: 'Answer due soon.' },
    { id: 's4', company: 'Initech', role: 'Software Engineer', status: 'Rejected', dateApplied: off(-14), followUp: '', link: '', notes: '' },
  ]
}

function load(initial) {
  if (initial) return initial
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted or unavailable storage: fall through to sample data */
  }
  return sample()
}

const Ctx = createContext(null)

export function StoreProvider({ children, initial }) {
  const [apps, dispatch] = useReducer(reducer, initial, load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(apps))
    } catch {
      /* storage full or blocked: keep working in memory */
    }
  }, [apps])
  return <Ctx.Provider value={{ apps, dispatch }}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)
