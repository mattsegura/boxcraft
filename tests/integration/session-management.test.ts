/**
 * Integration tests for session management
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createManagedSession, createBlackboxSession } from '../fixtures/sessions'
import type { ManagedSession } from '../../shared/types'

describe('Session Management Integration', () => {
  let sessions: ManagedSession[]

  beforeEach(() => {
    sessions = []
  })

  describe('Local Sessions', () => {
    it('should create a local tmux session', () => {
      const session = createManagedSession({
        name: 'Test Session',
        tmuxSession: 'claude-1',
        cwd: '/test/project',
      })

      sessions.push(session)

      expect(sessions.length).toBe(1)
      expect(sessions[0].name).toBe('Test Session')
      expect(sessions[0].tmuxSession).toBe('claude-1')
    })

    it('should track session status changes', () => {
      const session = createManagedSession({ status: 'idle' })
      sessions.push(session)

      // Simulate status change
      session.status = 'working'
      expect(session.status).toBe('working')

      session.status = 'idle'
      expect(session.status).toBe('idle')
    })

    it('should link Claude session ID', () => {
      const session = createManagedSession()
      session.claudeSessionId = 'claude-abc123'

      expect(session.claudeSessionId).toBe('claude-abc123')
    })
  })

  describe('Blackbox Sessions', () => {
    it('should create a Blackbox task session', () => {
      const session = createBlackboxSession({
        name: 'Blackbox Task',
        taskId: 'task-123',
        repoUrl: 'https://github.com/test/repo',
      })

      sessions.push(session)

      expect(sessions.length).toBe(1)
      expect(sessions[0].taskId).toBe('task-123')
      expect(sessions[0].repoUrl).toBe('https://github.com/test/repo')
    })

    it('should track task progress', () => {
      const session = createBlackboxSession({ progress: 0 })
      sessions.push(session)

      session.progress = 50
      expect(session.progress).toBe(50)

      session.progress = 100
      expect(session.progress).toBe(100)
    })

    it('should store PR URL when task completes', () => {
      const session = createBlackboxSession()
      session.prUrl = 'https://github.com/test/repo/pull/123'

      expect(session.prUrl).toBe('https://github.com/test/repo/pull/123')
    })
  })

  describe('Mixed Sessions', () => {
    it('should manage both local and Blackbox sessions', () => {
      const local = createManagedSession({ name: 'Local' })
      const blackbox = createBlackboxSession({ name: 'Blackbox' })

      sessions.push(local, blackbox)

      expect(sessions.length).toBe(2)
      expect(sessions[0].tmuxSession).toBeDefined()
      expect(sessions[1].taskId).toBeDefined()
    })

    it('should filter sessions by type', () => {
      const local1 = createManagedSession({ name: 'Local 1' })
      const local2 = createManagedSession({ name: 'Local 2' })
      const blackbox = createBlackboxSession({ name: 'Blackbox' })

      sessions.push(local1, local2, blackbox)

      const localSessions = sessions.filter((s) => s.tmuxSession)
      const blackboxSessions = sessions.filter((s) => s.taskId)

      expect(localSessions.length).toBe(2)
      expect(blackboxSessions.length).toBe(1)
    })
  })
})
