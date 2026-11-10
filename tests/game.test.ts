import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCommand, createGame, stepGame, targetPosition } from '../src/core/game.ts';

test('stepGame_WithSameInput_ReturnsDeterministicStateWithoutMutation', () => {
  const initial = createGame(42);
  const step1 = stepGame(initial);
  assert.equal(initial.tick, 0);
  assert.equal(step1.tick, 1);
  assert.deepEqual(stepGame(initial), step1);
  assert.deepEqual(targetPosition(step1), targetPosition(stepGame(createGame(42))));
});

test('applyCommand_WhenPaused_FreezesStepsAndCollections', () => {
  const initial = createGame();
  const paused = applyCommand(initial, { type: 'toggle-pause' });
  assert.strictEqual(stepGame(paused), paused);
  assert.strictEqual(applyCommand(paused, { type: 'collect' }), paused);
  const running = applyCommand(paused, { type: 'toggle-pause' });
  assert.equal(applyCommand(running, { type: 'collect' }).score, 1);
});

test('applyCommand_WhenReset_RestoresInitialSeedAndScore', () => {
  const initial = createGame(9);
  const collected = applyCommand(initial, { type: 'collect' });
  assert.equal(initial.score, 0);
  assert.equal(collected.score, 1);
  assert.equal(collected.targetIndex, 1);
  assert.deepEqual(applyCommand(collected, { type: 'reset' }), initial);
});

test('createGame_WithInvalidSeed_ThrowsRangeError', () => {
  assert.throws(() => createGame(-1), RangeError);
  assert.throws(() => createGame(Number.NaN), RangeError);
});
