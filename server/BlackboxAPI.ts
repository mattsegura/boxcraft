/**
 * BlackboxAPI - Client for Blackbox AI Task API
 *
 * Handles creating, monitoring, and managing AI agent tasks
 * via the Blackbox cloud API.
 *
 * API Docs: https://docs.blackbox.ai/api-reference/task
 */

// ============================================================================
// Types
// ============================================================================

export type BlackboxAgent = 'blackbox' | 'claude' | 'codex' | 'gemini'

export type BlackboxTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'cancelled'

/** Agent execution details for multi-launch tasks */
export interface AgentExecution {
  agent: string
  status: string
  gitDiff?: string
  branchName?: string
  executedAt?: string
  completedAt?: string
}

/** Diff analysis result from multi-launch comparison */
export interface DiffAnalysis {
  /** Detailed markdown analysis comparing implementations */
  analysis: string
  /** Name of the winning agent */
  bestAgent: string
  /** ISO 8601 timestamp of analysis */
  analyzedAt: string
}

/** Diff statistics */
export interface DiffStats {
  totalLinesAdded: number
  totalLinesRemoved: number
  totalFilesChanged: number
  initialCommitSha?: string
}

export interface BlackboxTask {
  id: string
  userId: string
  teamId?: string | null
  prompt: string
  repoUrl?: string
  selectedAgent: BlackboxAgent
  selectedModel: string
  status: BlackboxTaskStatus
  progress: number
  logs: string[]
  error?: string | null

  // Branch & Repository
  selectedBranch?: string
  branchName?: string
  merged?: boolean
  prNumber?: number | null
  prUrl?: string | null

  // Sandbox
  sandboxId?: string
  sandboxUrl?: string | null

  // Multi-Launch Analysis Fields
  /** Whether multiple agents were launched */
  multiLaunch?: boolean
  /** Array of agent configurations for multi-launch */
  selectedAgents?: Array<{ agent: string; model: string }>
  /** Execution details per agent */
  agentExecutions?: AgentExecution[]
  /** Winner selection and analysis */
  diffAnalysis?: DiffAnalysis | null
  /** Diff statistics */
  diffStats?: DiffStats | null
  /** Complete git diff of all changes */
  cumulativeDiff?: string | null

  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt?: string | null
}

/** Request for creating a single-agent task */
export interface CreateTaskRequest {
  prompt: string
  repoUrl?: string
  selectedBranch?: string
  selectedAgent: BlackboxAgent
  selectedModel: string
}

/** Request for creating a multi-agent task */
export interface CreateMultiLaunchTaskRequest {
  prompt: string
  repoUrl?: string
  selectedBranch?: string
  /** Array of agents to run (min: 2, max: 5) */
  selectedAgents: Array<{ agent: BlackboxAgent; model: string }>
}

export interface CreateTaskResponse {
  task: BlackboxTask
}

export interface GetTaskResponse {
  task: BlackboxTask
}

export interface ListTasksResponse {
  tasks: BlackboxTask[]
}

// ============================================================================
// Chat Completion Types (OpenAI-compatible)
// ============================================================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  tools?: Array<{
    type: 'function'
    function: {
      name: string
      description?: string
      parameters?: Record<string, unknown>
    }
  }>
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
}

export interface ChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: 'stop' | 'length' | 'tool_calls' | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatCompletionChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: Partial<ChatMessage>
    finish_reason: 'stop' | 'length' | 'tool_calls' | null
  }>
}

// ============================================================================
// Available Models by Agent
// ============================================================================

