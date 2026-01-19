# Blackbox AI Integration

Boxcraft supports **Blackbox AI** as a cloud-based agent backend, allowing you to run AI coding tasks without a local Claude Code installation.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Boxcraft UI                               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Session 1  │  │  Session 2  │  │  Session 3  │             │
│  │  (Local)    │  │ (Blackbox)  │  │ (Blackbox)  │             │
│  │  Claude CLI │  │  Claude     │  │  Gemini     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
    ┌───────────┐    ┌─────────────────────────┐
    │ Local     │    │   Blackbox Cloud API    │
    │ tmux      │    │   cloud.blackbox.ai     │
    └───────────┘    └─────────────────────────┘
```

## Quick Start

### 1. Get Your API Key

1. Go to [cloud.blackbox.ai](https://cloud.blackbox.ai)
2. Sign in or create an account
3. Navigate to **Profile → BLACKBOX API Token**
4. Copy your API key (format: `bb_xxxxxxxxxxxx`)

### 2. Configure Boxcraft

Create a `.env` file in your project root (or `~/.boxcraft/.env` for global config):

```bash
# .env
BLACKBOX_API_KEY=bb_your_api_key_here
```

Or set it as an environment variable:

```bash
export BLACKBOX_API_KEY=bb_your_api_key_here
npx boxcraft
```

### 3. Create a Blackbox Session

1. Start Boxcraft: `npx boxcraft`
2. Open http://localhost:4003
3. Click **"+ New"** in the Sessions panel
4. Fill in the session details:
   - **Name**: A friendly name (e.g., "Backend Refactor")
   - **Repository URL**: Your GitHub repo (e.g., `https://github.com/user/repo`)
   - **Branch**: The branch to work on (default: `main`)
   - **Agent**: Choose from Blackbox, Claude, Codex, or Gemini
   - **Model**: Select the AI model to use
   - **Prompt**: Describe the task for the AI

5. Click **Create** - the task will be sent to Blackbox cloud!

## Available Agents & Models

### Blackbox Agent
| Model | Description |
|-------|-------------|
| `blackboxai/blackbox-pro` | Blackbox Pro (default) |
| `blackboxai/anthropic/claude-sonnet-4.5` | Claude Sonnet 4.5 |
| `blackboxai/openai/gpt-5-codex` | GPT-5 Codex |
| `blackboxai/anthropic/claude-opus-4` | Claude Opus 4 |
| `blackboxai/x-ai/grok-code-fast-1:free` | Grok Code (Free) |
| `blackboxai/google/gemini-2.5-pro` | Gemini 2.5 Pro |

### Claude Agent
| Model | Description |
|-------|-------------|
| `blackboxai/anthropic/claude-sonnet-4.5` | Claude Sonnet 4.5 (default) |
| `blackboxai/anthropic/claude-sonnet-4` | Claude Sonnet 4 |
| `blackboxai/anthropic/claude-opus-4` | Claude Opus 4 |

### Codex Agent
| Model | Description |
|-------|-------------|
| `gpt-5-codex` | GPT-5 Codex (default) |
| `openai/gpt-5` | GPT-5 |
| `openai/gpt-5-mini` | GPT-5 Mini |
| `openai/gpt-5-nano` | GPT-5 Nano |
| `openai/gpt-4.1` | GPT-4.1 |

### Gemini Agent
| Model | Description |
|-------|-------------|
| `gemini-2.0-flash-exp` | Gemini 2.0 Flash (default) |
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `gemini-2.5-flash` | Gemini 2.5 Flash |

## Multi-Agent Mode

Blackbox supports running **multiple agents simultaneously** on the same task, then automatically comparing and selecting the best result.

### How It Works

1. Create a task with 2-5 agents selected
2. Blackbox runs all agents in parallel
3. Each agent creates its own branch with changes
4. Blackbox analyzes all implementations and picks a winner
5. The winning implementation can be merged via PR

### Using Multi-Agent in Boxcraft

