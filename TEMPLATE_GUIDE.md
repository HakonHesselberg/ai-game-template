# Adapting the web-game template

This is a **runnable web starter**, not a complete game. It uses MIT licensing
and **never GitHub Actions**. Check [AGENTS.md](AGENTS.md) before coding.

1. Create a repository with **Use this template**. Update the game's name,
   description, package name, title and MIT copyright attribution as appropriate.
2. Read [the rendering guide](docs/RENDERING_DECISION.md) and complete
   [the ADR](docs/decisions/0001-renderer.md). Assign each actual feature to
   HTML/CSS, Canvas 2D or Three.js. Their simultaneous use is encouraged when
   they have distinct jobs.
3. Keep `src/core/` deterministic and DOM-free; replace the sample `Orbit Range`
   rules, data, geometry, overlay and UI with the game's own small vertical slice.
4. Run `npm ci`, `npm run dev`, `npm test`, `npm run build`,
   `npm run test:browser` and `./scripts/validate-template.sh` locally.
   [Platform setup](docs/PLATFORM.md) explains Node and Chromium.
5. Optionally run `./scripts/install-hooks.sh scripts/project-checks.sh` to
   install the included `npm run check` pre-commit wrapper. For a generated
   game, update that wrapper when local checks change. The installer will
   not overwrite existing hooks. Do not create `.github/workflows`.

The architecture checker in `scripts/check-architecture.mjs` disallows reverse
layer dependencies, direct renderer-to-renderer imports, import cycles, external
packages and nondeterministic globals in the pure layers. Update its documented
policy if your game genuinely needs a different dependency structure; keep its
negative regression tests.

The `/plan`, `/evaluate`, `/review`, `/debug`, `/audit` and `/refactor` commands
in `.claude/commands/` remain optional workflow aids. Consult
[architecture](docs/ARCHITECTURE.md), [testing](docs/TESTING.md),
[systems](docs/GAME_SYSTEMS.md) and [common pitfalls](docs/COMMON_PITFALLS.md)
when useful; game-specific mechanics and services are deliberately absent.
