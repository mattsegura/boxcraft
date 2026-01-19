/**
 * Lazy-loaded audio module
 * Defers loading Tone.js until audio is actually needed
 */

let audioModule: typeof import('./index') | null = null

export async function loadAudio() {
  if (!audioModule) {
    audioModule = await import('./index')
  }
  return audioModule
}

export async function getSoundManager() {
  const audio = await loadAudio()
  return audio.soundManager
}

export async function getSpatialAudioContext() {
  const audio = await loadAudio()
  return audio.spatialAudioContext
}