When creating a session, you can select multiple agents. Boxcraft will:
- Show all agent executions in the 3D visualization
- Display progress for each agent
- Highlight the winning agent when analysis completes
- Provide the PR URL for the winning implementation

## Task Lifecycle

```
┌──────────┐     ┌──────────┐     ┌───────────┐     ┌───────────┐
│ pending  │ ──→ │ running  │ ──→ │ completed │ ──→ │  PR Ready │
└──────────┘     └──────────┘     └───────────┘     └───────────┘
                      │
                      ▼
                ┌──────────┐
                │  failed  │
                └──────────┘
```

### Status Mapping

| Blackbox Status | Boxcraft Status | Visual |
|-----------------|-----------------|--------|
| `pending` | `waiting` | Amber glow |
| `running` | `working` | Cyan glow, animated character |
| `completed` | `idle` | Green glow |
| `failed` | `attention` | Red pulse |
| `stopped` | `offline` | Dim |

## Session Fields

Blackbox sessions have additional fields compared to local tmux sessions:

| Field | Description |
|-------|-------------|
| `taskId` | Blackbox task ID |
| `repoUrl` | GitHub repository URL |
| `branch` | Git branch being worked on |
| `agent` | Selected AI agent |
| `model` | Selected model ID |
| `progress` | Task progress (0-100) |
| `prUrl` | Pull request URL (when complete) |
| `sandboxUrl` | Live sandbox preview URL |
| `taskError` | Error message (if failed) |
| `taskLogs` | Array of task log messages |

## API Reference

### Create Blackbox Task

```bash
POST /sessions
Content-Type: application/json

{
  "name": "My Task",
  "prompt": "Add dark mode support to the app",
  "repoUrl": "https://github.com/user/repo",
  "branch": "main",
  "agent": "blackbox",
  "model": "blackboxai/blackbox-pro"
}
```

### Response

```json
{
  "ok": true,
  "session": {
    "id": "uuid",
    "name": "My Task",
    "status": "waiting",
    "taskId": "blackbox-task-id",
    "repoUrl": "https://github.com/user/repo",
    "branch": "main",
    "agent": "blackbox",
    "model": "blackboxai/blackbox-pro",
    "progress": 0
  }
}
```

### Check Task Status

The server automatically polls Blackbox for task updates and broadcasts them via WebSocket. You can also manually check:

```bash
GET /sessions/:id
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BLACKBOX_API_KEY` | Your Blackbox API key (required for cloud tasks) |

## Troubleshooting

### "Blackbox API key is required"

Make sure you've set the `BLACKBOX_API_KEY` environment variable or added it to your `.env` file.

### "Invalid Blackbox API key format"

API keys must start with `bb_` or `sk-`. Get your key from [cloud.blackbox.ai](https://cloud.blackbox.ai).

### Task stuck in "pending"

- Check your API key is valid
- Ensure the repository URL is accessible
- Check Blackbox cloud status at [status.blackbox.ai](https://status.blackbox.ai)

### Can't see task progress

- Refresh the browser
- Check WebSocket connection (should show "Connected" in UI)
- Check server logs for polling errors

## Comparison: Local vs Blackbox

| Feature | Local (tmux) | Blackbox Cloud |
|---------|--------------|----------------|
| Setup | Requires Claude CLI | Just API key |
| Execution | Your machine | Cloud servers |
| Repository | Any local folder | GitHub repos |
| Multi-agent | Manual | Built-in |
| Cost | Claude subscription | Blackbox credits |
| Speed | Depends on machine | Optimized cloud |

## Security Notes

- Your API key is stored locally and never shared
- Repository access is handled by Blackbox's GitHub integration
- Code changes are made via pull requests (reviewable)
- Sandbox environments are isolated

## Further Reading

- [Blackbox API Documentation](https://docs.blackbox.ai/api-reference/task)
- [Boxcraft Orchestration](./ORCHESTRATION.md)
- [Main Setup Guide](./SETUP.md)
