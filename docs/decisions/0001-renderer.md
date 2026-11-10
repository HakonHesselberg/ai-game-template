# ADR-0001 — Rendering responsibilities

**Status:** Proposed — replace this template when starting a game.

## Requirements

- Game concept and main interactions:
- Target devices, orientations and input methods:
- Accessibility needs:

## Layer ownership

| Layer | What it renders/handles | Why |
| --- | --- | --- |
| HTML/CSS | | |
| Canvas 2D | | |
| Three.js | | |

If a layer is unnecessary, say why. Both Canvas 2D and Three.js are preferred
when each has a real responsibility, not just to satisfy a template rule.

## Integration

- Surface stacking, transparency and texture strategy:
- Shared game state and frame coordinator:
- World/screen/DPR conversions and camera projection:
- Pointer, touch and keyboard routing:
- Resize, pause and resource cleanup:

## Proof before full implementation

- Hardest representative interaction:
- Prototype result and local verification performed:
- Unverified device/manual checks:
- What would make us reconsider this allocation:
