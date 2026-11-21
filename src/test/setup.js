import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// Recent Node versions ship an experimental global `localStorage` that is unusable without a
// storage file, and it shadows jsdom's. A plain in-memory implementation works everywhere.
function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => {
      data.set(k, String(v))
    },
    removeItem: (k) => {
      data.delete(k)
    },
    clear: () => data.clear(),
    key: (i) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  }
}

vi.stubGlobal('localStorage', memoryStorage())

afterEach(() => localStorage.clear())
