# Job Tracker

A small React app for keeping track of job applications: where you applied, what stage each one is in,
and when to follow up. Data is saved in your browser (localStorage), so it works with no backend or sign-up.

<!-- Add a screenshot here: docs/dashboard.png -->

## Features

- Add, edit and delete applications (company, role, status, dates, posting link, notes)
- Pipeline stages: **Applied, Interview, Offer, Rejected**, changeable straight from the list
- Search by company or role and filter by status
- Dashboard with totals, interview rate and a pipeline chart
- Follow-up reminders: overdue and upcoming (next 7 days) for active applications
- Theme switcher: light, dark or follow the system (remembered)
- Board view with drag and drop between stages
- Undo after deleting, plus keyboard shortcuts (`A` add, `F` search)
- Starter sample data on first visit

## Tech

React 18, React Router 6 (HashRouter), Context + `useReducer` for state, Vite, Vitest + React Testing Library.
No UI or chart libraries: the layout and the pipeline chart are plain CSS.

## Run it

Requires Node.js 18+ (`winget install OpenJS.NodeJS.LTS` on Windows).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit + component tests
npm run build    # production build in dist/
```

## Deploy

- **Vercel / Netlify:** import the GitHub repo. Build command `npm run build`, output directory `dist`.
- HashRouter means no rewrite rules are needed on static hosts.

## Structure

```
src/
  store.jsx            state (reducer + context), persistence, date and reminder helpers
  App.jsx              layout, routes, theme toggle, add/edit modal
  pages/Dashboard.jsx  stats, pipeline chart, reminders
  pages/Applications.jsx  list with search and status filter
  components/ApplicationForm.jsx
  *.test.js(x)         tests
```

## Design decisions

- Business logic (reducer, reminder rules, date maths) lives in plain functions in `store.jsx` so it can be unit tested without rendering.
- `StoreProvider` accepts an `initial` prop, which keeps tests independent of localStorage and sample data.
- Reminders only apply to active applications (Applied, Interview); finished ones stop nagging.

## Ideas for further work

- Replace localStorage with a real backend (for example the Spring Boot expense tracker's JWT pattern) for sign-in and sync
- Kanban board view with drag and drop
- Export / import as JSON or CSV
- Email or browser notifications for reminders

## What I learned

_Fill this in before publishing: a few honest sentences about the hardest part and what you would change._
