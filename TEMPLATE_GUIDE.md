# AI Game Development Template - Quick Start Guide

This guide helps you get started with the AI game development template.

## What's Included

### Core Documentation (for AI Assistants)

**CLAUDE.md** - Main guidance file
- Project overview and principles
- Critical work standards ("NEVER claim complete without verification")
- Development workflow (TDD)
- Custom slash commands
- Common pitfalls summary
- Quick reference

**docs/ARCHITECTURE.md** - System design
- Core principles (immutability, determinism, layers)
- Naming conventions (Handler, Processor, Manager, etc.)
- Design decisions and rationale
- Performance characteristics
- Common patterns and anti-patterns
- Glossary

**docs/TESTING.md** - Test standards
- Test naming convention: Method_Condition_Behavior
- AAA structure (Arrange-Act-Assert)
- TDD workflow (Red-Green-Refactor)
- Test categories (Unit, Integration, Performance)
- Quality standards (FIRST)
- Headless testing for games
- Coverage goals

**docs/COMMON_PITFALLS.md** - Mistakes to avoid
- Hard-coded magic numbers
- Missing type hints/imports
- Null/None handling
- Layer violations
- Breaking immutability/determinism
- Code duplication
- 12 common pitfalls with ❌/✅ examples
- Pre-commit checklist

**docs/GAME_SYSTEMS.md** - Gameplay mechanics (template)
- Game flow and turn sequence
- Core systems (combat, progression, resources)
- Status effects and abilities
- Balance values and formulas
- Entity types
- Events system
- Data formats

**docs/PLATFORM.md** - Platform-specific guide (template)
- Installation and setup
- Build/test commands
- Dependencies
- IDE configuration
- Debugging
- Asset pipeline
- Troubleshooting

### Custom Slash Commands

**.claude/commands/plan.md** - Feature planning
- Converts rough ideas to detailed specs
- Architecture alignment
- Break down into tasks
- TodoWrite checklist generation

**.claude/commands/evaluate.md** - Pre-completion verification
- Comprehensive evaluation before marking done
- Type checking, tests, quality checks
- Full/quick modes
- Enforces "NEVER claim complete without verification"

**.claude/commands/review.md** - Pre-commit code review
- Check against COMMON_PITFALLS.md
- Architecture compliance
- Test coverage
- Documentation updates
- Performance considerations

**.claude/commands/debug.md** - Issue investigation
- Systematic Q&A root cause analysis
- Hypothesis testing
- Common issues checklist
- Regression test planning

**.claude/commands/audit.md** - Architecture review
- Layer separation compliance
- Naming conventions
- Code quality metrics
- Technical debt identification
- Refactoring recommendations

**.claude/commands/refactor.md** - Safe refactoring
- Red-Green-Refactor process
- Before/after test validation
- Common refactoring patterns
- Metrics tracking

### Supporting Files

**scripts/install-hooks.sh** - Pre-commit hook installer
- Type checking
- Unit tests
- Common pitfall detection
- Layer violation detection

**.gitignore** - Comprehensive ignore patterns
- Python, Node, C#, Rust, Unity, Godot
- Build artifacts, test coverage
- IDE files

**README.md** - Project overview
- Quick start guide
- Project structure
- Workflow overview
- Commands reference

**LICENSE** - MIT License

## First Steps

### 1. Choose Your Platform

Decide on:
- **Engine/Framework**: Unity, Godot, Bevy, Pygame, Phaser, etc.
- **Language**: C#, Python, Rust, TypeScript, etc.
- **Runtime**: .NET, Python, Node, etc.

### 2. Configure PLATFORM.md

Edit `docs/PLATFORM.md` and fill in:

```markdown
**Engine/Framework:** Unity 6000.2.6f2
**Language:** C#
**Version:** .NET 8.0
**Runtime:** .NET 8.0
```

Add your build/test commands:
```bash
<build-command>  → dotnet build
<test-command>   → dotnet test
<run-command>    → dotnet run
```

### 3. Update CLAUDE.md

Replace placeholders:
- `[Game Name]` → Your game name
- `[brief description]` → What your game is about
- `<build-command>` → Your build command
- `<test-command>` → Your test command
- `<run-command>` → Your run command

### 4. Install Pre-commit Hooks

```bash
./scripts/install-hooks.sh
```

Edit `.git/hooks/pre-commit` to set:
- `<type-check-command>` → Your type checker (mypy, tsc, etc.)
- `<test-command>` → Your test runner (pytest, npm test, etc.)

### 5. Update .gitignore

