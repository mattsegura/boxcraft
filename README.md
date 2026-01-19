# Boxcraft

![Boxcraft Screenshot](public/og-image.png)

## How It Works

Boxcraft visualizes AI coding agents in real-time as a 3D workshop. When an agent uses tools (Read, Edit, Bash, etc.), a character moves to corresponding workstations.

```
┌─────────────────┐                    ┌─────────────────┐
│  Claude Code    │ ──── hooks ────→   │  Boxcraft       │
│  (local CLI)    │                    │  Server (:4003) │
└─────────────────┘                    └────────┬────────┘
                                                │
┌─────────────────┐                             │ WebSocket
│  Blackbox AI    │ ──── API ──────→           │
│  (cloud agents) │                             ▼
└─────────────────┘                    ┌─────────────────┐
                                       │  Browser        │
                                       │  (3D Workshop)  │
                                       └─────────────────┘
```

### Two Ways to Use Boxcraft

| Mode | Setup | Best For |
|------|-------|----------|
| **Local** (Claude Code) | Install hooks, run in tmux | Full control, offline work |
| **Cloud** (Blackbox AI) | Just add API key | Quick tasks, multi-agent, no local setup |

See [docs/BLACKBOX.md](docs/BLACKBOX.md) for the Blackbox AI integration guide.

## Requirements

- **macOS or Linux** (Windows not supported - hooks require bash)
- **Node.js** 18+
- **jq** - for hook scripts (`brew install jq` / `apt install jq`)
- **tmux** - for session management (`brew install tmux` / `apt install tmux`)

## Quick Start

```bash
# 1. Install dependencies
brew install jq tmux       # macOS
# sudo apt install jq tmux  # Ubuntu/Debian

# 2. Configure hooks (one time)
npx boxcraft setup

# 3. Start server
npx boxcraft
```

Open http://localhost:4003 and use Claude Code normally. You'll see Claude move around the workshop as it uses tools.

**From source:**
```bash
git clone https://github.com/nearcyan/boxcraft
cd boxcraft && npm install && npm run dev
# Opens on http://localhost:4002
```

**To uninstall:** `npx boxcraft uninstall` (removes hooks, keeps your data)

## Browser Control (Optional)

Run Claude in tmux to send prompts from browser:

```bash
tmux new -s claude
claude
```

Then use the input field in the visualization with "Send to tmux" checked.

## Stations

| Station | Tools | Details |
|---------|-------|---------|
| Bookshelf | Read | Books on shelves |
| Desk | Write | Paper, pencil, ink pot |
| Workbench | Edit | Wrench, gears, bolts |
| Terminal | Bash | Glowing screen |
| Scanner | Grep, Glob | Telescope with lens |
| Antenna | WebFetch, WebSearch | Satellite dish |
| Portal | Task (subagents) | Glowing ring portal |
| Taskboard | TodoWrite | Board with sticky notes |

## Features

- **Floating context labels** - See file paths and commands above active stations
- **Thought bubbles** - Claude shows thinking animation while processing
- **Response capture** - Claude's responses appear in the activity feed
- **Subagent visualization** - Mini-Claudes spawn at portal for parallel tasks
- **Cancel button** - Send Ctrl+C to interrupt Claude
- **Split-screen layout** - 60% 3D scene (Workshop), 40% activity feed
- **Voice input** - Speak prompts with real-time transcription (requires Deepgram API key)
- **Attention system** - Zones pulse when sessions need input or finish
- **Sound effects** - Synthesized audio feedback for tools and events ([docs/SOUND.md](docs/SOUND.md))
- **Draw mode** - Paint hex tiles with colors, 3D stacking, and text labels (press `D`)
- **Text labels** - Add multi-line labels to hex tiles with custom modal
- **Zone context menus** - Right-click zones for Info (`I`) or quick Command (`C`) input
- **Station panels** - Toggle with `P` to see recent tool history per workstation
- **Context-aware animations** - Claude celebrates commits, shakes head on errors

## Multi-clauding

![Multi-clauding](public/multiclaude.png)

Run multiple Claude instances and direct work to each:

1. Click **"+ New"** (or `Alt+N`) to spawn a new session
2. Configure name, directory, and flags (`-r`, `--chrome`, `--dangerously-skip-permissions`)
3. Click a session or press `1-6` (or `Alt+1-6` in inputs) to select it
4. Send prompts to whichever Claude you want

Each session runs in its own tmux, with status tracking (idle/working/offline).

See [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md) for the full API and architecture.

## Blackbox AI Integration

Run cloud-based AI agents without any local Claude Code installation:

1. Get your API key from [cloud.blackbox.ai](https://cloud.blackbox.ai) (Profile → BLACKBOX API Token)
2. Add to `.env`: `BLACKBOX_API_KEY=bb_your_key_here`
3. Start Boxcraft and create a new session with a GitHub repo URL

**Available Agents:**
- **Blackbox** — Blackbox Pro, Claude, GPT-5, Gemini models
- **Claude** — Claude Sonnet 4.5, Sonnet 4, Opus 4
- **Codex** — GPT-5 Codex, GPT-5, GPT-4.1
- **Gemini** — Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash

**Multi-Agent Mode:** Run 2-5 agents on the same task — Blackbox automatically compares results and picks the best implementation!

See [docs/BLACKBOX.md](docs/BLACKBOX.md) for the complete integration guide.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `Esc` | Switch focus between Workshop and Feed |
| `1-6` | Switch to session (extended: QWERTY, ASDFGH, ZXCVBN) |
| `0` / `` ` `` | All sessions / overview |
| `Alt+N` | New session |
| `Alt+R` | Toggle voice input |
| `F` | Toggle follow mode |
| `P` | Toggle station panels |
| `D` | Toggle draw mode |

**Draw mode:** `1-6` colors, `0` eraser, `Q/E` brush size, `R` 3D stack, `X` clear

## CLI Options

```bash
boxcraft [options]

Options:
  --port, -p <port>    WebSocket server port (default: 4003)
  --help, -h           Show help
  --version, -v        Show version
```

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/SETUP.md](docs/SETUP.md) | Detailed setup guide |
| [docs/BLACKBOX.md](docs/BLACKBOX.md) | Blackbox AI integration |
| [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md) | Multi-session API |
| [docs/SOUND.md](docs/SOUND.md) | Sound system |
| [CLAUDE.md](CLAUDE.md) | Technical documentation |

Website: https://boxcraft.sh

## License

MIT
