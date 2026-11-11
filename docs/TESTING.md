# Local verification

All tests run **locally**. Never add or depend on GitHub Actions.

```bash
npm ci
npm run check             # Architecture, types, core tests, build, template guard
npm run test:examples     # Optional sample replay / invariant tests
npm run test:browser      # Production preview + Playwright Chromium smoke tests
```

`npm run check` is the default fast gate. It includes negative architecture
fixtures to prove forbidden imports and nondeterministic calls are detected.
`npm test` discovers unit tests recursively under `tests/` with `.test.ts`,
`.test.js` or supported Node module extensions; keep Playwright tests as
`.spec.ts` under `tests/browser/` so they run only in `test:browser`.
`npm run test:examples` demonstrates seeded scenarios, snapshot round-trips,
golden digests and shrinking; it also typechecks the optional examples. Adapt
or remove those game-specific examples.

Browser tests validate visible DOM, Canvas 2D and Three.js interaction,
responsive layouts, live DPR changes, touch and WebGL lifecycle where supported. A missing
browser, failing startup or WebGL error is **not** a pass. Real phones,
assistive technology and different GPUs need separate evidence in
[PLAYTEST_MATRIX.md](PLAYTEST_MATRIX.md) when those devices matter to the game.
Playwright retains screenshots and traces for failures in the ignored
`test-results/` directory when a browser launches; review them locally.

For games with saves, treat decoded storage as untrusted input. Version its
schema; bound sizes and numbers; reject unsupported formats; test corruption,
migration, JSON round-trips and back-forward-cache restoration. These checks
are optional because the starter has no persistence requirement. The runnable
`examples/testing/persistence.test.ts` distinguishes missing, corrupt, unsupported
and unavailable storage without mutating saved bytes, and demonstrates avoiding
in-memory commits when storage writes fail. Never treat an invalid save as a
missing one and silently overwrite it.

When a game adds a modal, help screen or overlay, adapt the optional input
isolation example in `tests/browser/hybrid.spec.ts`: focused controls must not
trigger world shortcuts, and closing a dialog must restore game input.

For small tasks, a concise check summary is enough. Expand browser/device
evidence for substantial changes and playtest milestones. Do not regenerate
a replay golden file merely to make a test green; document why expected
behavior changed. See [REPLAY_TESTING.md](REPLAY_TESTING.md).
