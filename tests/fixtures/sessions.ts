/**
 * Test fixtures for managed sessions
 */

import type { ManagedSession } from '../../shared/types'

export const createManagedSession = (
  overrides?: Partial<ManagedSession>
): ManagedSession => ({
  id: 'session-123',
  name: 'Test Session',
  tmuxSession: 'claude-1',
  status: 'idle',
  cwd: '/test/project',
  createdAt: Date.now(),
  lastActivity: Date.now(),
  ...overrides,
})

export const createBlackboxSession = (
  overrides?: Partial<ManagedSession>
): ManagedSession => ({
  id: 'session-blackbox-123',
  name: 'Blackbox Task',
  status: 'waiting',
  createdAt: Date.now(),
  lastActivity: Date.now(),
  taskId: 'task-abc123',
  repoUrl: 'https://github.com/test/repo',
  branch: 'main',
  agent: 'blackbox',
  model: 'blackboxai/blackbox-pro',
  progress: 0,
  ...overrides,
})
