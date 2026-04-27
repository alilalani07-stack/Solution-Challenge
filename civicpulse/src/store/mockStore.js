import { MOCK_NEEDS, MOCK_VOLUNTEERS, MOCK_MATCHES } from '../constants/mockData'

// Singleton in-memory store for the demo session
class MockStore {
  constructor() {
    this.needs = [...MOCK_NEEDS]
    this.volunteers = [...MOCK_VOLUNTEERS]
    this.matches = [...MOCK_MATCHES]
    this.listeners = []
  }

  subscribe(callback) {
    this.listeners.push(callback)
    callback(this.needs)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  notify() {
    this.listeners.forEach(l => l([...this.needs]))
  }

  updateNeed(id, updates) {
    const idx = this.needs.findIndex(n => n.id === id)
    if (idx !== -1) {
      this.needs[idx] = { ...this.needs[idx], ...updates, updated_at: new Date() }
      this.notify()
    }
  }

  addNeed(need) {
    this.needs.unshift(need)
    this.notify()
  }

  updateMatch(id, updates) {
    const idx = this.matches.findIndex(m => m.id === id)
    if (idx !== -1) {
      this.matches[idx] = { ...this.matches[idx], ...updates }
    }
  }

  addMatch(match) {
    this.matches.push(match)
  }
}

export const mockStore = new MockStore()
