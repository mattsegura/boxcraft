/**
 * AsciiBot - Minimalist ASCII-themed character
 *
 * Design: Geometric wireframe robot that fits the black & white glowy ASCII aesthetic
 * - Cube/geometric head with glowing edges
 * - Wireframe body with white glow accents
 * - Minimalist design - black with white glowing outlines
 * - Clean, tech aesthetic matching the hexagon zones
 */

import * as THREE from 'three'
import type { StationType } from '../../shared/types'
import type { WorkshopScene, Station } from '../scene/WorkshopScene'
import type { ICharacter, CharacterOptions, CharacterState } from './ICharacter'

// Re-export for backwards compatibility
export type ClaudeState = CharacterState
export type ClaudeOptions = CharacterOptions

const DEFAULT_OPTIONS: Required<ClaudeOptions> = {
  scale: 1,
  color: 0xffffff, // White glow
  statusColor: 0xffffff,
  startStation: 'center',
}

export class Claude implements ICharacter {
  public readonly mesh: THREE.Group
  public state: CharacterState = 'idle'
  public currentStation: StationType = 'center'
  public readonly id: string

  private scene: WorkshopScene
  private options: Required<ClaudeOptions>
  private targetPosition: THREE.Vector3 | null = null
  private moveSpeed = 3
  private bobTime = 0
  private workTime = 0
  private thinkTime = 0
  private updateCallback: ((delta: number) => void) | null = null

  // Body parts for animation
  private head: THREE.Group
  private body: THREE.Group
  private leftArm: THREE.Group
  private rightArm: THREE.Group
  private statusRing: THREE.Mesh
  private thoughtBubbles: THREE.Group
  private glowCore: THREE.Mesh

  constructor(scene: WorkshopScene, options: ClaudeOptions = {}) {
    this.scene = scene
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.id = Math.random().toString(36).substring(2, 9)
    this.mesh = new THREE.Group()

    // Create body parts
    this.head = this.createHead()
    this.body = this.createBody()
    this.leftArm = this.createArm(-1)
    this.rightArm = this.createArm(1)
    this.statusRing = this.createStatusRing()
    this.thoughtBubbles = this.createThoughtBubbles()
    this.glowCore = this.createGlowCore()

    this.mesh.add(this.head)
    this.mesh.add(this.body)
    this.mesh.add(this.leftArm)
    this.mesh.add(this.rightArm)
    this.mesh.add(this.statusRing)
    this.mesh.add(this.thoughtBubbles)
    this.mesh.add(this.glowCore)

    // Apply scale
    this.mesh.scale.setScalar(this.options.scale)

    // Position at start station
    this.currentStation = this.options.startStation
    const startStation = scene.stations.get(this.options.startStation)
    if (startStation) {
      this.mesh.position.copy(startStation.position)
    }

    // Add to scene
    scene.scene.add(this.mesh)

    // Register update callback
    this.updateCallback = (delta: number) => this.update(delta)
    scene.onRender(this.updateCallback)
  }

