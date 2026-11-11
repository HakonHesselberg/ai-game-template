# ADR-0001 — Renderer allocation for the starter example

**Status:** Optional example. Replace it only when a game has a renderer tradeoff
worth recording; straightforward games do not need a formal ADR.

## Requirements and choice

This tiny example has a moving 3D target, a camera-aligned 2D reticle, score
and pause/reset controls. It must respond to pointer/touch, offer keyboard
controls, and resize across desktop and mobile viewports.

| Layer | Owned responsibilities | Reason |
| --- | --- | --- |
| HTML/CSS | Heading, score, status, accessible pause/reset buttons, responsive layout | Semantic UI, focus and screen-reader labels |
| Three.js | Lit scene, world geometry, camera, target, raycasting, world-to-screen projection | Actual 3D spatial relationship |
| Canvas 2D | Transparent target ring/marks in screen pixels | Independent dynamic 2D annotation without rebuilding 3D geometry |

## Integration contract

- Distinct stacked canvases: WebGL below, transparent pointer-pass-through 2D
  above, DOM controls on top. No double-rendering of the world.
- `src/core/game.ts` alone decides score, pause, tick and target motion.
- `src/application/start.ts` owns one `requestAnimationFrame` and fixed-step
  simulation accumulator; renderers accept state and never create game clocks.
- The Three.js camera projects target world coordinates to canvas-local CSS
  pixels; both canvases independently size their device-pixel backing stores.
- DOM handles its buttons, WebGL canvas handles target pointer raycasts,
  keyboard Space/R controls pause/reset and focused canvas Enter collects.
- ResizeObserver updates both surfaces. Hidden tabs discard elapsed simulation
  time. WebGL loss suspends rendering; restoration resizes again. Dispose
  removes listeners/resources for HMR.

## Verification and replacement

`tests/browser/hybrid.spec.ts` is the representative integration test:
build and load the production bundle, detect real Canvas 2D marker pixels,
click/tap their projected location in the 3D canvas, verify score and keyboard/DOM
controls, then resize through portrait and landscape and test WebGL context
loss/restoration where supported.
Run it in Chromium locally along with `npm run check`. The sample is not a
universal requirement to use all three layers: remove unused layers in a
game. Record important tradeoffs here if useful. Revisit if target alignment,
input behavior, performance or accessibility differs from requirements.
