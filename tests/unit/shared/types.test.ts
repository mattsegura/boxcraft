/**
 * Tests for shared type utilities and constants
 */

import { describe, it, expect } from 'vitest'
import { TOOL_STATION_MAP } from '../../../shared/types'

describe('TOOL_STATION_MAP', () => {
  it('should map Read tool to bookshelf', () => {
    expect(TOOL_STATION_MAP.Read).toBe('bookshelf')
  })

  it('should map Edit tool to workbench', () => {
    expect(TOOL_STATION_MAP.Edit).toBe('workbench')
  })

  it('should map Write tool to desk', () => {
    expect(TOOL_STATION_MAP.Write).toBe('desk')
  })

  it('should map Bash tool to terminal', () => {
    expect(TOOL_STATION_MAP.Bash).toBe('terminal')
  })

  it('should map Grep and Glob to scanner', () => {
    expect(TOOL_STATION_MAP.Grep).toBe('scanner')
    expect(TOOL_STATION_MAP.Glob).toBe('scanner')
  })

  it('should map WebFetch and WebSearch to antenna', () => {
    expect(TOOL_STATION_MAP.WebFetch).toBe('antenna')
    expect(TOOL_STATION_MAP.WebSearch).toBe('antenna')
  })

  it('should map Task tool to portal', () => {
    expect(TOOL_STATION_MAP.Task).toBe('portal')
  })

  it('should map TodoWrite to taskboard', () => {
    expect(TOOL_STATION_MAP.TodoWrite).toBe('taskboard')
  })

  it('should have defined station mappings', () => {
    // MCP tools may or may not be in the map depending on configuration
    expect(TOOL_STATION_MAP).toBeDefined()
    expect(typeof TOOL_STATION_MAP).toBe('object')
  })
})
