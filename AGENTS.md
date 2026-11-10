# Agent instructions — AI Game Template

This repository is a **runnable TypeScript/Vite web-game starter**. Its sample
is a renderer-integration demonstration, not a prescribed game design.

## Non-negotiable

- **Never use GitHub Actions.** Do not create workflows, trigger hosted checks
  or rely on them. Verify locally and report exactly what ran.
- Preserve unrelated changes. Do not force-push or perform destructive edits.
  For **this template repository**, implement approved changes directly on
  `main`; generated games must set their own Git workflow.
- Define a small scope and verifiable acceptance criteria. Prefer regression
  tests before fixes; do not claim completion with failing or unrun checks.
- Keep authoritative game rules deterministic and headless: seeded randomness,
  stable stepping, validated commands, serializable state and no renderer or
  wall-clock dependency in `src/core/`.

## Web presentation

Read [docs/RENDERING_DECISION.md](docs/RENDERING_DECISION.md) before creating
game visuals. Assign each responsibility deliberately:

- **HTML/CSS:** semantic controls, text, menus and responsive HUD.
- **Canvas 2D:** maps, drawn overlays, sprites and procedural 2D surfaces.
- **Three.js:** 3D scenes, cameras, geometry, depth and lighting.

Canvas 2D and Three.js may and often should coexist. Give them separate
surfaces and distinct jobs; share one game state, clock, coordinate contract
and input-routing policy. Do not add unnecessary duplicate rendering work.

Record the choice in [docs/decisions/0001-renderer.md](docs/decisions/0001-renderer.md)
and validate the hardest cross-layer interaction with a small prototype before
committing to a full implementation. If the game is purely UI or 2D, document
why a layer has no role.

## Work and handoff

Read only relevant architecture/platform/testing docs. Local commands are
`npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run check` and
`npm run test:browser` (Chromium required). Before finishing,
report changed paths, checks actually executed, browser/device checks not run,
risks and the next action. Do not change licensing or add dependencies without
a concrete need and the owner's authorization.
