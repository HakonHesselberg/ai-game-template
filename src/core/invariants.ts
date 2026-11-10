import type { GameState } from './game';

/** Example invariants: replace with rules specific to each generated game. */
export function assertGameInvariants(value: unknown): asserts value is GameState {
  if (value === null || typeof value !== 'object') throw new Error('Game state must be an object');
  const state = value as Partial<GameState>;
  for (const field of ['tick', 'score', 'seed', 'targetIndex'] as const) {
    if (!Number.isSafeInteger(state[field]) || state[field]! < 0) {
      throw new Error(`Game state invariant: ${field} must be a non-negative safe integer`);
    }
  }
  if (typeof state.paused !== 'boolean') throw new Error('Game state invariant: paused must be boolean');
  if (state.score !== state.targetIndex) throw new Error('Game state invariant: score must equal collected target count');
}
