import assert from 'node:assert/strict';
import test from 'node:test';
import { applyCommand, createGame, isGameCommand, stepGame } from '../src/core/game.ts';
import type { GameCommand, GameState } from '../src/core/game.ts';
import { assertGameInvariants } from '../src/core/invariants.ts';
import { nextRandom } from '../src/core/prng.ts';
import { generateCommands, shrinkCommands } from './helpers/generation.ts';

test('applyCommand_WithMalformedCommand_RejectsWithoutChangingState', () => {
  const original = createGame(31);
  const broken = { type: 'collect', arbitrary: true } as unknown as GameCommand;
  assert.equal(isGameCommand(broken), false);
  assert.strictEqual(applyCommand(original, broken), original);
  assert.strictEqual(applyCommand(original, { type: 'cheat' } as unknown as GameCommand), original);
  assert.deepEqual(original, createGame(31));
});

test('nextRandom_WithSameSeed_ReturnsSameBoundedOutput', () => {
  const first = nextRandom(1234);
  assert.deepEqual(first, nextRandom(1234));
  assert.ok(first.value >= 0 && first.value < 1);
  assert.notEqual(first.seed, 1234);
  assert.throws(() => nextRandom(-5), RangeError);
});

test('generatedCommands_AcrossSeededCases_PreserveInvariantsPurityAndSnapshots', () => {
  for (let seed = 1; seed <= 50; seed += 1) {
    const commands = generateCommands(seed, 80);
    assert.deepEqual(commands, generateCommands(seed, 80), `generator seed ${seed}`);
    let state = createGame(seed);
    for (const [index, command] of commands.entries()) {
      const priorReference = state;
      const previous = structuredClone(state);
      state = applyCommand(state, command);
      assertGameInvariants(state);
      assert.deepEqual(state, JSON.parse(JSON.stringify(state)), `snapshot seed ${seed} command ${index}`);
      assert.deepEqual(priorReference, previous, `input purity seed ${seed} command ${index}`);
      state = stepGame(state);
      assertGameInvariants(state);
    }
  }
});

test('generatedCommands_WithInjectedBug_FindsAndShrinksReproducibleFailure', () => {
  const seed = 8721;
  const commands = generateCommands(seed, 60);

  function firstFailure(actions: readonly GameCommand[]): { index: number; message: string } | null {
    let state: GameState = createGame(seed);
    for (const [index, command] of actions.entries()) {
      const before = state;
      state = applyCommand(state, command);
      // Deliberate mutant: the first accepted collection corrupts the count.
      if (command.type === 'collect' && state !== before) state = { ...state, targetIndex: state.targetIndex + 1 };
      try { assertGameInvariants(state); } catch (error) {
        return { index, message: (error as Error).message };
      }
      state = stepGame(state);
    }
    return null;
  }

  const originalFailure = firstFailure(commands);
  assert.ok(originalFailure, `Injected failure not found with seed ${seed}`);
  assert.deepEqual(firstFailure(generateCommands(seed, 60)), originalFailure, 'seed must reproduce failure');
  const shrunk = shrinkCommands(commands, (trial) => firstFailure(trial) !== null);
  assert.ok(shrunk.length < commands.length, `Could not shrink seed ${seed}`);
  assert.deepEqual(firstFailure([...shrunk]), firstFailure(shrunk), 'shrunk failure must reproduce');
  assert.match(firstFailure(shrunk)!.message, /score must equal collected target count/);
});
