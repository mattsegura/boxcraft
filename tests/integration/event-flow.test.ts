/**
 * Integration tests for event flow through the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventBus } from '../../src/events/EventBus'
import {
  createPreToolUseEvent,
  createPostToolUseEvent,
  createUserPromptEvent,
} from '../fixtures/events'

describe('Event Flow Integration', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
  })

  it('should emit and handle pre_tool_use events', () => {
    const handler = vi.fn()
    eventBus.on('pre_tool_use', handler)

    const event = createPreToolUseEvent()
    eventBus.emit('pre_tool_use', event, {} as any)

    expect(handler).toHaveBeenCalledWith(event, expect.any(Object))
  })

  it('should emit and handle post_tool_use events', () => {
    const handler = vi.fn()
    eventBus.on('post_tool_use', handler)

    const event = createPostToolUseEvent()
    eventBus.emit('post_tool_use', event, {} as any)

    expect(handler).toHaveBeenCalledWith(event, expect.any(Object))
  })

  it('should handle multiple handlers for same event', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    eventBus.on('user_prompt_submit', handler1)
    eventBus.on('user_prompt_submit', handler2)

    const event = createUserPromptEvent()
    eventBus.emit('user_prompt_submit', event, {} as any)

    expect(handler1).toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should allow removing handlers', () => {
    const handler = vi.fn()
    eventBus.on('pre_tool_use', handler)
    eventBus.off('pre_tool_use', handler)

    const event = createPreToolUseEvent()
    eventBus.emit('pre_tool_use', event, {} as any)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle tool use lifecycle (pre → post)', () => {
    const preHandler = vi.fn()
    const postHandler = vi.fn()

    eventBus.on('pre_tool_use', preHandler)
    eventBus.on('post_tool_use', postHandler)

    const toolUseId = 'tool-123'
    const preEvent = createPreToolUseEvent({ toolUseId })
    const postEvent = createPostToolUseEvent({ toolUseId })

    eventBus.emit('pre_tool_use', preEvent, {} as any)
    eventBus.emit('post_tool_use', postEvent, {} as any)

    expect(preHandler).toHaveBeenCalledWith(preEvent, expect.any(Object))
    expect(postHandler).toHaveBeenCalledWith(postEvent, expect.any(Object))
  })
})