  private createHead(): THREE.Group {
    const group = new THREE.Group()
    
    // Cube head - black with white edges
    const headSize = 0.35
    const headGeometry = new THREE.BoxGeometry(headSize, headSize, headSize)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.05,
    })
    const headMesh = new THREE.Mesh(headGeometry, headMaterial)
    group.add(headMesh)

    // Wireframe edges for the head
    const edgesGeometry = new THREE.EdgesGeometry(headGeometry)
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    })
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    group.add(edges)

    // Eyes - two glowing dots
    const eyeGeometry = new THREE.CircleGeometry(0.04, 8)
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    })
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.08, 0.02, headSize / 2 + 0.01)
    leftEye.name = 'leftEye'
    group.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone())
    rightEye.position.set(0.08, 0.02, headSize / 2 + 0.01)
    rightEye.name = 'rightEye'
    group.add(rightEye)

    // Visor line (horizontal line across face)
    const visorGeometry = new THREE.PlaneGeometry(0.25, 0.02)
    const visorMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    })
    const visor = new THREE.Mesh(visorGeometry, visorMaterial)
    visor.position.set(0, -0.05, headSize / 2 + 0.01)
    visor.name = 'visor'
    group.add(visor)

    group.position.y = 1.1
    return group
  }

  private createBody(): THREE.Group {
    const group = new THREE.Group()

    // Main body - tapered box
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.25)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.03,
    })
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    group.add(bodyMesh)

    // Wireframe edges
    const edgesGeometry = new THREE.EdgesGeometry(bodyGeometry)
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    })
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    group.add(edges)

    // Chest panel lines (ASCII style)
    const panelGeometry = new THREE.PlaneGeometry(0.3, 0.35)
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    })
    const panel = new THREE.Mesh(panelGeometry, panelMaterial)
    panel.position.z = 0.126
    group.add(panel)

    // Horizontal lines on chest
    for (let i = 0; i < 3; i++) {
      const lineGeometry = new THREE.PlaneGeometry(0.25, 0.01)
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
      })
      const line = new THREE.Mesh(lineGeometry, lineMaterial)
      line.position.set(0, 0.1 - i * 0.1, 0.127)
      group.add(line)
    }

    group.position.y = 0.55
    return group
  }

  private createArm(side: number): THREE.Group {
    const group = new THREE.Group()

    // Upper arm
    const upperArmGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.08)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.8,
      metalness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.03,
    })
    const upperArm = new THREE.Mesh(upperArmGeometry, armMaterial)
    upperArm.position.y = -0.125
    group.add(upperArm)

    // Wireframe
    const edgesGeometry = new THREE.EdgesGeometry(upperArmGeometry)
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    })
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    edges.position.y = -0.125
    group.add(edges)

    // Lower arm
    const lowerArmGeometry = new THREE.BoxGeometry(0.06, 0.2, 0.06)
    const lowerArm = new THREE.Mesh(lowerArmGeometry, armMaterial.clone())
    lowerArm.position.y = -0.35
    group.add(lowerArm)

    const lowerEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(lowerArmGeometry),
      edgesMaterial.clone()
    )
    lowerEdges.position.y = -0.35
    group.add(lowerEdges)

    // Hand - small cube
    const handGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08)
    const hand = new THREE.Mesh(handGeometry, armMaterial.clone())
    hand.position.y = -0.5
    group.add(hand)

    const handEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(handGeometry),
      edgesMaterial.clone()
    )
    handEdges.position.y = -0.5
    group.add(handEdges)

    group.position.set(side * 0.28, 0.7, 0)
    return group
  }

  private createStatusRing(): THREE.Mesh {
    const geometry = new THREE.RingGeometry(0.5, 0.55, 32)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(geometry, material)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.02
    return ring
  }

  private createThoughtBubbles(): THREE.Group {
    const group = new THREE.Group()
    group.visible = false

    // Create small cubes instead of spheres for ASCII theme
    const sizes = [0.06, 0.08, 0.1]
    const positions = [
      { x: 0.2, y: 1.4, z: 0.2 },
      { x: 0.3, y: 1.55, z: 0.25 },
      { x: 0.35, y: 1.75, z: 0.3 },
    ]

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BoxGeometry(sizes[i], sizes[i], sizes[i])
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(positions[i].x, positions[i].y, positions[i].z)
      
      // Add edges
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.8, transparent: true })
      )
      edges.position.copy(cube.position)
      
      group.add(cube)
      group.add(edges)
    }

    return group
  }

  private createGlowCore(): THREE.Mesh {
    // Central glowing core in the chest
    const geometry = new THREE.SphereGeometry(0.08, 8, 8)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    })
    const core = new THREE.Mesh(geometry, material)
    core.position.set(0, 0.55, 0.13)
    return core
  }

  private update(delta: number): void {
    this.bobTime += delta

    // Idle bobbing animation
    if (this.state === 'idle' && !this.targetPosition) {
      const bobAmount = Math.sin(this.bobTime * 2) * 0.02
      this.mesh.position.y = this.mesh.position.y + bobAmount * delta * 10
      
      // Subtle head rotation
      this.head.rotation.y = Math.sin(this.bobTime * 0.5) * 0.1
    }

    // Working animation
    if (this.state === 'working') {
      this.workTime += delta
      
      // Arm movement
      this.rightArm.rotation.x = Math.sin(this.workTime * 4) * 0.3
      this.leftArm.rotation.x = Math.sin(this.workTime * 4 + Math.PI) * 0.2
      
      // Core pulsing
      const pulse = 0.6 + Math.sin(this.workTime * 6) * 0.4
      ;(this.glowCore.material as THREE.MeshBasicMaterial).opacity = pulse
    }

    // Thinking animation
    if (this.state === 'thinking') {
      this.thinkTime += delta
      this.thoughtBubbles.visible = true
      
      // Animate thought bubbles
      this.thoughtBubbles.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.position.y += Math.sin(this.thinkTime * 2 + i) * 0.002
          child.rotation.y = this.thinkTime * 0.5
        }
      })
    } else {
      this.thoughtBubbles.visible = false
    }

    // Movement
    if (this.targetPosition) {
      const direction = this.targetPosition.clone().sub(this.mesh.position)
      const distance = direction.length()

      if (distance > 0.1) {
        direction.normalize()
        const moveAmount = Math.min(this.moveSpeed * delta, distance)
        this.mesh.position.add(direction.multiplyScalar(moveAmount))

        // Face movement direction
        const angle = Math.atan2(direction.x, direction.z)
        this.mesh.rotation.y = angle
      } else {
        this.mesh.position.copy(this.targetPosition)
        this.targetPosition = null
      }
    }

    // Status ring pulse
    const ringMat = this.statusRing.material as THREE.MeshBasicMaterial
    if (this.state === 'working') {
      ringMat.opacity = 0.4 + Math.sin(this.workTime * 4) * 0.3
    } else if (this.state === 'thinking') {
      ringMat.opacity = 0.3 + Math.sin(this.thinkTime * 2) * 0.2
    } else {
      ringMat.opacity = 0.4
    }
  }

  // Public methods
  setState(newState: CharacterState): void {
    this.state = newState
    this.workTime = 0
    this.thinkTime = 0
  }

  moveTo(station: StationType): void {
    const stationObj = this.scene.stations.get(station)
    if (stationObj) {
      this.targetPosition = stationObj.position.clone()
      this.currentStation = station
    }
  }

  moveToPosition(position: THREE.Vector3, station: StationType): void {
    this.targetPosition = position.clone()
    this.currentStation = station
  }

  setStatusColor(color: number): void {
    ;(this.statusRing.material as THREE.MeshBasicMaterial).color.setHex(color)
  }

  dispose(): void {
    // Remove from scene
    this.scene.scene.remove(this.mesh)

    // Unregister update callback
    if (this.updateCallback) {
      this.scene.offRender(this.updateCallback)
      this.updateCallback = null
    }

    // Dispose geometries and materials
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
      if (child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      }
    })
  }

  // Behavior methods (simplified for AsciiBot)
  getIdleBehaviorNames(): string[] {
    return ['look_around', 'stretch', 'check_status']
  }

  playIdleBehavior(name: string): void {
    // Simple idle behaviors
    switch (name) {
      case 'look_around':
        // Head rotation animation
        this.head.rotation.y = Math.PI * 0.25
        setTimeout(() => { this.head.rotation.y = -Math.PI * 0.25 }, 500)
        setTimeout(() => { this.head.rotation.y = 0 }, 1000)
        break
      case 'stretch':
        // Arms up animation
        this.leftArm.rotation.z = -Math.PI * 0.3
        this.rightArm.rotation.z = Math.PI * 0.3
        setTimeout(() => {
          this.leftArm.rotation.z = 0
          this.rightArm.rotation.z = 0
        }, 800)
        break
      case 'check_status':
        // Look down at core
        this.head.rotation.x = Math.PI * 0.2
        setTimeout(() => { this.head.rotation.x = 0 }, 600)
        break
    }
  }

  getWorkingBehaviorStations(): StationType[] {
    return ['terminal', 'desk', 'workbench', 'scanner']
  }

  playWorkingBehavior(station: StationType): void {
    // Working animation based on station
    this.setState('working')
    
    // Move to station
    this.moveTo(station)
  }
}
