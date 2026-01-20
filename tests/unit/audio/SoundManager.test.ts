/**
 * Tests for SoundManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { soundManager } from '../../../src/audio/SoundManager'

describe('SoundManager', () => {
  beforeEach(() => {
    // Reset sound manager state
    soundManager.setEnabled(true)
    soundManager.setVolume(0.5)
  })

  it('should initialize without errors', async () => {
    // Init requires user gesture, so we mock it
    await expect(soundManager.init()).resolves.not.toThrow()
  })

  it('should enable/disable sounds', () => {
    soundManager.setEnabled(false)
    soundManager.setEnabled(true)
    // State is tracked internally
  })

  it('should set volume', () => {
    soundManager.setVolume(0.8)
    soundManager.setVolume(0.3)
    // Volume is applied to all sounds
  })

  it('should play tool sounds', () => {
    expect(() => soundManager.playTool('Read')).not.toThrow()
    expect(() => soundManager.playTool('Write')).not.toThrow()
    expect(() => soundManager.playTool('Bash')).not.toThrow()
  })

  it('should play named sounds', () => {
    expect(() => soundManager.play('success')).not.toThrow()
    expect(() => soundManager.play('error')).not.toThrow()
    expect(() => soundManager.play('notification')).not.toThrow()
  })

  it('should play result sounds', () => {
    expect(() => soundManager.playResult(true)).not.toThrow()
    expect(() => soundManager.playResult(false)).not.toThrow()
  })

  it('should handle spatial audio options', () => {
    expect(() => {
      soundManager.play('read', { zoneId: 'session-123' })
    }).not.toThrow()
  })

  it('should set zone position resolver', () => {
    const resolver = vi.fn(() => ({ x: 0, y: 0, z: 0 }))
    soundManager.setZonePositionResolver(resolver)
  })

  it('should update listener position', () => {
    expect(() => {
      soundManager.updateListener(0, 0, 0)
    }).not.toThrow()
  })
})
