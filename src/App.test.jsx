import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './store'

const make = (over) => ({
  id: '1', company: 'Acme', role: 'Dev', status: 'Applied', dateApplied: '2026-01-01', followUp: '', link: '', notes: '', ...over,
})

const setup = (initial = [], path = '/applications') =>
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StoreProvider initial={initial}>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  )

test('adds an application through the form', () => {
  setup()
  expect(screen.getByText(/No applications yet/)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: '+ Add application' }))
  fireEvent.change(screen.getByLabelText('Company'), { target: { value: 'Initrode' } })
  fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Frontend Developer' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))

  expect(screen.getByText('Initrode')).toBeInTheDocument()
  expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
})

test('filters by search text and by status', () => {
  setup([make(), make({ id: '2', company: 'Globex', role: 'QA', status: 'Offer' })])

  fireEvent.change(screen.getByPlaceholderText('Search company or role'), { target: { value: 'glob' } })
  expect(screen.queryByText('Acme')).not.toBeInTheDocument()
  expect(screen.getByText('Globex')).toBeInTheDocument()

  fireEvent.change(screen.getByPlaceholderText('Search company or role'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: /^Applied/ }))
  expect(screen.getByText('Acme')).toBeInTheDocument()
  expect(screen.queryByText('Globex')).not.toBeInTheDocument()
})

test('dashboard shows an overdue follow-up reminder', () => {
  setup([make({ followUp: '2000-01-01' })], '/')
  expect(screen.getByText(/overdue/)).toBeInTheDocument()
})

test('deleting shows an undo toast that restores the application', () => {
  setup([make()])
  fireEvent.click(screen.getByRole('button', { name: 'Delete Acme' }))
  expect(screen.queryByText('Acme')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
  expect(screen.getByText('Acme')).toBeInTheDocument()
})

test('switches to the board view', () => {
  setup([make(), make({ id: '2', company: 'Globex', status: 'Offer' })])
  fireEvent.click(screen.getByRole('button', { name: 'Board' }))
  expect(screen.getByText('Acme')).toBeInTheDocument()
  expect(screen.getByText('Globex')).toBeInTheDocument()
})

test('keyboard shortcuts: A opens the form, F focuses the search box', () => {
  setup()
  fireEvent.keyDown(window, { key: 'f' })
  expect(screen.getByPlaceholderText('Search company or role')).toHaveFocus()

  fireEvent.keyDown(document.body, { key: 'a' })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
