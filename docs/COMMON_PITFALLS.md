# Common web-game pitfalls

- **Wrong rendering layer:** HTML/CSS for text and controls, Canvas 2D for
  drawn 2D surfaces, Three.js for actual 3D geometry/depth. Use both renderers
  when their responsibilities genuinely differ.
- **Two game clocks:** Only the application advances deterministic state.
  Renderers consume snapshots and do not independently apply rules.
- **Canvas context collision:** Never acquire 2D and WebGL contexts on the
  same canvas. Use separate surfaces or an intentional texture pipeline.
- **DPR mismatch:** Convert between client, canvas-local CSS, device-pixel and
  projected world coordinates explicitly; test portrait and landscape.
- **Overlay stealing input:** Decorative Canvas 2D overlays should use
  `pointer-events: none`; UI and world interaction need deliberate routing.
- **Ambient randomness/time in core:** Use a seed and fixed steps. Keep DOM,
  performance timers, network and GPU resources outside authoritative rules.
- **Unreleased GPU resources:** Dispose geometry, materials and listeners;
  handle WebGL context loss and hidden tabs.
- **Assumed verification:** Headless tests cannot prove 3D rendering works;
  browser emulation cannot prove a real device or screen reader works.
- **Overengineering:** Do not add a backend, game-specific systems or an
  interchangeable mega-renderer until a real game needs them.

See [ARCHITECTURE.md](ARCHITECTURE.md), [RENDERING_DECISION.md](RENDERING_DECISION.md)
and [PLAYTEST_MATRIX.md](PLAYTEST_MATRIX.md). Run `npm run check` locally.
