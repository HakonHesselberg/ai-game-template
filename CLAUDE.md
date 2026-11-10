# Claude Code entry point

Read [AGENTS.md](AGENTS.md) first. It is the canonical instruction file for
all coding agents; this file adds no competing project policy.

Before implementing game visuals, read
[docs/RENDERING_DECISION.md](docs/RENDERING_DECISION.md) and complete the
project's [rendering ADR](docs/decisions/0001-renderer.md). Canvas 2D and
Three.js may be used together when they have distinct responsibilities.

This repository is a **runnable hybrid web-game starter** with local commands
in [docs/PLATFORM.md](docs/PLATFORM.md). Run `npm run check` and the Chromium
`npm run test:browser` smoke test for changes to visuals or interactions.
Do not use GitHub Actions.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md),
[docs/TESTING.md](docs/TESTING.md), and
[docs/COMMON_PITFALLS.md](docs/COMMON_PITFALLS.md) as needed.
