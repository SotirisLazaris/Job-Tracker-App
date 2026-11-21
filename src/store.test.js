import { countByStatus, daysUntil, dueFollowUps, reducer } from './store'

const app = (over = {}) => ({
  id: '1', company: 'Acme', role: 'Dev', status: 'Applied', dateApplied: '2026-01-01', followUp: '', link: '', notes: '', ...over,
})

describe('reducer', () => {
  it('adds an application with a generated id', () => {
    const next = reducer([], { type: 'add', app: { company: 'Acme', role: 'Dev' } })
    expect(next).toHaveLength(1)
    expect(next[0].id).toBeTruthy()
  })

  it('updates only the matching application', () => {
    const state = [app({ id: '1' }), app({ id: '2', company: 'Globex' })]
    const next = reducer(state, { type: 'update', app: { id: '2', status: 'Offer' } })
    expect(next[1]).toMatchObject({ company: 'Globex', status: 'Offer' })
    expect(next[0].status).toBe('Applied')
  })

  it('removes an application', () => {
    expect(reducer([app()], { type: 'remove', id: '1' })).toEqual([])
  })
})

describe('dates and reminders', () => {
  it('counts days between ISO dates', () => {
    expect(daysUntil('2026-03-10', '2026-03-08')).toBe(2)
    expect(daysUntil('2026-03-05', '2026-03-08')).toBe(-3)
  })

  it('lists overdue and upcoming follow-ups of active applications, soonest first', () => {
    const apps = [
      app({ id: 'a', followUp: '2026-03-12' }),
      app({ id: 'b', followUp: '2026-03-06' }),
      app({ id: 'c', followUp: '2026-03-30' }),
      app({ id: 'd', followUp: '2026-03-09', status: 'Rejected' }),
      app({ id: 'e', followUp: '' }),
    ]
    expect(dueFollowUps(apps, '2026-03-08', 7).map((a) => a.id)).toEqual(['b', 'a'])
  })

  it('counts applications per status', () => {
    const counts = countByStatus([app(), app({ id: '2', status: 'Offer' })])
    expect(counts).toEqual({ Applied: 1, Interview: 0, Offer: 1, Rejected: 0 })
  })
})
