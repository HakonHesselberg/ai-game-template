/** A reference replay adapter for the small sample game, not a universal engine. */
import { createHash } from 'node:crypto';
import { applyCommand, createGame, isGameCommand, stepGame } from '../../src/core/game.ts';
import type { GameCommand, GameState } from '../../src/core/game.ts';
import { assertGameInvariants } from '../../src/core/invariants.ts';

export const REPLAY_VERSION = 1;

export interface ScheduledCommand {
  /** Fixed-step ordinal, independent of pauses, rendering or game-state tick. */
  readonly atStep: number;
  readonly command: GameCommand;
}

export type ReplayEvent =
  | { readonly type: 'collected'; readonly score: number }
  | { readonly type: 'pause-changed'; readonly paused: boolean }
  | { readonly type: 'reset'; readonly seed: number }
  | { readonly type: 'rejected'; readonly reason: 'paused' | 'invalid' };

export interface ReplayRecord {
  readonly step: number;
  readonly commandIndex: number;
  readonly command: GameCommand;
  readonly accepted: boolean;
  readonly events: readonly ReplayEvent[];
  readonly stateDigest: string;
}

export interface StepDigest {
  readonly step: number;
  readonly stateDigest: string;
}

export interface ReplaySnapshot {
  readonly version: typeof REPLAY_VERSION;
  readonly seed: number;
  readonly nextStep: number;
  readonly state: GameState;
  readonly records: readonly ReplayRecord[];
  readonly stepDigests: readonly StepDigest[];
}

/** Sorts object keys recursively; never silently stringifies non-JSON values. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object' && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(',')}}`;
  }
  throw new TypeError('Replay state contains a non-JSON or non-finite value');
}

export function stateDigest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

export function startReplay(seed: number): ReplaySnapshot {
  return { version: REPLAY_VERSION, seed, nextStep: 0, state: createGame(seed), records: [], stepDigests: [] };
}

/** Validates serialized checkpoints before resuming an authoritative simulation. */
export function restoreReplay(json: string): ReplaySnapshot {
  const raw = JSON.parse(json) as Partial<ReplaySnapshot>;
  if (!raw || raw.version !== REPLAY_VERSION) throw new Error('Replay snapshot version mismatch');
  if (!Number.isSafeInteger(raw.nextStep) || raw.nextStep! < 0 || !Number.isSafeInteger(raw.seed) || raw.seed! < 0) {
    throw new Error('Replay snapshot has an invalid step or seed');
  }
  assertGameInvariants(raw.state);
  if (raw.seed !== raw.state.seed || !Array.isArray(raw.records) || !Array.isArray(raw.stepDigests)) {
    throw new Error('Replay snapshot fields are inconsistent');
  }
  return raw as ReplaySnapshot;
}

function eventFor(previous: GameState, next: GameState, command: GameCommand): ReplayEvent {
  if (next === previous) return { type: 'rejected', reason: isGameCommand(command) ? 'paused' : 'invalid' };
  switch (command.type) {
    case 'collect': return { type: 'collected', score: next.score };
    case 'toggle-pause': return { type: 'pause-changed', paused: next.paused };
    case 'reset': return { type: 'reset', seed: next.seed };
  }
}

/** Extend a checkpoint with N fixed steps; no renderer, clock or ambient RNG. */
export function advanceReplay(snapshot: ReplaySnapshot, log: readonly ScheduledCommand[], steps: number): ReplaySnapshot {
  if (snapshot.version !== REPLAY_VERSION) throw new Error('Unsupported replay version');
  if (!Number.isSafeInteger(steps) || steps < 0) throw new RangeError('Replay step count must be a non-negative integer');
  assertGameInvariants(snapshot.state);
  for (let index = 0; index < log.length; index += 1) {
    const atStep = log[index]!.atStep;
    if (!Number.isSafeInteger(atStep) || atStep < 0 || (index > 0 && atStep < log[index - 1]!.atStep)) {
      throw new RangeError('Replay commands must have ordered, non-negative fixed-step positions');
    }
  }

  let state = snapshot.state;
  const records = [...snapshot.records];
  const stepDigests = [...snapshot.stepDigests];
  let cursor = log.findIndex((entry) => entry.atStep >= snapshot.nextStep);
  if (cursor < 0) cursor = log.length;

  for (let step = snapshot.nextStep; step < snapshot.nextStep + steps; step += 1) {
    while (cursor < log.length && log[cursor]!.atStep === step) {
      const command = log[cursor]!.command;
      const prior = state;
      state = applyCommand(state, command);
      assertGameInvariants(state);
      records.push({
        step,
        commandIndex: cursor,
        command,
        accepted: state !== prior,
        events: [eventFor(prior, state, command)],
        stateDigest: stateDigest(state),
      });
      cursor += 1;
    }
    state = stepGame(state);
    assertGameInvariants(state);
    stepDigests.push({ step, stateDigest: stateDigest(state) });
  }
  return { version: REPLAY_VERSION, seed: snapshot.seed, nextStep: snapshot.nextStep + steps, state, records, stepDigests };
}

/** Explain the first drift instead of only printing a different final hash. */
export function assertReplayMatches(expected: { records: readonly ReplayRecord[]; stepDigests: readonly StepDigest[]; finalStateDigest: string }, actual: ReplaySnapshot): void {
  const count = Math.max(expected.records.length, actual.records.length);
  for (let index = 0; index < count; index += 1) {
    const expectedRecord = expected.records[index];
    const actualRecord = actual.records[index];
    if (!expectedRecord || !actualRecord) {
      throw new Error(`Replay first divergence at command ${index}, step ${actualRecord?.step ?? expectedRecord?.step ?? 'missing'}: record count differs`);
    }
    if (canonicalJson(expectedRecord) !== canonicalJson(actualRecord)) {
      throw new Error(`Replay first divergence at command ${index}, step ${actualRecord.step}: expected ${canonicalJson(expectedRecord)}, actual ${canonicalJson(actualRecord)}`);
    }
  }
  const stepCount = Math.max(expected.stepDigests.length, actual.stepDigests.length);
  for (let index = 0; index < stepCount; index += 1) {
    const expectedStep = expected.stepDigests[index];
    const actualStep = actual.stepDigests[index];
    if (!expectedStep || !actualStep || canonicalJson(expectedStep) !== canonicalJson(actualStep)) {
      throw new Error(`Replay first divergence at simulation step ${actualStep?.step ?? expectedStep?.step ?? index}: expected ${expectedStep?.stateDigest}, actual ${actualStep?.stateDigest}`);
    }
  }
  const actualDigest = stateDigest(actual.state);
  if (expected.finalStateDigest !== actualDigest) {
    throw new Error(`Replay final state divergence after step ${actual.nextStep}: expected ${expected.finalStateDigest}, actual ${actualDigest}`);
  }
}
