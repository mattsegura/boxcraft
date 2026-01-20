/**
 * Tests for AttentionSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AttentionSystem } from '../../../src/systems/AttentionSystem'
import { createManagedSession } from '../../fixtures/sessions'

describe('AttentionSystem', () => {
  let system: AttentionSystem
  let onQueueChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onQueueChange = vi.fn()
    system = new AttentionSystem({ onQueueChange })
  })

  describe('add/remove', () => {
    it('should add session to queue', () => {
      system.add('session-1')
      expect(system.needsAttention('session-1')).toBe(true)
      expect(system.count).toBe(1)
    })

    it('should not add duplicate sessions', () => {
      system.add('session-1')
      system.add('session-1')
      expect(system.count).toBe(1)
    })

    it('should remove session from queue', () => {
      system.add('session-1')
      system.remove('session-1')
      expect(system.needsAttention('session-1')).toBe(false)
      expect(system.count).toBe(0)
    })

    it('should call onQueueChange when queue changes', () => {
      system.add('session-1')
      expect(onQueueChange).toHaveBeenCalled()
    })
  })

  describe('getQueue', () => {
    it('should return copy of queue', () => {
      system.add('session-1')
      system.add('session-2')
      const queue = system.getQueue()
      expect(queue).toEqual(['session-1', 'session-2'])
      // Modifying returned array should not affect internal queue
      queue.push('session-3')
      expect(system.count).toBe(2)
    })
  })

  describe('getNext', () => {
    it('should return next session needing attention', () => {
      const session1 = createManagedSession({ id: 'session-1' })
      const session2 = createManagedSession({ id: 'session-2' })

      system.add('session-1')
      system.add('session-2')

      const next = system.getNext([session1, session2])
      expect(next?.id).toBe('session-1')
      expect(system.count).toBe(1) // Removed from queue
    })

    it('should return null when queue is empty', () => {
      const next = system.getNext([])
      expect(next).toBeNull()
    })

    it('should skip deleted sessions', () => {
      const session2 = createManagedSession({ id: 'session-2' })

      system.add('session-1') // Doesn't exist
      system.add('session-2')

      const next = system.getNext([session2])
      expect(next?.id).toBe('session-2')
    })
  })

  describe('processStatusChanges', () => {
    it('should detect working → idle transition', () => {
      const session = createManagedSession({ id: 'session-1', status: 'working' })

      // First call - establish baseline
      system.processStatusChanges([session])

      // Change to idle
      session.status = 'idle'
      const newlyIdle = system.processStatusChanges([session])

      expect(newlyIdle.length).toBe(1)
      expect(newlyIdle[0].id).toBe('session-1')
      expect(system.needsAttention('session-1')).toBe(true)
    })

    it('should clear attention when session starts working', () => {
      const session = createManagedSession({ id: 'session-1', status: 'idle' })

      system.add('session-1')
      system.processStatusChanges([session])

      // Change to working
      session.status = 'working'
      system.processStatusChanges([session])

      expect(system.needsAttention('session-1')).toBe(false)
    })

    it('should clean up deleted sessions', () => {
      const session = createManagedSession({ id: 'session-1', status: 'idle' })

      system.processStatusChanges([session])

      // Session deleted
      system.processStatusChanges([])

      // Internal tracking should be cleaned up
    })
  })

  describe('setSoundEnabled', () => {
    it('should enable/disable sounds', () => {
      system.setSoundEnabled(false)
      system.setSoundEnabled(true)
      // Sound state is tracked internally
    })
  })

  describe('setNotificationsEnabled', () => {
    it('should enable/disable notifications', () => {
      system.setNotificationsEnabled(false)
      system.setNotificationsEnabled(true)
      // Notification state is tracked internally
    })
  })
})
