# Web rendering decision guide

Use **HTML/CSS, Canvas 2D and Three.js together when they have different jobs**.
Do not draw the same scene twice or require an unused layer merely for
consistency. The runnable sample in `src/` uses TypeScript/Vite and all three
layers to exercise alignment, input and resize, but projects may remove any
layer that has no meaningful job.

| Responsibility | Preferred tool |
| --- | --- |
| Menus, text, HUD layout, inventory, forms, accessible controls | HTML/CSS/DOM |
| 2D maps, annotations, sprites, particles, procedural surfaces | Canvas 2D |
| Spatial worlds, cameras, meshes, lights, depth and raycasting | Three.js |
| A 3D world with 2D map/targeting overlays | Three.js + Canvas 2D + DOM UI |

## Decide before implementation

1. Assign the game's actual visuals and controls to DOM, Canvas 2D or Three.js.
   A decorative isometric look alone does not require Three.js.
2. If ownership is ambiguous or expensive to change, briefly record the tradeoff
   in the optional [renderer ADR](decisions/0001-renderer.md).
3. Prototype a risky cross-layer interaction before building a large system.
   For a hybrid, that may be a 3D object, a projected 2D marker and a DOM control.
4. Change the allocation if the prototype disproves the assumptions.

## Hybrid implementation contract

- **Separate contexts:** Three.js owns a WebGL canvas; Canvas 2D uses another
  canvas or an offscreen texture source. Never request 2D and WebGL contexts
  on the same canvas.
- **One authority:** All layers observe the same headless game state and
  events. Renderers never independently decide gameplay outcomes.
- **One clock:** A coordinator owns simulation stepping and frame scheduling.
  Do not run competing authoritative loops in Canvas 2D and Three.js.
- **Shared coordinates:** Define world, screen, canvas-local and device-pixel
  coordinates; centralize DPR, camera projection, input mapping and resize.
- **Explicit input routing:** DOM controls handle UI input. Decorative overlays
  do not intercept pointers. Interactive Canvas overlays use hit testing;
  Three.js raycasting handles intended world interactions. Games that track
  held pointers must release them on `pointercancel`, `lostpointercapture`,
  window blur and teardown; handle multiple touch IDs independently.
- **Modal UI:** When opening a dialog, prevent background scrolling and game
  shortcuts; restore the previous scroll behavior and keyboard focus on close.
- **Mobile fit:** Honor `env(safe-area-inset-*)`, constrained-height scrolling,
  coarse pointers and zoom. Browser viewport emulation cannot prove notch or
  gesture behavior on physical devices.
- **Bounded work:** Draw only what is needed; avoid repeated full-canvas
  texture uploads. Dispose of Three.js resources and listeners.
- **Lifecycle:** Pause, resize, hidden tabs, `pagehide`/`pageshow` (including
  back-forward cache) and WebGL context loss must not desynchronize state,
  markers or input. If the game persists state, pause its operation before
  saving and validate all restored data.

## Acceptance evidence

Verify behavior relevant to the game's actual layers. For substantial hybrid
changes, check alignment, input routing, resize, recovery and cleanup. Record
what was actually checked and any important gaps. Do not require irrelevant
renderer tests or a formal decision record for a straightforward game.
No GitHub Actions.
