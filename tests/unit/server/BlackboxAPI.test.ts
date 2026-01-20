/**
 * Tests for BlackboxAPI client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  BlackboxAPI,
  mapTaskStatusToSessionStatus,
  AGENT_MODELS,
  DEFAULT_MODELS,
} from '../../../server/BlackboxAPI'

describe('BlackboxAPI', () => {
  describe('constructor', () => {
    it('should accept bb_ prefixed API key', () => {
      expect(() => new BlackboxAPI('bb_test123')).not.toThrow()
    })

    it('should accept sk- prefixed API key', () => {
      expect(() => new BlackboxAPI('sk-test123')).not.toThrow()
    })

    it('should throw on empty API key', () => {
      expect(() => new BlackboxAPI('')).toThrow('Blackbox API key is required')
    })

    it('should throw on invalid API key format', () => {
      expect(() => new BlackboxAPI('invalid-key')).toThrow(
        'Invalid Blackbox API key format'
      )
    })
  })

  describe('mapTaskStatusToSessionStatus', () => {
    it('should map pending to waiting', () => {
      expect(mapTaskStatusToSessionStatus('pending')).toBe('waiting')
    })

    it('should map running to working', () => {
      expect(mapTaskStatusToSessionStatus('running')).toBe('working')
    })

    it('should map completed to idle', () => {
      expect(mapTaskStatusToSessionStatus('completed')).toBe('idle')
    })

    it('should map failed to attention', () => {
      expect(mapTaskStatusToSessionStatus('failed')).toBe('attention')
    })

    it('should map stopped to offline', () => {
      expect(mapTaskStatusToSessionStatus('stopped')).toBe('offline')
    })
  })

  describe('AGENT_MODELS', () => {
    it('should have models for all agents', () => {
      expect(AGENT_MODELS.blackbox).toBeDefined()
      expect(AGENT_MODELS.claude).toBeDefined()
      expect(AGENT_MODELS.codex).toBeDefined()
      expect(AGENT_MODELS.gemini).toBeDefined()
    })

    it('should have at least one model per agent', () => {
      expect(AGENT_MODELS.blackbox.length).toBeGreaterThan(0)
      expect(AGENT_MODELS.claude.length).toBeGreaterThan(0)
      expect(AGENT_MODELS.codex.length).toBeGreaterThan(0)
      expect(AGENT_MODELS.gemini.length).toBeGreaterThan(0)
    })

    it('should have id and name for each model', () => {
      for (const models of Object.values(AGENT_MODELS)) {
        for (const model of models) {
          expect(model.id).toBeDefined()
          expect(model.name).toBeDefined()
          expect(typeof model.id).toBe('string')
          expect(typeof model.name).toBe('string')
        }
      }
    })
  })

  describe('DEFAULT_MODELS', () => {
    it('should have defaults for all agents', () => {
      expect(DEFAULT_MODELS.blackbox).toBe('blackboxai/blackbox-pro')
      expect(DEFAULT_MODELS.claude).toBe('blackboxai/anthropic/claude-sonnet-4.5')
      expect(DEFAULT_MODELS.codex).toBe('gpt-5-codex')
      expect(DEFAULT_MODELS.gemini).toBe('gemini-2.0-flash-exp')
    })

    it('should have valid default models in AGENT_MODELS', () => {
      for (const [agent, defaultModel] of Object.entries(DEFAULT_MODELS)) {
        const models = AGENT_MODELS[agent as keyof typeof AGENT_MODELS]
        const hasDefault = models.some((m) => m.id === defaultModel)
        expect(hasDefault).toBe(true)
      }
    })
  })
})
