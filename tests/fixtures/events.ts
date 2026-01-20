/**
 * Test fixtures for Claude events
 */

import type {
  PreToolUseEvent,
  PostToolUseEvent,
  UserPromptSubmitEvent,
  StopEvent,
  SessionStartEvent,
  SessionEndEvent,
  NotificationEvent,
} from '../../shared/types'

export const createPreToolUseEvent = (
  overrides?: Partial<PreToolUseEvent>
): PreToolUseEvent => ({
  type: 'pre_tool_use',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  tool: 'Read',
  toolUseId: 'tool-use-123',
  input: { path: '/test/file.ts' },
  ...overrides,
})

export const createPostToolUseEvent = (
  overrides?: Partial<PostToolUseEvent>
): PostToolUseEvent => ({
  type: 'post_tool_use',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  tool: 'Read',
  toolUseId: 'tool-use-123',
  success: true,
  duration: 150,
  output: 'File content here',
  ...overrides,
})

export const createUserPromptEvent = (
  overrides?: Partial<UserPromptSubmitEvent>
): UserPromptSubmitEvent => ({
  type: 'user_prompt_submit',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  prompt: 'Test prompt',
  ...overrides,
})

export const createStopEvent = (overrides?: Partial<StopEvent>): StopEvent => ({
  type: 'stop',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  reason: 'end_turn',
  ...overrides,
})

export const createSessionStartEvent = (
  overrides?: Partial<SessionStartEvent>
): SessionStartEvent => ({
  type: 'session_start',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  ...overrides,
})

export const createSessionEndEvent = (
  overrides?: Partial<SessionEndEvent>
): SessionEndEvent => ({
  type: 'session_end',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  ...overrides,
})

export const createNotificationEvent = (
  overrides?: Partial<NotificationEvent>
): NotificationEvent => ({
  type: 'notification',
  timestamp: Date.now(),
  sessionId: 'test-session-123',
  message: 'Test notification',
  level: 'info',
  ...overrides,
})
