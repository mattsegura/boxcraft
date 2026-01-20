/**
 * Tests for Toast notification system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { toast, showToast } from '../../../src/ui/Toast'

describe('Toast', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'toast-container'
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should show info toast', () => {
    toast.info('Test message')
    expect(container.children.length).toBeGreaterThan(0)
  })

  it('should show success toast', () => {
    toast.success('Success!')
    expect(container.textContent).toContain('Success!')
  })

  it('should show warning toast', () => {
    toast.warning('Warning!')
    expect(container.textContent).toContain('Warning!')
  })

  it('should show error toast', () => {
    toast.error('Error!')
    expect(container.textContent).toContain('Error!')
  })

  it('should auto-remove toast after duration', (done) => {
    toast.info('Temporary', { duration: 100 })
    expect(container.children.length).toBeGreaterThan(0)

    setTimeout(() => {
      expect(container.children.length).toBe(0)
      done()
    }, 150)
  })
})
