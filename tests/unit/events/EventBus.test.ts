/**
 * Tests for EventBus
 */

import { describe, it, expect, vi } from 'vitest'
import { EventBus } from '../../../src/events/EventBus'
import { createPreToolUseEvent } from '../../fixtures/events'

describe('EventBus', () => {
  it('should register and call event handlers', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.on('pre_tool_use', handler)

    const event = createPreToolUseEvent()
    bus.emit('pre_tool_use', event, {} as any)

    expect(handler).toHaveBeenCalledWith(event, expect.any(Object))
  })

  it('should support multiple handlers for same event', () => {
    const bus = new EventBus()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    bus.on('pre_tool_use', handler1)
    bus.on('pre_tool_use', handler2)

    const event = createPreToolUseEvent()
    bus.emit('pre_tool_use', event, {} as any)

    expect(handler1).toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should remove handlers with off()', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.on('pre_tool_use', handler)
    bus.off('pre_tool_use', handler)

    const event = createPreToolUseEvent()
    bus.emit('pre_tool_use', event, {} as any)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should not throw when emitting event with no handlers', () => {
    const bus = new EventBus()
    const event = createPreToolUseEvent()

    expect(() => {
      bus.emit('pre_tool_use', event, {} as any)
    }).not.toThrow()
  })
})
