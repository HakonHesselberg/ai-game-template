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
`npm run test:examples` demonstrates seeded scenarios, snapshot round-trips,
golden digests and shrinking; adapt or remove those game-specific examples.

Browser tests validate visible DOM, Canvas 2D and Three.js interaction,
responsive layouts, touch/DPR and WebGL lifecycle where supported. A missing
browser, failing startup or WebGL error is **not** a pass. Real phones,
assistive technology and different GPUs need separate evidence in
[PLAYTEST_MATRIX.md](PLAYTEST_MATRIX.md).

Before completion, report the commands actually run, pass/fail counts, manual
checks, outstanding device checks and known risks. Do not regenerate a replay
golden file merely to make a test green; document why the expected behavior
changed. See [REPLAY_TESTING.md](REPLAY_TESTING.md).
