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
- Run `npm run check` locally for code changes. It enforces architecture
  boundaries, determinism guardrails, unit tests, types, build and the
  no-Actions template check. Do not bypass an architecture finding without
  recording and deliberately updating the policy in
  `scripts/check-architecture.mjs`.
- When a game needs replay, adapt the optional `examples/testing/` patterns.
  Golden baselines require a deliberate revision reason; a changed digest
  alone is not proof of correctness. See `docs/REPLAY_TESTING.md`.
- Run `npm run test:browser` for renderer, input and layout changes and record
  actual browser/device observations in `docs/PLAYTEST_MATRIX.md`. Never
  describe a simulated viewport as a real device or an unrun check as passing.

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

Read only relevant architecture/testing docs. Commands are documented in
`README.md`, including optional `npm run test:examples` and Chromium checks.
Before finishing,
report changed paths, checks actually executed, browser/device checks not run,
risks and the next action. Do not change licensing or add dependencies without
a concrete need and the owner's authorization.
