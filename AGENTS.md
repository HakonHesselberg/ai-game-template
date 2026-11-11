# Agent instructions — AI Game Template

This repository is a **runnable TypeScript/Vite web-game starter**. Its sample
is a renderer-integration demonstration, not a prescribed game design.
Start with the smallest playable slice. Add persistence, replay, performance
budgets and formal design records only when the game needs them.

## Non-negotiable

- **Never use GitHub Actions.** Do not create workflows, trigger hosted checks
  or rely on them. Verify locally and report exactly what ran.
- Preserve unrelated changes. Do not force-push or perform destructive edits.
  Follow each project's Git workflow; do not impose a branch or PR policy on
  games generated from this template.
- Define a small scope and expected outcome; a sentence is enough for a minor
  change. Add regression tests for bugs and game-rule changes. Never claim an
  unrun or failing check passed.
- Keep authoritative game rules deterministic and headless: seeded randomness,
  stable stepping, validated commands, serializable state and no renderer or
  wall-clock dependency in `src/core/`. Declare other pure top-level folders
  in `architecture.layers.json` rather than letting them pass as unrestricted
  feature folders. See `docs/ARCHITECTURE.md`.
- Run `npm run check` locally for code changes. It enforces architecture
  boundaries, determinism guardrails, unit tests, types, build and the
  no-Actions template check. Do not bypass an architecture finding without
  recording and deliberately updating the policy in
  `scripts/check-architecture.mjs`.
- When a game needs replay, adapt the optional `examples/testing/` patterns.
  Golden baselines require a deliberate revision reason; a changed digest
  alone is not proof of correctness. See `docs/REPLAY_TESTING.md`.
- Use `npm run test:browser` for substantial renderer, input-routing or
  responsive-layout changes when Chromium is available. For small visual
  tweaks, check the affected view directly. Report any unverified behavior;
  use `docs/PLAYTEST_MATRIX.md` for dedicated device/playtest work, not every edit.

## Web presentation

Use [docs/RENDERING_DECISION.md](docs/RENDERING_DECISION.md) when choosing a
game's visual architecture. Assign each responsibility deliberately:

- **HTML/CSS:** semantic controls, text, menus and responsive HUD.
- **Canvas 2D:** maps, drawn overlays, sprites and procedural 2D surfaces.
- **Three.js:** 3D scenes, cameras, geometry, depth and lighting.

Canvas 2D and Three.js may and often should coexist. Give them separate
surfaces and distinct jobs; share one game state, clock, coordinate contract
and input-routing policy. Do not add unnecessary duplicate rendering work.

An obvious allocation needs no formal document. For uncertain or costly
cross-layer decisions, use the optional
[renderer ADR](docs/decisions/0001-renderer.md) and prototype the hardest
interaction before committing to a large implementation.

## Work and handoff

Read only task-relevant docs. Commands are in `README.md`. Give a concise
handoff with what changed, checks actually run and meaningful remaining risks;
expand it for complex tasks. Do not change licensing or add dependencies
without a concrete need and the owner's authorization.
