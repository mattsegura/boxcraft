/**
 * Tests for TimelineManager
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TimelineManager } from '../../../src/ui/TimelineManager'

describe('TimelineManager', () => {
  let container: HTMLElement
  let manager: TimelineManager

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'timeline'
    document.body.appendChild(container)
    manager = new TimelineManager(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should add icon to timeline', () => {
    manager.add('📖', 0x00ff00)
    expect(container.children.length).toBeGreaterThan(0)
  })

  it('should limit timeline to max items', () => {
    // Add more than max items
    for (let i = 0; i < 150; i++) {
      manager.add('📖', 0x00ff00)
    }
    // Should not exceed max (typically 100)
    expect(container.children.length).toBeLessThanOrEqual(100)
  })

  it('should add multiple icons', () => {
    manager.add('📖', 0x00ff00)
    manager.add('✏️', 0x0000ff)
    expect(container.children.length).toBeGreaterThan(0)
  })
})
