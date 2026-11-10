import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { targetPosition } from '../../src/core/game.ts';
import {
  REPLAY_VERSION, advanceReplay, assertReplayMatches, canonicalJson,
  restoreReplay, startReplay, stateDigest,
} from './helpers/replay.ts';
import type { ReplayRecord, ScheduledCommand, StepDigest } from './helpers/replay.ts';

interface GoldenReplay {
  readonly schemaVersion: number;
  readonly revisionReason: string;
  readonly seed: number;
  readonly steps: number;
  readonly commands: readonly ScheduledCommand[];
  readonly records: readonly ReplayRecord[];
  readonly stepDigests: readonly StepDigest[];
  readonly finalStateDigest: string;
}

const golden = JSON.parse(readFileSync(new URL('./fixtures/replay-golden.json', import.meta.url), 'utf8')) as GoldenReplay;

test('replay_WithGoldenLog_ProducesIdenticalOutcomesEventsAndFinalDigest', () => {
  assert.equal(golden.schemaVersion, REPLAY_VERSION);
  assert.ok(golden.revisionReason.length > 10);
  const actual = advanceReplay(startReplay(golden.seed), golden.commands, golden.steps);
  assertReplayMatches(golden, actual);
  assert.equal(actual.nextStep, golden.steps);
  assert.equal(actual.records.length, golden.commands.length);
});

test('replay_WithDifferentRenderingCadences_ProducesSameAuthority', () => {
  const oneShot = advanceReplay(startReplay(golden.seed), golden.commands, golden.steps);
  let staggered = startReplay(golden.seed);
  for (const chunk of [1, 3, 2, 1, 5]) {
    // Cosmetic work reads authority but cannot consume its RNG or tick it.
    for (let draw = 0; draw < chunk * 7; draw += 1) targetPosition(staggered.state);
    staggered = advanceReplay(staggered, golden.commands, chunk);
  }
  assert.equal(canonicalJson(staggered), canonicalJson(oneShot));
  assertReplayMatches(golden, staggered);
});

test('replay_WithSaveRestoreMidpoint_PreservesGoldenOutcome', () => {
  const beforeSave = advanceReplay(startReplay(golden.seed), golden.commands, 5);
  const restored = restoreReplay(JSON.stringify(beforeSave));
  assert.equal(canonicalJson(restored), canonicalJson(beforeSave));
  const continued = advanceReplay(restored, golden.commands, golden.steps - 5);
  assertReplayMatches(golden, continued);
  assert.throws(() => restoreReplay(JSON.stringify({ ...beforeSave, version: 2 })), /version mismatch/);
  assert.throws(() => restoreReplay(JSON.stringify({ ...beforeSave, state: { ...beforeSave.state, score: -1 } })), /invariant/);
});

test('replay_WithIntentionalDivergence_ReportsFirstCommandAndStep', () => {
  const changed = golden.commands.map((entry, index) => index === 3 ? { ...entry, command: { type: 'collect' } as const } : entry);
  const diverged = advanceReplay(startReplay(golden.seed), changed, golden.steps);
  assert.throws(() => assertReplayMatches(golden, diverged), /first divergence at command 3, step 5/);
});

test('replay_WithStepDigestMismatch_ReportsFirstSimulationStep', () => {
  const actual = advanceReplay(startReplay(golden.seed), golden.commands, golden.steps);
  const changed = golden.stepDigests.map((entry, index) => index === 4 ? { ...entry, stateDigest: 'incorrect' } : entry);
  assert.throws(() => assertReplayMatches({ ...golden, stepDigests: changed }, actual), /first divergence at simulation step 4/);
});

test('replay_WithStateDigest_IsIndependentOfObjectKeyOrder', () => {
  assert.equal(stateDigest({ a: 1, b: { x: 2, y: 3 } }), stateDigest({ b: { y: 3, x: 2 }, a: 1 }));
  assert.throws(() => canonicalJson({ bad: Number.NaN }), /non-JSON/);
  assert.throws(() => canonicalJson({ missing: undefined }), /non-JSON/);
});
