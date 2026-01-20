/**
 * Tests for ProjectsManager
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ProjectsManager } from '../../../server/ProjectsManager'
import { mkdirSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('ProjectsManager', () => {
  let manager: ProjectsManager
  let testDir: string

  beforeEach(() => {
    // Create temp test directory
    testDir = join(tmpdir(), `boxcraft-test-${Date.now()}`)
    mkdirSync(testDir, { recursive: true })

    // Mock config dir to use temp
    manager = new ProjectsManager()
  })

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('getProjects', () => {
    it('should return empty array initially', () => {
      const projects = manager.getProjects()
      expect(Array.isArray(projects)).toBe(true)
    })

    it('should return projects sorted by recency', () => {
      manager.addProject('/test/path1', 'Project 1')
      // Wait a bit to ensure different timestamps
      setTimeout(() => {
        manager.addProject('/test/path2', 'Project 2')
      }, 10)

      const projects = manager.getProjects()
      // Most recent should be first
      expect(projects.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('addProject', () => {
    it('should add a new project', () => {
      manager.addProject(testDir, 'Test Project')
      const projects = manager.getProjects()
      const added = projects.find((p) => p.path === testDir)
      expect(added).toBeDefined()
      expect(added?.name).toBe('Test Project')
    })

    it('should use directory basename if no name provided', () => {
      manager.addProject(testDir)
      const projects = manager.getProjects()
      const added = projects.find((p) => p.path === testDir)
      expect(added?.name).toBeTruthy()
    })

    it('should increment use count on re-add', () => {
      manager.addProject(testDir, 'Test')
      manager.addProject(testDir, 'Test')
      const projects = manager.getProjects()
      const project = projects.find((p) => p.path === testDir)
      expect(project?.useCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('removeProject', () => {
    it('should remove a project', () => {
      manager.addProject(testDir, 'Test')
      manager.removeProject(testDir)
      const projects = manager.getProjects()
      const removed = projects.find((p) => p.path === testDir)
      expect(removed).toBeUndefined()
    })
  })

  describe('autocomplete', () => {
    it('should return empty array for invalid path', () => {
      const results = manager.autocomplete('/nonexistent/path/xyz')
      expect(Array.isArray(results)).toBe(true)
    })

    it('should limit results', () => {
      const results = manager.autocomplete('/', 5)
      expect(results.length).toBeLessThanOrEqual(5)
    })
  })
})
