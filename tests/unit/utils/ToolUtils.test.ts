/**
 * Tests for tool utility functions
 */

import { describe, it, expect } from 'vitest'
import { getToolIcon } from '../../../src/utils/ToolUtils'

describe('getToolIcon', () => {
  it('should return book icon for Read', () => {
    expect(getToolIcon('Read')).toBe('📖')
  })

  it('should return pencil icon for Write', () => {
    expect(getToolIcon('Write')).toBe('✏️')
  })

  it('should return wrench icon for Edit', () => {
    expect(getToolIcon('Edit')).toBe('🔧')
  })

  it('should return terminal icon for Bash', () => {
    expect(getToolIcon('Bash')).toBe('💻')
  })

  it('should return magnifying glass for Grep', () => {
    expect(getToolIcon('Grep')).toBe('🔍')
  })

  it('should return magnifying glass for Glob', () => {
    expect(getToolIcon('Glob')).toBe('🔍')
  })

  it('should return satellite for WebFetch', () => {
    expect(getToolIcon('WebFetch')).toBe('📡')
  })

  it('should return satellite for WebSearch', () => {
    expect(getToolIcon('WebSearch')).toBe('📡')
  })

  it('should return portal icon for Task', () => {
    expect(getToolIcon('Task')).toBe('🌀')
  })

  it('should return clipboard for TodoWrite', () => {
    expect(getToolIcon('TodoWrite')).toBe('📋')
  })

  it('should return default icon for unknown tool', () => {
    expect(getToolIcon('UnknownTool')).toBe('🔨')
  })
})
