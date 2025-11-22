# Architecture

## Overview

[Game Name] uses [architecture pattern] with [key design principles].

**Goals:**
- Clean separation of concerns
- Testability and maintainability
- Performance optimization
- Future-proofing for multiplayer/AI/replay systems

## Core Principles

### 1. Immutability

**Why:** Enables AI simulation, replay systems, easy debugging, and predictable state management.

**Implementation:**
- Game state is immutable (create new instances on change)
- Use structural sharing to avoid expensive deep copies
- Pure functions for transformations
- No global mutable state

**Example:**
```
// Bad - mutating state
gameState.score += 10;

// Good - returning new state
gameState = gameState.withIncrementedScore(10);
```

### 2. Determinism

**Why:** Same input always produces same output. Critical for testing, replay, and multiplayer.

**Implementation:**
- All randomness through seeded RNG
- Fixed timestep for game loop
- Consistent ordering of operations
- No reliance on system time for gameplay

**Example:**
```
// Bad - non-deterministic
Math.random()

// Good - deterministic
game.rng.random()
```

### 3. Layer Separation

**Architecture:**
```
┌─────────────────────────────────────┐
│  Presentation (Optional)            │  ← UI, Rendering, Input
│  - Reads state only                 │  ← Platform-specific
│  - No game logic                    │
└──────────────┬──────────────────────┘
               │ reads state
┌──────────────▼──────────────────────┐
│  Application                        │  ← Game Loop, Managers
│  - Orchestrates systems             │  ← Wave spawning, Card system
│  - Manages game flow                │
└──────────────┬──────────────────────┘
               │ uses
┌──────────────▼──────────────────────┐
│  Core                               │  ← Pure Game Logic
│  - Entities, Rules                  │  ← Platform-independent
│  - Zero external dependencies       │  ← 100% testable
└──────────────┬──────────────────────┘
               │ loads from
┌──────────────▼──────────────────────┐
│  Data                               │  ← Registries, JSON
│  - Game definitions                 │  ← Configuration
│  - Asset references                 │
└─────────────────────────────────────┘
```

**Critical Rules:**
- Dependencies flow downward only
- Core has ZERO dependencies on Application or Presentation
- Presentation cannot be imported by Core or Application
- Use events/callbacks to communicate upward

### 4. Data-Driven Design

**Registry Pattern:**
```
Definition (Immutable, Shared)
  ↓ reference by ID
Instance (Mutable, Per-entity)
```

**Benefits:**
- Memory efficient (one definition, many instances)
- Easy to modify (change definition affects all instances)
- Data can be hot-reloaded
- Supports modding/content creation

## Naming Conventions

Use consistent suffixes to indicate component roles:

| Suffix | Purpose | Stateful? | Example |
|--------|---------|-----------|---------|
| **Handler** | Execute single operation | No | DamageHandler |
| **Processor** | Orchestrate workflow | Maybe | MoveProcessor |
| **Manager** | Own mutable state | Yes | EntityManager |
| **System** | High-level API | Yes | PhysicsSystem |
| **Service** | Stateless with DI | No | TargetingService |
| **Operations** | Write/mutation helpers | No (static) | StateOperations |
| **Accessor** | Read/query helpers | No (static) | BoardAccessor |
| **Builder** | Fluent construction | During build | AbilityBuilder |
| **Registry** | Type/ID mapping | Yes (singleton) | AbilityRegistry |
| **Factory** | Object creation | No | EntityFactory |

**Usage Guidelines:**

**Handler** - Execute single effect/operation
```
class DamageHandler:
    def validate(effect, context): ...
    def execute(effect, context): ...
```
- Single responsibility
- Stateless (all data from parameters)
- Generates events for UI

**Processor** - Orchestrate multi-step workflows
```
class MoveProcessor:
    def process_move(state, command):
        # Validate → Execute → Update → Emit events
        ...
```
- Coordinates multiple systems
- May have complex logic
- Returns new state (immutable)

**Manager** - Own and mutate state
```
class EntityManager:
    def __init__(self):
        self._entities = {}

    def add(entity): ...
    def remove(id): ...
```
- Owns mutable data structures
- Provides CRUD operations
- Usually singleton or scoped

**System** - High-level public API
```
class PhysicsSystem:
    def __init__(self):
        self._manager = PhysicsManager()

    def update(dt): ...
```
- Static or singleton
- Clean public API
- Wraps Manager(s)

## File Organization

```
/core/
  /entities/        # Domain entities (Player, Enemy, Tower, etc.)
  /components/      # Composition components (modifiers, abilities)
  /rules/           # Game rules and validators
  /events/          # Event definitions
  state.{ext}       # Root game state

/application/
  /managers/        # State managers (wave, card, progression)
  /processors/      # Command processors
  game.{ext}        # Main game controller
  game_loop.{ext}   # Game loop implementation

/presentation/
  /renderers/       # Visual rendering
  /ui/              # UI components
  /input/           # Input handling
  main.{ext}        # Entry point

/data/
  /registries/      # Registry implementations
  /loaders/         # Data loading utilities
  /definitions/     # JSON/config definitions

/tests/
  /unit/            # Unit tests
  /integration/     # Integration tests
  /manual/          # Manual test scripts
```

## Design Decisions

### Decision: Why Immutable State?

**Chosen:** Immutable game state with structural sharing

**Reasons:**
1. **AI/MCTS Support**: Can clone state in O(1) for game tree search
2. **Replay Systems**: Snapshots at any point without undo complexity
3. **Debugging**: Can inspect any historical state
4. **Multiplayer**: Deterministic state synchronization
5. **Testing**: Easy to set up exact game states

