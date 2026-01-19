/**
 * Boxcraft - Central Configuration Defaults
 *
 * Single source of truth for default values.
 * Environment variables override these defaults.
 */

export const DEFAULTS = {
  /** WebSocket/API server port */
  SERVER_PORT: 4003,

  /** Vite dev server port */
  CLIENT_PORT: 4002,

  /**
   * Events file path.
   * Uses ~/.boxcraft/ to ensure consistent location regardless of
   * how boxcraft was installed (npx, global npm, local dev).
   * The ~ is expanded by the server at runtime.
   */
  EVENTS_FILE: '~/.boxcraft/data/events.jsonl',

  /**
   * Sessions file path.
   * Uses ~/.boxcraft/ for consistency across installations.
   */
  SESSIONS_FILE: '~/.boxcraft/data/sessions.json',

  /** Max events to keep in memory */
  MAX_EVENTS: 1000,

  /** tmux session name */
  TMUX_SESSION: 'claude',
} as const

export type Defaults = typeof DEFAULTS