Uncomment the section for your platform (Python, Node, C#, Unity, etc.)

### 6. Create Your First Feature

```bash
# Plan the feature
/plan "Create basic entity system"

# Follow TDD workflow
# 1. Write failing test (RED)
# 2. Implement to pass (GREEN)
# 3. Refactor (REFACTOR)

# Before marking complete
/evaluate

# Before committing
/review

# Commit
git add .
git commit -m "feat: basic entity system"
```

## Workflow Examples

### Feature Development

```
User request
    ↓
/plan → Break down into tasks (TodoWrite)
    ↓
For each task:
    RED:      Write failing test
    GREEN:    Implement feature
    REFACTOR: Clean up code
    ↓
/evaluate → Verify it works
    ↓
/review → Check quality
    ↓
git commit
```

### Bug Fixing

```
Bug report
    ↓
/debug → Find root cause
    ↓
Write regression test (RED)
    ↓
Fix bug (GREEN)
    ↓
/evaluate → Verify fix
    ↓
/review → Check quality
    ↓
git commit
```

### Refactoring

```
Code smell
    ↓
/audit → Identify issues
    ↓
/plan → Plan refactoring
    ↓
/refactor → Execute safely
    ↓
/review → Final check
    ↓
git commit
```

## Key Principles

### 1. Test-Driven Development (MANDATORY)

- Always write test first (RED)
- Implement to pass (GREEN)
- Refactor while keeping tests green
- 100% pass rate before commit

### 2. Never Claim Complete Without Verification

- Run actual tests
- Verify behavior
- Be honest about state
- Use `/evaluate` before marking done

### 3. Immutable State from Day One

- No mutations
- Functional transformations
- Structural sharing for performance
- Enables AI/replay/debug

### 4. Deterministic Gameplay

- Seeded RNG only
- Fixed timestep
- Consistent ordering
- Reproducible results

### 5. Layer Separation

```
Presentation → Application → Core → Data
```

- Core has ZERO dependencies on Application/Presentation
- Dependencies flow downward only

## Common Questions

**Q: Can I use this for non-game projects?**
A: Yes! The principles apply to any software project. Just ignore game-specific parts of GAME_SYSTEMS.md.

**Q: What if I'm not using Claude Code?**
A: The documentation is still valuable. Slash commands are Claude Code-specific, but principles apply universally.

**Q: How do I add platform-specific patterns?**
A: Add them to docs/PLATFORM.md and reference from docs/ARCHITECTURE.md.

**Q: Can I customize the slash commands?**
A: Yes! Edit files in `.claude/commands/` or add new ones.

**Q: What if my platform doesn't have type checking?**
A: Skip type checking sections. Focus on tests and code quality.

**Q: How do I handle assets (sprites, audio, etc.)?**
A: Add asset pipeline details to docs/PLATFORM.md.

## Template Maintenance

As you develop:

### Add to COMMON_PITFALLS.md
When you discover a new pitfall:
1. Document it with ❌ BAD and ✅ GOOD examples
2. Add to pre-commit checklist
3. Update pre-commit hook if needed

### Update ARCHITECTURE.md
When you make architectural decisions:
1. Document the decision
2. Explain the rationale
3. Note alternatives considered
4. Add naming conventions if new patterns emerge

### Expand GAME_SYSTEMS.md
As you add game systems:
1. Document mechanics and formulas
2. Add balance values
3. Document events and data formats
4. Keep it updated

### Keep CLAUDE.md Concise
- Link to detailed docs
- Keep under 300 lines
- Summary of principles
- Quick reference only

## Success Metrics

Your template is working well if:

- ✅ All tests pass 100% of time
- ✅ Code reviews catch issues early
- ✅ No "surprise" bugs in production
- ✅ Easy to onboard new developers
- ✅ Consistent code quality
- ✅ Fast iteration speed
- ✅ Confident refactoring
- ✅ Good documentation coverage

## Getting Help

- Read the relevant doc file (ARCHITECTURE, TESTING, COMMON_PITFALLS)
- Use `/debug` to investigate issues
- Use `/audit` to review code quality
- Check existing projects: Chess-Extreme, Shardstone (if available)

## Next Steps

1. ✅ Configure PLATFORM.md
2. ✅ Update CLAUDE.md placeholders
3. ✅ Install pre-commit hooks
4. ✅ Update .gitignore
5. ✅ Use `/plan` for first feature
6. ✅ Follow TDD workflow
7. ✅ Use `/evaluate` and `/review`
8. ✅ Build your game!

---

**Remember:** This template is a starting point. Customize it for your project, and keep improving it as you learn!

Good luck with your AI-assisted game development! 🎮