**Alternative Considered:** Mutable state with undo/redo stack

**Why Not:**
- Undo stack is complex and error-prone
- Harder to clone for AI simulation
- More difficult to debug (can't inspect past states)

**Trade-off Accepted:** Slight complexity in creating new instances

### Decision: Why Layer Separation?

**Chosen:** Strict layer separation (Presentation → Application → Core → Data)

**Reasons:**
1. **Testability**: Core can be tested without UI
2. **Headless Mode**: Run simulations without rendering
3. **Platform Independence**: Core works on any platform
4. **Maintainability**: Clear boundaries prevent spaghetti code

**Alternative Considered:** Monolithic architecture

**Why Not:**
- Difficult to test
- Can't run headless
- Hard to maintain as project grows

**Trade-off Accepted:** More files and initial setup complexity

### Decision: Why Registry Pattern?

**Chosen:** Central registries for all game definitions

**Reasons:**
1. **Memory Efficiency**: One definition, many instances
2. **Data-Driven**: Easy to modify without code changes
3. **Hot Reload**: Can reload definitions at runtime
4. **Modding Support**: Easy to add/modify content

**Alternative Considered:** Inline definitions in code

**Why Not:**
- Hard to modify
- No data-driven workflow
- Difficult for non-programmers

**Trade-off Accepted:** Extra indirection when looking up definitions

## Performance Characteristics

| Operation | Cost | Explanation |
|-----------|------|-------------|
| Clone game state | O(1) | Structural sharing (copy references only) |
| Look up entity by ID | O(1) | Dictionary/hash map lookup |
| Find all entities of type | O(n) | Iterate all entities, filter by type |
| Spatial query (radius) | O(k) | Using spatial grid: k = entities in cells |
| Apply component effect | O(c) | c = number of components on entity |

**Optimization Strategies:**
- **Spatial Grids**: For proximity queries (O(k) instead of O(n))
- **Stat Caching**: Cache computed stats, invalidate on change
- **Object Pooling**: Reuse objects (projectiles, particles)
- **Batch Processing**: Process similar entities together

## Testing Strategy

### Unit Tests
- Test pure functions in isolation
- Test component effects independently
- Test game rules without full game state
- Fast (milliseconds per test)

### Integration Tests
- Test system interactions
- Test full game scenarios
- Test state transitions
- Medium speed (seconds per test)

### Performance Tests
- Benchmark critical paths
- Validate O(n) characteristics
- Test with realistic entity counts
- Track performance over time

### Determinism Tests
- Same seed produces same results
- Headless simulation matches UI simulation
- Replay produces identical results

## Common Patterns

### Pattern: Entity-Component System (Lite)

**When to use:** Flexible entity behavior without deep inheritance

**Implementation:**
```
class Entity:
    def __init__(self, definition):
        self.definition = definition  # Immutable
        self.components = []          # Mutable

    def add_component(component):
        self.components.append(component)

    def get_stat(stat_name):
        base = self.definition.get_stat(stat_name)
        for component in self.components:
            base = component.modify_stat(stat_name, base)
        return base
```

### Pattern: Command Pattern

**When to use:** User actions, AI decisions, replay systems

**Implementation:**
```
class Command:
    def execute(game_state):
        # Returns new game state + events
        ...

class MoveCommand(Command):
    def __init__(self, entity_id, target_pos):
        self.entity_id = entity_id
        self.target = target_pos
```

### Pattern: Event-Driven UI

**When to use:** Decouple game logic from presentation

**Implementation:**
```
# Core generates events
events = []
new_state = process_command(old_state, command, events)

# Presentation subscribes
for event in events:
    if isinstance(event, DamageEvent):
        show_damage_number(event.amount, event.position)
```

## Anti-Patterns to Avoid

### ❌ Don't Mix Layers

```
// BAD - Core importing Presentation
// In /core/entity.ts
import { renderSprite } from '../presentation/renderer';

// GOOD - Presentation imports Core
// In /presentation/entity-renderer.ts
import { Entity } from '../core/entity';
```

### ❌ Don't Use Generic Names

```
// BAD - Unclear purpose
class GameLogic { }
class Helper { }
class Util { }

// GOOD - Clear role
class MoveCommandProcessor { }
class DamageCalculator { }
class EntityFactory { }
```

### ❌ Don't Break Immutability

```
// BAD - Mutating state
gameState.score += 10;
entity.health -= damage;

// GOOD - Creating new instances
gameState = gameState.withScore(gameState.score + 10);
entity = entity.withHealth(entity.health - damage);
```

### ❌ Don't Use Non-Deterministic Operations

```
// BAD - Non-deterministic
if (Math.random() < 0.5) { ... }
timestamp = Date.now();

// GOOD - Deterministic
if (game.rng.random() < 0.5) { ... }
timestamp = game.tick_count * game.delta_time;
```

## Glossary

**Structural Sharing:** Immutable data structures share unchanged parts between instances. Only modified parts are copied.

**Determinism:** Given same inputs, always produces same outputs. No randomness except through seeded RNG.

**Registry:** Central lookup table mapping IDs to definitions (e.g., "goblin" → GoblinDefinition).

**Component:** Modular behavior that can be added to entities. Uses composition over inheritance.

**Event-Driven:** Systems communicate through events rather than direct calls. Enables loose coupling.

**Headless Mode:** Running game logic without rendering. Used for testing and simulation.

---

## References

- **CLAUDE.md** - Project overview and guidelines
- **GAME_SYSTEMS.md** - Gameplay mechanics
- **TESTING.md** - Test standards
- **COMMON_PITFALLS.md** - Common mistakes to avoid
