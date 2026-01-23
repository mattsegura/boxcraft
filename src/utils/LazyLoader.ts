/**
 * Lazy loading utilities for code splitting
 */

/**
 * Lazy load modals only when needed
 */
export async function loadModals() {
  const [
    { setupQuestionModal, showQuestionModal, hideQuestionModal },
    { setupZoneInfoModal, showZoneInfoModal, setZoneInfoSoundEnabled },
    { setupZoneCommandModal, showZoneCommandModal },
    { setupPermissionModal, showPermissionModal, hidePermissionModal },
    { setupTextLabelModal, showTextLabelModal },
  ] = await Promise.all([
    import('../ui/QuestionModal'),
    import('../ui/ZoneInfoModal'),
    import('../ui/ZoneCommandModal'),
    import('../ui/PermissionModal'),
    import('../ui/TextLabelModal'),
  ])

  return {
    setupQuestionModal,
    showQuestionModal,
    hideQuestionModal,
    setupZoneInfoModal,
    showZoneInfoModal,
    setZoneInfoSoundEnabled,
    setupZoneCommandModal,
    showZoneCommandModal,
    setupPermissionModal,
    showPermissionModal,
    hidePermissionModal,
    setupTextLabelModal,
    showTextLabelModal,
  }
}

/**
 * Lazy load voice control
 */
export async function loadVoiceControl() {
  const { setupVoiceControl } = await import('../ui/VoiceControl')
  return { setupVoiceControl }
}

/**
 * Lazy load draw mode
 */
export async function loadDrawMode() {
  const { drawMode } = await import('../ui/DrawMode')
  return { drawMode }
}

/**
 * Lazy load directory autocomplete
 */
export async function loadDirectoryAutocomplete() {
  const { setupDirectoryAutocomplete } = await import('../ui/DirectoryAutocomplete')
  return { setupDirectoryAutocomplete }
}

/**
 * Lazy load version checker
 */
export async function loadVersionChecker() {
  const { checkForUpdates } = await import('../ui/VersionChecker')
  return { checkForUpdates }
}
