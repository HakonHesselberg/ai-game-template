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
npm ci                # Locked dependencies
npm run dev           # http://127.0.0.1:5173
npm run check         # Architecture, tests, build, no-GitHub-Actions policy
```

For substantial rendering or input changes, verify in a production browser:

```bash
npx playwright install chromium
npm run test:browser   # Builds and previews the production bundle
```

Set `CHROMIUM_PATH=/path/to/chromium` if using an existing system Chromium.
Browser emulation is not a real device test. Use the optional
[playtest matrix](docs/PLAYTEST_MATRIX.md) for focused device testing; a missing
browser is an unverified check, not a pass. Minor styling changes can be
verified by inspecting the affected view directly.

Use a supported Node version from `package.json`; `.nvmrc` selects the
recommended version if you use `nvm` (`nvm use` is optional).
Exact TypeScript/Vite/Three.js versions and npm version are in `package.json`.

## Where to work

| Path | Responsibility |
| --- | --- |
| `src/core/` | Pure game state, commands and seeded RNG |
| `src/data/` | Content definitions and settings |
| `src/application/` | Fixed-step clock, input routing and lifecycle |
| `src/presentation/dom/` | Semantic controls and accessible HUD |
| `src/presentation/canvas2d/` | Procedural 2D rendering and overlays |
| `src/presentation/three/` | 3D scene, camera, projection and raycasting |
| `tests/` | Game and no-GitHub-Actions regression tests |
| `template-tests/` | Template-maintainer architecture-checker self-tests |
| `examples/testing/` | **Optional** seeded scenarios, invariants and golden replay |

Read [AGENTS.md](AGENTS.md) and [the rendering decision guide](docs/RENDERING_DECISION.md).
Choose each layer's role, then replace the sample geometry, rules, controls
and related tests with a small playable slice. The
[renderer ADR](docs/decisions/0001-renderer.md) is an optional example for
decisions that need a written tradeoff.

- **DOM-only:** remove both canvases and their renderers; keep semantic UI and
  headless state as appropriate.
- **Canvas-only:** remove Three.js and implement 2D positions/hit testing.
- **Three-only:** remove the Canvas 2D overlay; keep HTML for controls.
- **Hybrid:** keep distinct surfaces and the shared clock/coordinate contract.

`npm run test:examples` exercises the optional replay/invariant examples;
they are intentionally **not** in the default `npm run check` gate. Adapt
them to your game's rules if useful. See [replay testing](docs/REPLAY_TESTING.md),
[architecture](docs/ARCHITECTURE.md) and [local testing](docs/TESTING.md).

`npm run check:template` adds architecture-checker self-tests, MIT attribution,
documentation and local-hook validation for maintainers of **this template**.
Generated games only need `npm run check`; adapt the sample tests and checks
as their game evolves.

An optional local pre-commit hook can be installed with
`./scripts/install-hooks.sh scripts/project-checks.sh`. It will not overwrite
an existing hook and is never required by GitHub.

## Existing games

Do not copy this template wholesale over an established game. Opt in to the
relevant agent rules, rendering guidance and local checks separately; preserve
working game-specific architecture. Record the template commit and deliberate
deviations in the game's own provenance notes.

**License:** [MIT](LICENSE). When creating a game, preserve the template's
original copyright and permission notice for copied code. You may add your
own copyright notice and choose a different license for your original game
code; document the choice. Template-only license validation is not part of a
game's default checks.
