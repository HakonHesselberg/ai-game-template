# Web rendering decision guide

Use **HTML/CSS, Canvas 2D and Three.js together when they have different jobs**.
Do not draw the same scene twice or require an unused layer merely for
consistency. The planned web starter is TypeScript/Vite; the current template
contains guidance only.

| Responsibility | Preferred tool |
| --- | --- |
| Menus, text, HUD layout, inventory, forms, accessible controls | HTML/CSS/DOM |
| 2D maps, annotations, sprites, particles, procedural surfaces | Canvas 2D |
| Spatial worlds, cameras, meshes, lights, depth and raycasting | Three.js |
| A 3D world with 2D map/targeting overlays | Three.js + Canvas 2D + DOM UI |

## Decide before implementation

1. List the game's actual visual and input requirements, including mobile and
   accessibility. Assign every feature to DOM, Canvas 2D or Three.js.
2. State **why** each layer is needed; explain any omitted layer. A decorative
   isometric look alone does not require Three.js.
3. Record the choice in [the renderer ADR](decisions/0001-renderer.md).
4. Test the hardest representative interaction before building the full view.
   For a hybrid, use a moving 3D object with an aligned Canvas 2D marker and
   a clickable HTML control. Test camera movement, resize and touch.
5. Change the allocation early if the spike disproves the assumptions.

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
  Three.js raycasting handles intended world interactions.
- **Bounded work:** Draw only what is needed; avoid repeated full-canvas
  texture uploads. Dispose of Three.js resources and listeners.
- **Lifecycle:** Pause, resize, hidden tabs and WebGL context loss must not
  desynchronize state, markers or input.

## Acceptance evidence

For the selected composition, verify visible behavior, coordinate alignment,
pointer/touch/keyboard routing, desktop/portrait/landscape resize, error
handling and resource cleanup. Record commands actually run and any manual
checks still outstanding. No GitHub Actions.
