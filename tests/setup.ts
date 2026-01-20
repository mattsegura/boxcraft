/**
 * Vitest global setup
 * Runs before all tests
 */

import { vi } from 'vitest'

// Mock WebSocket globally
global.WebSocket = vi.fn() as any

// Mock AudioContext for Tone.js
global.AudioContext = vi.fn(() => ({
  createOscillator: vi.fn(),
  createGain: vi.fn(),
  destination: {},
  currentTime: 0,
  resume: vi.fn(),
  suspend: vi.fn(),
  close: vi.fn(),
})) as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock Notification API
global.Notification = {
  permission: 'default',
  requestPermission: vi.fn().mockResolvedValue('granted'),
} as any

// Suppress console errors in tests (optional)
// global.console.error = vi.fn()
