# AI Game Template

An **MIT-licensed TypeScript/Vite web-game starter** for AI-assisted development.
Its small hybrid demo combines **HTML/CSS** controls, an independent **Canvas 2D**
targeting overlay and a real **Three.js** world. They have separate jobs, share
one deterministic game state and use one simulation clock. A new game can
remove any renderer it does not need.

**No GitHub Actions.** All checks are local.

## Quick start

Create a repository using GitHub's **Use this template** button, then:

```bash
nvm use               # Recommended version in .nvmrc
npm ci                # Locked dependencies
npm run dev           # http://127.0.0.1:5173
npm run check         # Architecture, TypeScript, unit tests, build, template guard
```

For production-browser verification (required after rendering/input changes):

```bash
npx playwright install chromium
npm run test:browser   # Builds and previews the production bundle
```

Set `CHROMIUM_PATH=/path/to/chromium` if using an existing system Chromium.
Browser emulation is not a real device test. Record actual results in
[the playtest matrix](docs/PLAYTEST_MATRIX.md). A missing browser is not a pass.

The supported Node range, exact TypeScript/Vite/Three.js versions and npm
version are declared in `package.json`; `.nvmrc` selects the recommended Node.

## Where to work

| Path | Responsibility |
| --- | --- |
| `src/core/` | Pure game state, commands and seeded RNG |
| `src/data/` | Content definitions and settings |
| `src/application/` | Fixed-step clock, input routing and lifecycle |
| `src/presentation/dom/` | Semantic controls and accessible HUD |
| `src/presentation/canvas2d/` | Procedural 2D rendering and overlays |
| `src/presentation/three/` | 3D scene, camera, projection and raycasting |
| `tests/` | Core and architecture regression tests |
| `examples/testing/` | **Optional** seeded scenarios, invariants and golden replay |

Read [AGENTS.md](AGENTS.md) and [the rendering decision guide](docs/RENDERING_DECISION.md).
Describe your game's actual layer ownership in
[the rendering ADR](docs/decisions/0001-renderer.md), then replace the sample
geometry, rules, controls and related tests with a small vertical slice.

- **DOM-only:** remove both canvases and their renderers; keep semantic UI and
  headless state as appropriate.
- **Canvas-only:** remove Three.js and implement 2D positions/hit testing.
- **Three-only:** remove the Canvas 2D overlay; keep HTML for controls.
- **Hybrid:** keep distinct surfaces and the shared clock/coordinate contract.

`npm run test:examples` exercises the optional replay/invariant examples;
they are intentionally **not** in the default `npm run check` gate. Adapt
them to your game's rules if useful. See [replay testing](docs/REPLAY_TESTING.md),
[architecture](docs/ARCHITECTURE.md) and [local testing](docs/TESTING.md).

An optional local pre-commit hook can be installed with
`./scripts/install-hooks.sh scripts/project-checks.sh`. It will not overwrite
an existing hook and is never required by GitHub.

## Existing games

Do not copy this template wholesale over an established game. Opt in to the
agent rules, renderer decision contract and local checks separately; preserve
working game-specific architecture. Record the template commit and deliberate
deviations in the game's own provenance notes.

**License:** [MIT](LICENSE). When creating a game, update the copyright holder
in `LICENSE` while retaining MIT terms unless you deliberately choose another
license and update the local validation policy.
