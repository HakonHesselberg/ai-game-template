# Platform-Specific Guide

> **Note:** This is a template. Fill in the details specific to your platform/engine when starting a new project.

## Platform Information

**Engine/Framework:** [Unity, Godot, Bevy, Pygame, Phaser, etc.]
**Language:** [C#, Python, Rust, TypeScript, etc.]
**Version:** [Specific version - e.g., Unity 6000.2.6f2, Python 3.11+]
**Runtime:** [.NET 8.0, Python 3.11, Node 18, etc.]

## Installation & Setup

### Prerequisites

**Required:**
- [Tool 1] version X.Y or later
- [Tool 2] version X.Y or later

**Optional:**
- [IDE] - Recommended for development
- [Tool 3] - For asset pipeline

### Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd <project-name>

# 2. Install dependencies
<dependency-install-command>

# 3. Platform-specific setup
<platform-setup-command>

# 4. Verify installation
<verification-command>
```

### First-Time Setup

**[Engine-specific setup steps]**

Example for Unity:
1. Open Unity Hub
2. Install Unity version X.Y.Z
3. Add project from disk
4. Wait for asset import
5. Open main scene

Example for Python:
1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate` (Unix) or `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`

## Build Commands

```bash
# Build project
<build-command>
# Example: make build, npm run build, dotnet build, cargo build

# Run tests
<test-command>
# Example: pytest tests/, npm test, dotnet test, cargo test

# Run application
<run-command>
# Example: python main.py, npm start, dotnet run

# Run in development mode
<dev-command>
# Example: npm run dev, cargo run --features dev

# Clean build artifacts
<clean-command>
# Example: make clean, npm run clean, dotnet clean, cargo clean

# Full rebuild
<rebuild-command>
# Example: make build-clean
```

## Project Structure (Platform-Specific)

```
<project-root>/
├── core/                   # Core game logic (platform-independent)
│   ├── entities/
│   ├── components/
│   └── ...
├── application/            # Game loop and managers
├── presentation/           # Platform-specific rendering/UI
├── data/                   # Game content (JSON, configs)
├── tests/                  # Test suite
├── [platform-specific]/    # Engine-specific folders
│   ├── Assets/            # Unity
│   ├── godot/             # Godot
│   ├── resources/         # Generic
│   └── ...
├── docs/                  # Documentation
└── [config files]         # package.json, Cargo.toml, etc.
```

### Platform-Specific Structure

**Unity Example:**
```
UnityProject/
├── Assets/
│   ├── _Project/          # Game code
│   │   ├── Scripts/       # C# scripts
│   │   ├── Prefabs/       # Prefabs
│   │   ├── Scenes/        # Scenes
│   │   └── Resources/     # Runtime assets
│   └── Plugins/           # Third-party assets
│       └── CoreSim/       # Link to /core (junction/symlink)
└── Packages/              # Unity packages
```

**Python Example:**
```
python-project/
├── src/
│   ├── core/              # Core logic
│   ├── application/       # App layer
│   └── presentation/      # Pygame/UI
├── tests/                 # Tests
├── data/                  # JSON configs
└── requirements.txt       # Dependencies
```

## Dependencies

### Core Dependencies

- **[Dependency 1]** - [Purpose - e.g., JSON serialization]
- **[Dependency 2]** - [Purpose - e.g., Physics engine]

### Development Dependencies

- **[Tool 1]** - [Purpose - e.g., Testing framework]
- **[Tool 2]** - [Purpose - e.g., Linting]
- **[Tool 3]** - [Purpose - e.g., Type checking]

### Installation Commands

```bash
# Install core dependencies
<install-core-command>

# Install dev dependencies
<install-dev-command>

# Update dependencies
<update-command>
```

## IDE Configuration

**Recommended IDE:** [VSCode, Visual Studio, Rider, PyCharm, etc.]

### Extensions/Plugins

**Essential:**
- [Extension 1] - [Purpose]
- [Extension 2] - [Purpose]

**Recommended:**
- [Extension 3] - [Purpose]
- [Extension 4] - [Purpose]

### IDE Settings

**VSCode Example (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true
}
```

**Visual Studio Example:**
- Enable code analysis
- Set line length to 100
- Enable auto-format on save

## Type Checking

**Command:**
```bash
<type-check-command>
# Examples:
# - mypy src/
# - tsc --noEmit
# - dotnet build
# - cargo check
```

**Configuration:**

**Python (mypy.ini):**
```ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
```

**TypeScript (tsconfig.json):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Linting and Formatting

**Linter:**
```bash
<lint-command>
# Examples: ruff check, eslint, cargo clippy
```

**Formatter:**
```bash
<format-command>
# Examples: black, prettier, dotnet format, cargo fmt
```

**Pre-commit Hook:**
```bash
# Install hooks
./scripts/install-hooks.sh

# Or manually
<hook-install-command>
```

## Testing

### Running Tests

```bash
# All tests
<test-all-command>

# Unit tests only
<test-unit-command>

# Integration tests
<test-integration-command>

# With coverage
<test-coverage-command>

# Watch mode (auto-run on change)
<test-watch-command>
```

### Test Configuration

**Location:** [Path to test config - e.g., pytest.ini, jest.config.js]

**Example (pytest.ini):**
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

## Platform-Specific Patterns

### [Pattern Name 1]

**When to use:** [Description]

**Implementation:**
```[language]
// Platform-specific example
```

**Example:** [Concrete example]

### [Pattern Name 2]

**When to use:** [Description]

**Implementation:**
```[language]
// Platform-specific example
```

## Debugging

**Debugger:** [Built-in debugger, pdb, Chrome DevTools, etc.]

**Launching debugger:**
```bash
<debug-command>
# Or use IDE's built-in debugger
```

**Breakpoints:**
- [How to set breakpoints in this platform]

**Logging:**
```[language]
// Use platform's logging
logger.info("Message")
console.log("Message")
Debug.Log("Message")
```

### Common Issues

**Issue 1: [Description]**
- **Symptom:** [What you see]
- **Cause:** [Why it happens]
- **Solution:** [How to fix]

**Issue 2: [Description]**
- **Symptom:** [What you see]
- **Cause:** [Why it happens]
- **Solution:** [How to fix]

## Asset Pipeline

> Only applicable if your platform uses assets

**Asset types:**
- Images: [.png, .jpg, etc.]
- Audio: [.wav, .ogg, etc.]
- Data: [.json, .xml, etc.]

**Asset locations:**
- Raw assets: `/assets/raw/`
- Processed assets: `/assets/processed/` or engine-specific

**Asset import:**
```bash
<asset-import-command>
```

**Asset optimization:**
- [Guidelines for asset optimization]

## Performance

### Profiling Tools

- **[Tool 1]** - [Purpose - e.g., CPU profiling]
- **[Tool 2]** - [Purpose - e.g., Memory profiling]

**Running profiler:**
```bash
<profile-command>
```

### Optimization Tips

- [Platform-specific optimization 1]
- [Platform-specific optimization 2]
- [Platform-specific optimization 3]

**Target metrics:**
- Frame rate: 60 FPS (16.67ms per frame)
- Load time: < 3 seconds
- Memory: < 500MB

## Building for Release

### Development Build

```bash
<dev-build-command>
```

### Production Build

```bash
<prod-build-command>
```

**Build artifacts location:** [Path to output]

### Platform-Specific Builds

**Windows:**
```bash
<windows-build-command>
```

**macOS:**
```bash
<macos-build-command>
```

**Linux:**
```bash
<linux-build-command>
```

**Web:**
```bash
<web-build-command>
```

**Mobile (iOS/Android):**
```bash
<mobile-build-command>
```

### Distribution

**Package for distribution:**
```bash
<package-command>
```

**Upload to platform:**
- [Platform-specific instructions - Steam, itch.io, Google Play, etc.]

## Environment Variables

```bash
# Development
export ENV=development
export DEBUG=true

# Production
export ENV=production
export DEBUG=false

# Custom variables
export GAME_DATA_PATH=/path/to/data
```

## Troubleshooting

### Installation Issues

**Problem:** [Common installation issue]
**Solution:** [How to resolve]

### Build Issues

**Problem:** [Common build issue]
**Solution:** [How to resolve]

### Runtime Issues

**Problem:** [Common runtime issue]
**Solution:** [How to resolve]

## Additional Resources

**Official Documentation:**
- [Link to official docs]

**Community Resources:**
- [Forums, Discord, Reddit, etc.]

**Tutorials:**
- [Relevant tutorials]

---

## Quick Reference Card

```bash
# Daily workflow
<build-command>              # Build project
<test-command>               # Run tests
<run-command>                # Run game
<type-check-command>         # Type check
<format-command>             # Format code

# Before commit
<type-check-command>         # Must pass
<test-command>               # Must pass
<lint-command>               # Must pass

# Troubleshooting
<clean-command>              # Clean build
<rebuild-command>            # Full rebuild
```

---

**Remember:** Keep this document updated as you discover platform-specific quirks and solutions!
