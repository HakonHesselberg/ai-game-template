# AI Game Development Template

A comprehensive, language/platform-agnostic template for AI-assisted game development projects.

## Features

- **Test-Driven Development (TDD)** - Red-Green-Refactor workflow with 100% pass rate requirement
- **Data-Driven Design** - Registry pattern for game content
- **Immutable State Architecture** - Functional transformations for predictable behavior
- **Headless-First** - Core logic independent of rendering for fast testing
- **Deterministic Gameplay** - Seeded RNG for reproducible results
- **Custom Slash Commands** - Workflow-optimized commands for Claude Code
- **Comprehensive Documentation** - Architecture, testing, systems, and common pitfalls

## Quick Start

### 1. Clone Template

```bash
# Clone this template
git clone https://github.com/yourusername/ai-game-template.git my-game
cd my-game

# Remove template git history
rm -rf .git
git init
```

### 2. Configure for Your Platform

Edit `docs/PLATFORM.md` and fill in:
- Engine/Framework (Unity, Godot, Bevy, Pygame, Phaser, etc.)
- Language (C#, Python, Rust, TypeScript, etc.)
- Build commands
- Test commands
- Dependencies

### 3. Update Project Info

Edit `CLAUDE.md` and replace placeholders:
- `[Game Name]` - Your game's name
- `[brief description]` - What your game is about
- `<build-command>`, `<test-command>`, `<run-command>` - Platform-specific commands

### 4. Initialize Git

```bash
git add .
git commit -m "Initial commit from ai-game-template"
```

### 5. Start Developing

Use the TDD workflow:

```bash
# Plan your first feature
/plan

# Write tests (RED)
# Implement feature (GREEN)
# Refactor (REFACTOR)

# Verify before marking complete
/evaluate

# Review before committing
/review

# Commit
git commit -m "feat: your feature description"
```

## Project Structure

```
/core/              # Pure game logic (platform-independent)
/application/       # Game loop, managers, orchestration
/presentation/      # UI/rendering layer (optional, platform-specific)
/data/              # JSON/config files (game content)
/tests/             # Test suite
/docs/              # Documentation
  ARCHITECTURE.md   # System design and patterns
  TESTING.md        # Test standards
  GAME_SYSTEMS.md   # Gameplay mechanics
  PLATFORM.md       # Platform-specific guide
  COMMON_PITFALLS.md # Frequent mistakes to avoid
/.claude/
  commands/         # Custom slash commands
    plan.md         # Feature planning
    evaluate.md     # Pre-completion verification
    review.md       # Pre-commit code review
    debug.md        # Issue investigation
    audit.md        # Architecture review
    refactor.md     # Safe refactoring
/scripts/           # Utility scripts
```

## Core Principles

### Test-Driven Development

1. **RED**: Write failing test first
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Clean up while keeping tests green
4. **COMMIT**: Only when all tests pass (100% required)

### Data-Driven Design

- All game content in registries
- Immutable definitions (loaded once, frozen)
- Mutable instances (per-entity state)
- Reference by ID for memory efficiency

### Immutable State

- Game state is immutable
- Functional transformations
- Structural sharing for performance
- Enables AI simulation, replay, and debugging

### Deterministic Gameplay

- All randomness through seeded RNG
- Fixed timestep for game loop
- Consistent ordering of operations
- Same input → same output

## Workflow Commands

### `/plan` - Feature Planning

Convert rough ideas into detailed implementation specs with TodoWrite checklist.

```bash
/plan "Add fire tower with burn damage"
```

### `/evaluate` - Pre-Completion Verification

Verify work is complete before marking tasks done.

```bash
/evaluate          # Full evaluation
/evaluate quick    # Fast check (type + tests)
```

### `/review` - Pre-Commit Code Review

Review changes against project standards before committing.

```bash
/review
```

### `/debug` - Issue Investigation

Systematic Q&A-based root cause analysis.

```bash
/debug
```

### `/audit` - Architecture Review

Review code for compliance with project patterns.

```bash
/audit core/components/
```

### `/refactor` - Safe Refactoring

Execute refactoring with before/after test validation.

```bash
/refactor
```

## Documentation

### For AI Assistants

- **CLAUDE.md** - Main guidance file (read by Claude Code automatically)
- **docs/ARCHITECTURE.md** - System design, patterns, naming conventions
- **docs/COMMON_PITFALLS.md** - Frequent mistakes and how to avoid them

### For Developers

- **README.md** - This file (project overview)
- **docs/TESTING.md** - Test standards and TDD workflow
- **docs/GAME_SYSTEMS.md** - Gameplay mechanics and formulas
- **docs/PLATFORM.md** - Platform-specific setup and build instructions

## Critical Work Standards

**NEVER claim work is complete without verification:**

- ❌ Don't say "complete" if tests are failing
- ❌ Don't pretend problems are solved
- ✅ Actually run the code and verify it works
- ✅ Be honest if something needs more work

See CLAUDE.md for full work standards.

## Common Pitfalls

Before committing, check `docs/COMMON_PITFALLS.md` for:

- Hard-coded magic numbers
- Missing type hints/annotations
- Missing imports
- Null/None handling
- Layer violations
- Breaking immutability
- Non-deterministic operations

## Pre-Commit Checklist

```bash
# 1. Type checking
<type-check-command>

# 2. Run tests
<test-command>

# 3. Review changes
/review

# 4. Commit if all pass
git commit -m "type: description"
```

## Commit Message Convention

```
type: brief description

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- test: Adding tests
- docs: Documentation
- chore: Maintenance
```

## Contributing

1. Use `/plan` to plan changes
2. Follow TDD workflow
3. Use `/evaluate` before marking complete
4. Use `/review` before committing
5. Keep all tests passing (100%)
6. Update documentation as needed

## Customization

### Adding Platform-Specific Patterns

1. Update `docs/PLATFORM.md` with platform details
2. Add platform-specific patterns to `docs/ARCHITECTURE.md`
3. Update `CLAUDE.md` with platform-specific commands

### Adding New Slash Commands

1. Create `.claude/commands/yourcommand.md`
2. Add description frontmatter
3. Document in README.md

### Extending Documentation

- `docs/GAME_SYSTEMS.md` - Add game-specific systems
- `docs/COMMON_PITFALLS.md` - Add discovered pitfalls
- `docs/ARCHITECTURE.md` - Document architectural decisions

## License

[Choose your license - MIT, Apache 2.0, etc.]

## Acknowledgments

This template is based on lessons learned from:
- Chess-Extreme (Unity/C# game project)
- Shardstone (Python roguelike tower defense)
- Industry best practices for AI-assisted development (2025)

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude/docs)
- [Test-Driven Development Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

---

**Ready to start?** Edit `docs/PLATFORM.md` and `CLAUDE.md`, then use `/plan` to plan your first feature!
