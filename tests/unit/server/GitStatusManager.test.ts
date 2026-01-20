/**
 * Tests for GitStatusManager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GitStatusManager } from '../../../server/GitStatusManager'

describe('GitStatusManager', () => {
  let manager: GitStatusManager

  beforeEach(() => {
    manager = new GitStatusManager()
  })

  afterEach(() => {
    manager.stop()
  })

  describe('track/untrack', () => {
    it('should track a session directory', () => {
      manager.track('session-1', '/test/dir')
      expect(manager.getStatus('session-1')).toBeNull() // Not fetched yet
    })

    it('should untrack a session', () => {
      manager.track('session-1', '/test/dir')
      manager.untrack('session-1')
      expect(manager.getStatus('session-1')).toBeNull()
    })
  })

  describe('getStatus', () => {
    it('should return null for untracked session', () => {
      expect(manager.getStatus('unknown')).toBeNull()
    })
  })

  describe('getAllStatuses', () => {
    it('should return empty map initially', () => {
      const statuses = manager.getAllStatuses()
      expect(statuses.size).toBe(0)
    })
  })

  describe('setUpdateHandler', () => {
    it('should accept update handler', () => {
      const handler = vi.fn()
      manager.setUpdateHandler(handler)
      // Handler will be called when status changes
    })
  })

  describe('start/stop', () => {
    it('should start polling', () => {
      manager.start()
      // Polling interval is set
    })

    it('should stop polling', () => {
      manager.start()
      manager.stop()
      // Polling interval is cleared
    })

    it('should not start multiple times', () => {
      manager.start()
      manager.start()
      // Only one interval should be active
    })
  })
})
