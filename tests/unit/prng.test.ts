import assert from 'node:assert/strict';
import test from 'node:test';
import { nextRandom } from '../../src/core/prng.ts';

test('nextRandom_WithValidSeed_ProducesDeterministicUnsigned32State', () => {
  const first = nextRandom(1);
  assert.deepEqual(nextRandom(1), first);
  assert.ok(first.seed >= 1 && first.seed <= 0xffff_ffff);
  assert.ok(first.value >= 0 && first.value < 1);
  assert.notDeepEqual(first, nextRandom(0xffff_ffff));
});

test('nextRandom_WithOutOfRangeOrZeroSeed_RejectsAliasingSeeds', () => {
  for (const seed of [0, -1, 2 ** 32, 2 ** 32 + 1, NaN, 1.5]) {
    assert.throws(() => nextRandom(seed), RangeError);
  }
});
