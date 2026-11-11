# Web-game architecture

The starter uses one authoritative game state and simulation clock, with
separate DOM, Canvas 2D and Three.js presentation surfaces. Read
[RENDERING_DECISION.md](RENDERING_DECISION.md) before designing the game view.

## Dependency boundaries

| Layer | Owns | Allowed direction |
| --- | --- | --- |
| `src/core/` | Pure deterministic rules, commands, state, seeded RNG | Pure helpers and deliberately reviewed pure packages |
| `src/data/` | Content and configuration | Core definitions and pure helpers |
| `src/presentation/dom/` | Semantic controls, HUD, accessible text | Read state, emit input callbacks |
| `src/presentation/canvas2d/` | Maps, sprites and procedural overlays | Read state and shared screen contracts |
| `src/presentation/three/` | Spatial world, camera, lighting and picking | Read state and shared screen contracts |
| `src/application/` | Input routing, fixed-step loop, lifecycle and composition | Coordinate all layers |

Shared presentation types belong in `src/presentation/` (for example
`coordinates.ts`), not in one renderer imported by another. Other feature
folders can be introduced deliberately. The local checker protects known
layer boundaries; review third-party packages for deterministic/browser-free
behavior instead of treating the checker as a security sandbox.
Pure layers must not import stylesheets or reference browser-only DOM/WebGL
types, even in type annotations.
Use seeded randomness directly; destructuring `Math.random` is forbidden, but
the checker is not a complete alias/data-flow analyzer.

Unrecognized `src/` folders are treated as **features**, not pure rules. If a
game introduces a separate deterministic folder, opt it into the existing
guardrails with an optional `architecture.layers.json` at the repository root:

```json
{ "pureLayerAliases": { "physics": "core", "content": "shared" } }
```

This makes `src/physics/` obey core rules and `src/content/` obey shared-helper
rules (including import direction and forbidden ambient state). Aliases must
name top-level folders and map to `shared`, `core` or `data`. Ordinary feature
folders need no declaration.

The default dependency direction is `data → core` (data can import core types;
core cannot import data), and the checker scans `src/`. For a game whose pure
definitions are independent and imported by core rules, or whose source files
live at the repository root, opt in explicitly:

```json
{ "dataDependency": "core-to-data", "sourceRoot": "." }
```

Both configurations prohibit circular imports and keep browser/rendering APIs
out of pure layers. `sourceRoot` accepts only `src` or `.`; the root layout
excludes tests, dependencies, scripts and generated assets from source checks.
`pureLayerAliases` can be combined with either option. Never enable both
directions between core and data. When `sourceRoot` is `.`, nested `src/` entry
files and layer directories are classified the same way as their root-level
counterparts, including pure-layer and renderer boundary checks.

## Invariants worth preserving

- Core transitions take explicit state and commands and return new state.
- Use a seeded RNG, stable ordering and fixed simulation steps for gameplay.
- A renderer cannot award points, advance authority, or start a second game loop.
- HTML controls own UI input. A transparent 2D overlay must not intercept 3D
  pointer input unless it implements explicit hit testing.
- World-to-screen projection and pointer mapping use CSS pixels. Canvas
  backing stores account for device-pixel ratio independently.
- Resize, hidden tabs, WebGL context loss and teardown must not desynchronize
  state or leak resources.

The runnable hybrid example is a vertical slice, **not** a requirement that
every game use all three layers. Remove unused renderers; use the optional
[renderer ADR](decisions/0001-renderer.md) only for decisions worth documenting.

Run `npm run check` for code changes and the browser smoke test for significant
rendering or input integration changes when available. See [TESTING.md](TESTING.md).
