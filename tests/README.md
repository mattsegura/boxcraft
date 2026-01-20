# Boxcraft Test Suite

Comprehensive test suite for the Boxcraft 3D visualization system.

## Structure

```
tests/
├── unit/              # Unit tests for individual modules
│   ├── server/        # Server-side tests (API, managers)
│   ├── ui/            # UI component tests
│   ├── systems/       # System tests (attention, etc.)
│   └── utils/         # Utility function tests
├── integration/       # Integration tests (event flow, sessions)
├── e2e/              # End-to-end tests (future)
├── fixtures/         # Test data and mocks
└── setup.ts          # Global test setup

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Writing Tests

### Unit Tests

Unit tests should focus on testing individual functions and classes in isolation:

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../../../src/utils/myModule'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('output')
  })
})
```

### Integration Tests

Integration tests verify that multiple components work together:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { EventBus } from '../../src/events/EventBus'
import { createPreToolUseEvent } from '../fixtures/events'

describe('Event Flow Integration', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
  })

  it('should emit and handle events', () => {
    const handler = vi.fn()
    eventBus.on('pre_tool_use', handler)

    const event = createPreToolUseEvent()
    eventBus.emit('pre_tool_use', event, {} as any)

    expect(handler).toHaveBeenCalled()
  })
})
```

### Using Fixtures

Fixtures provide reusable test data:

```typescript
import { createManagedSession } from '../fixtures/sessions'

const session = createManagedSession({
  name: 'Test Session',
  status: 'working',
})
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage for core logic
- **Integration Tests**: Key workflows and event flows
- **E2E Tests**: Critical user journeys (future)

## Test Categories

### Server Tests
- BlackboxAPI client
- GitStatusManager
- ProjectsManager
- Session orchestration
- WebSocket server

### UI Tests
- FeedManager
- AttentionSystem
- TimelineManager
- Modal components
- Keyboard shortcuts

### System Tests
- Event bus and handlers
- Sound system
- Spatial audio
- Draw mode

### Utility Tests
- Tool utilities
- Format functions
- Path helpers

## Mocking

Global mocks are set up in `setup.ts`:
- WebSocket
- AudioContext (for Tone.js)
- localStorage
- Notification API

## CI/CD

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-publish (via npm scripts)

## Future Improvements

- [ ] E2E tests with Playwright
- [ ] Visual regression tests for 3D scenes
- [ ] Performance benchmarks
- [ ] Snapshot tests for UI components
- [ ] API contract tests