export const AGENT_MODELS: Record<BlackboxAgent, { id: string; name: string }[]> = {
  blackbox: [
    { id: 'blackboxai/blackbox-pro', name: 'Blackbox Pro' },
    { id: 'blackboxai/anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
    { id: 'blackboxai/openai/gpt-5-codex', name: 'GPT-5 Codex' },
    { id: 'blackboxai/anthropic/claude-opus-4', name: 'Claude Opus 4' },
    { id: 'blackboxai/x-ai/grok-code-fast-1:free', name: 'Grok Code (Free)' },
    { id: 'blackboxai/google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  ],
  claude: [
    { id: 'blackboxai/anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
    { id: 'blackboxai/anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
    { id: 'blackboxai/anthropic/claude-opus-4', name: 'Claude Opus 4' },
  ],
  codex: [
    { id: 'gpt-5-codex', name: 'GPT-5 Codex' },
    { id: 'openai/gpt-5', name: 'GPT-5' },
    { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini' },
    { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano' },
    { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
  ],
  gemini: [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  ],
}

export const DEFAULT_MODELS: Record<BlackboxAgent, string> = {
  blackbox: 'blackboxai/blackbox-pro',
  claude: 'blackboxai/anthropic/claude-sonnet-4.5',
  codex: 'gpt-5-codex',
  gemini: 'gemini-2.0-flash-exp',
}

// ============================================================================
// BlackboxAPI Client
// ============================================================================

export class BlackboxAPI {
  private apiKey: string
  private baseUrl = 'https://cloud.blackbox.ai/api'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Blackbox API key is required')
    }
    // Accept both bb_ and sk- prefixed keys
    if (!apiKey.startsWith('bb_') && !apiKey.startsWith('sk-')) {
      throw new Error('Invalid Blackbox API key format')
    }
    this.apiKey = apiKey
  }

  /**
   * Create a new agent task
   */
  async createTask(request: CreateTaskRequest): Promise<BlackboxTask> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create task: ${response.status} ${error}`)
    }

    const data = await response.json() as CreateTaskResponse
    return data.task
  }

  /**
   * Create a multi-launch task with multiple agents
   * Blackbox will run all agents and automatically analyze/compare results
   */
  async createMultiLaunchTask(request: CreateMultiLaunchTaskRequest): Promise<BlackboxTask> {
    if (request.selectedAgents.length < 2) {
      throw new Error('Multi-launch requires at least 2 agents')
    }
    if (request.selectedAgents.length > 5) {
      throw new Error('Multi-launch supports maximum 5 agents')
    }

    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create multi-launch task: ${response.status} ${error}`)
    }

    const data = await response.json() as CreateTaskResponse
    return data.task
  }

  /**
   * Get task details by ID
   */
  async getTask(taskId: string): Promise<BlackboxTask> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get task: ${response.status} ${error}`)
    }

    const data = await response.json() as GetTaskResponse
    return data.task
  }

  /**
   * Stop a running task
   */
  async stopTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to stop task: ${response.status} ${error}`)
    }
  }

  /**
   * List all tasks for the authenticated user
   */
  async listTasks(): Promise<BlackboxTask[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to list tasks: ${response.status} ${error}`)
    }

    const data = await response.json() as ListTasksResponse
    return data.tasks || []
  }

  /**
   * Check if API key is valid by making a test request
   */
  async validateKey(): Promise<boolean> {
    try {
      await this.listTasks()
      return true
    } catch {
      return false
    }
  }

  // ==========================================================================
  // Chat Completion API (OpenAI-compatible)
  // ==========================================================================

  /**
   * Create a chat completion (OpenAI-compatible endpoint)
   * Base URL: https://api.blackbox.ai/chat/completions
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch('https://api.blackbox.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Chat completion failed: ${response.status} ${error}`)
    }

    return await response.json() as ChatCompletionResponse
  }

  /**
   * Create a streaming chat completion
   * Returns an async generator that yields chunks
   */
  async *createChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<ChatCompletionChunk> {
    const response = await fetch('https://api.blackbox.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, stream: true }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Chat completion stream failed: ${response.status} ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') return
          try {
            yield JSON.parse(data) as ChatCompletionChunk
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

// ============================================================================
// Task Status Mapping
// ============================================================================

/**
 * Map Blackbox task status to Boxcraft session status
 */
export function mapTaskStatusToSessionStatus(
  taskStatus: BlackboxTaskStatus
): 'idle' | 'working' | 'waiting' | 'attention' | 'offline' {
  switch (taskStatus) {
    case 'pending':
      return 'waiting'
    case 'running':
      return 'working'
    case 'completed':
      return 'idle'
    case 'failed':
      return 'attention'
    case 'stopped':
      return 'offline'
    default:
      return 'idle'
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let blackboxApiInstance: BlackboxAPI | null = null

/**
 * Get or create the BlackboxAPI instance
 */
export function getBlackboxAPI(): BlackboxAPI | null {
  if (blackboxApiInstance) {
    return blackboxApiInstance
  }

  const apiKey = process.env.BLACKBOX_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    blackboxApiInstance = new BlackboxAPI(apiKey)
    return blackboxApiInstance
  } catch (e) {
    console.error('Failed to initialize Blackbox API:', e)
    return null
  }
}

/**
 * Check if Blackbox API is configured with a valid key
 */
export function isBlackboxEnabled(): boolean {
  const apiKey = process.env.BLACKBOX_API_KEY
  // Accept both bb_ and sk- prefixed keys
  return !!apiKey && (apiKey.startsWith('bb_') || apiKey.startsWith('sk-'))
}
