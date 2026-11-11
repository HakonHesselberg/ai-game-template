import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCommand, createGame, type GameState } from '../../src/core/game.ts';
import { commitVersionedTransition, loadVersionedState } from './helpers/persistence.ts';

function validGameState(value: unknown): GameState | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const state = value as Partial<GameState>;
  return Number.isSafeInteger(state.tick) && state.tick! >= 0 &&
    Number.isSafeInteger(state.score) && state.score! >= 0 &&
    Number.isSafeInteger(state.targetIndex) && state.targetIndex! >= 0 &&
    Number.isInteger(state.seed) && state.seed! >= 1 && state.seed! <= 0xffff_ffff &&
    typeof state.paused === 'boolean' ? state as GameState : null;
}

test('loadVersionedState_WithValidSnapshot_RoundTripsValidatedState', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  const original = createGame(19);
  const updated = commitVersionedTransition(original,
    (state) => applyCommand(state, { type: 'collect' }), storage, 'save');
  assert.equal(original.score, 0);
  assert.equal(updated.score, 1);
  assert.deepEqual(loadVersionedState(storage, 'save', validGameState), { status: 'valid', state: updated });
});

test('loadVersionedState_WithMissingOrUnavailableStorage_DistinguishesBoth', () => {
  assert.deepEqual(loadVersionedState({ getItem: () => null }, 'save', validGameState), { status: 'missing' });
  assert.deepEqual(loadVersionedState({ getItem: () => { throw new Error('denied'); } }, 'save', validGameState),
    { status: 'unavailable' });
});

test('loadVersionedState_WithInvalidOrOldSave_PreservesBytesAndReportsReason', () => {
  for (const [raw, result] of [
    ['{', { status: 'corrupt' }],
    ['{"version":2,"state":{}}', { status: 'unsupported', version: 2 }],
    ['{"version":1,"state":{"seed":0}}', { status: 'corrupt' }],
  ] as const) {
    const storage = { getItem: (_key: string) => raw };
    assert.deepEqual(loadVersionedState(storage, 'save', validGameState), result);
    assert.equal(storage.getItem('save'), raw);
  }
});

test('commitVersionedTransition_WhenStorageFails_DoesNotCommitInMemoryState', () => {
  const original = createGame(7);
  let current = original;
  const storage = { setItem: () => { throw new Error('quota exceeded'); } };
  assert.throws(() => {
    current = commitVersionedTransition(current,
      (state) => applyCommand(state, { type: 'collect' }), storage, 'save');
  }, /quota exceeded/);
  assert.strictEqual(current, original);
});
