# AI Game Template

An **MIT-licensed, runnable TypeScript/Vite web-game starter** for AI-assisted
development. The small sample combines **Three.js** (interactive 3D world),
**Canvas 2D** (camera-aligned targeting marker) and **HTML/CSS** (responsive,
accessible controls). Use only the layers your actual game needs.

**No GitHub Actions.** All verification runs locally.

## Start

Use GitHub's **Use this template** on
[ai-game-template](https://github.com/HakonHesselberg/ai-game-template), then:

```bash
nvm use              # Recommended Node.js 26.13.0 LTS
npm ci
npm run dev          # http://127.0.0.1:5173
npm test             # Headless deterministic game rules
npm run build        # Strict TypeScript check + Vite production build
npm run check        # Includes template guard / local hook tests
```

For a real-browser smoke test, install Chromium through Playwright once and run:

```bash
npx playwright install chromium
npm run test:browser
```

If Chromium is already installed elsewhere, set `CHROMIUM_PATH=/path/to/chromium`
for `npm run test:browser` instead. The test checks real Canvas 2D drawing,
Three.js raycast interaction, DOM controls and portrait resize.

## Change this into your game

| Location | Responsibility |
| --- | --- |
| `src/core/game.ts` | Pure, deterministic, serializable game state, fixed ticks and commands |
| `src/data/settings.ts` | Example configuration; move game content to data registries |
| `src/application/start.ts` | **One** simulation/render clock, inputs, resize and lifecycle |
| `src/presentation/dom/` | Semantic HTML controls and HUD updates |
| `src/presentation/canvas2d/` | Independent transparent 2D overlay |
| `src/presentation/three/` | 3D world, camera, raycasting and world-to-screen projection |
| `tests/` | Headless state tests and real-browser smoke test |

1. Read [AGENTS.md](AGENTS.md) and the [rendering decision guide](docs/RENDERING_DECISION.md).
2. Describe your game's actual requirements in [the rendering ADR](docs/decisions/0001-renderer.md).
3. Remove unused renderers, sample geometry, UI, rules and tests; preserve the
   separation of state, game clock and input ownership.
4. Replace `Orbit Range` with your game, iterate on a small vertical slice, and
   keep `npm run check` and `npm run test:browser` passing locally.

**DOM-only:** remove both canvas surfaces/modules; keep the coordinator and
headless core. **Canvas-only:** remove `createWorld`, and replace the sample
Three.js projection with 2D canvas positions/hit tests. **Three-only:** remove
`createOverlay`, and keep the DOM for controls. The current sample intentionally
uses all three to prove their integration, not to mandate them for every game.

See [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md) for the short customization checklist,
[docs/PLATFORM.md](docs/PLATFORM.md) for exact tooling and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architectural principles.

**License:** [MIT](LICENSE). No build, deployment, test or release automation is
configured on GitHub.
