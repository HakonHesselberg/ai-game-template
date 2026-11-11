# Deterministic replay and generated-state testing

These are **optional reference patterns**, not required game rules. Their
runnable implementation lives in `examples/testing/`, outside the default
`npm run check` gate. Adapt or remove them when creating a game.

## Golden replay contract

`examples/testing/fixtures/replay-golden.json` pins:

- Schema version and initial seed.
- Ordered commands assigned to **fixed-step ordinals** (not render frames or
  gameplay ticks that can stop while paused).
- Accepted and rejected outcomes, corresponding events, and a SHA-256 digest
  of the authoritative state after every command.
- A canonical SHA-256 digest after **every fixed simulation step**, to locate
  drift even when no command was issued on the failing step.
- Total simulated steps and a canonical final-state SHA-256 digest.

`examples/testing/helpers/replay.ts` computes those digests from stable, recursively
sorted JSON fields. Node's crypto implementation stays in test code; the
headless `src/core/` has no Node, browser or renderer dependencies.

`npm run test:examples` verifies the golden trace, different rendering cadences, cosmetic
render reads, a JSON save/restore midpoint and an intentionally changed
command. Failures report the **first divergent command and step** (or the
final step if only the final state differs).

**Never silently regenerate a golden file.** A change requires a deliberate
baseline edit, a documented `revisionReason`, and review of changed commands,
events and state hashes. Bump the schema version for incompatible saved-state
formats, with migration or explicit rejection tests.

## Invariants and generated scenarios

`examples/testing/invariants.ts` shows a sample `assertGameInvariants` contract.
`src/core/prng.ts` provides a stateless seeded xorshift step instead of
`Math.random`. Seeds are nonzero unsigned 32-bit integers (`1` through
`0xffffffff`); zero and larger numbers are rejected to avoid 32-bit aliasing.
`examples/testing/helpers/generation.ts` provides a reproducible command
generator and deletion shrinker. `examples/testing/invariants.test.ts` checks input purity,
rejected invalid commands, every state transition, JSON round-trips and a
deliberately injected bug that shrinks to a minimal reproducer.

When a generated scenario fails, record the **seed, ordered commands and first
failing index**. Tailor generators and invariants to the real rules; never copy
sample score/target conditions blindly into unrelated games.

## Budgets and device evidence

Keep headless replay tests fast and deterministic. Profile frame times and
test duration locally on representative hardware; choose budgets from
observed measurements, not an arbitrary universal 16 ms unit assertion.
Consider [PLAYTEST_MATRIX.md](PLAYTEST_MATRIX.md) for focused browser, device and
assistive-technology evidence separately from headless checks.
