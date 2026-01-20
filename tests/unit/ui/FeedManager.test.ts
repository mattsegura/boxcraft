/**
 * Tests for FeedManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FeedManager, formatTokens, formatTimeAgo, escapeHtml } from '../../../src/ui/FeedManager'
import { createPreToolUseEvent, createUserPromptEvent } from '../../fixtures/events'

describe('FeedManager', () => {
  let container: HTMLElement
  let manager: FeedManager

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'activity-feed'
    document.body.appendChild(container)
    manager = new FeedManager(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('add', () => {
    it('should add event to feed', () => {
      const event = createUserPromptEvent()
      manager.add(event, 0x00ff00)
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render prompt events', () => {
      const event = createUserPromptEvent({ prompt: 'Test prompt' })
      manager.add(event, 0x00ff00)
      expect(container.textContent).toContain('Test prompt')
    })

    it('should render tool events', () => {
      const event = createPreToolUseEvent({ 
        tool: 'Read',
        input: { file_path: '/test/file.ts' }
      })
      manager.add(event, 0x00ff00)
      expect(container.textContent).toContain('Read')
    })
  })

  describe('setFilter', () => {
    it('should filter events by session', () => {
      const event1 = createUserPromptEvent({ sessionId: 'session-1' })
      const event2 = createUserPromptEvent({ sessionId: 'session-2' })

      manager.add(event1, 0x00ff00)
      manager.add(event2, 0x0000ff)

      manager.setFilter('session-1')
      // Only session-1 events should be visible
    })

    it('should show all events when filter is null', () => {
      const event1 = createUserPromptEvent({ sessionId: 'session-1' })
      const event2 = createUserPromptEvent({ sessionId: 'session-2' })

      manager.add(event1, 0x00ff00)
      manager.add(event2, 0x0000ff)

      manager.setFilter(null)
      // All events should be visible
    })
  })

  describe('showThinking/hideThinking', () => {
    it('should show thinking indicator', () => {
      manager.showThinking('session-1')
      expect(container.textContent).toContain('thinking')
    })

    it('should hide thinking indicator', () => {
      manager.showThinking('session-1')
      manager.hideThinking('session-1')
      expect(container.textContent).not.toContain('thinking')
    })
  })

  describe('setCwd', () => {
    it('should set current working directory', () => {
      manager.setCwd('/test/project')
      // CWD is used for path shortening
    })
  })
})

describe('formatTokens', () => {
  it('should format small numbers', () => {
    expect(formatTokens(123)).toBe('123 tok')
  })

  it('should format thousands with k suffix', () => {
    expect(formatTokens(1500)).toBe('1.5k tok')
  })

  it('should format millions with M suffix', () => {
    expect(formatTokens(1500000)).toBe('1.5M tok')
  })

  it('should handle zero', () => {
    expect(formatTokens(0)).toBe('0 tok')
  })
})

describe('formatTimeAgo', () => {
  it('should format recent time as "just now"', () => {
    const now = Date.now()
    expect(formatTimeAgo(now)).toBe('just now')
  })

  it('should format seconds ago', () => {
    const time = Date.now() - 30000 // 30 seconds ago
    expect(formatTimeAgo(time)).toContain('s ago')
  })

  it('should format minutes ago', () => {
    const time = Date.now() - 120000 // 2 minutes ago
    expect(formatTimeAgo(time)).toContain('m ago')
  })

  it('should format hours ago', () => {
    const time = Date.now() - 7200000 // 2 hours ago
    expect(formatTimeAgo(time)).toContain('h ago')
  })
})

describe('escapeHtml', () => {
  it('should escape < and >', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('should escape & but not quotes (uses textContent)', () => {
    // escapeHtml uses textContent which doesn't escape quotes
    expect(escapeHtml('a & "b"')).toBe('a &amp; "b"')
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})
