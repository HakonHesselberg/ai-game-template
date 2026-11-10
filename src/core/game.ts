/** Headless example rules. No DOM, Three.js, timers, or mutable global state. */
export interface GameState {
  readonly tick: number;
  readonly score: number;
  readonly paused: boolean;
  readonly seed: number;
  readonly targetIndex: number;
}

export type GameCommand =
  | { readonly type: 'collect' }
  | { readonly type: 'toggle-pause' }
  | { readonly type: 'reset' };

export interface Point3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function createGame(seed = 1): GameState {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError('Seed must be a non-negative safe integer');
  }
  return { tick: 0, score: 0, paused: false, seed, targetIndex: 0 };
}

export function stepGame(state: GameState): GameState {
  return state.paused ? state : { ...state, tick: state.tick + 1 };
}

export function applyCommand(state: GameState, command: GameCommand): GameState {
  switch (command.type) {
    case 'collect':
      return state.paused ? state : { ...state, score: state.score + 1, targetIndex: state.targetIndex + 1 };
    case 'toggle-pause':
      return { ...state, paused: !state.paused };
    case 'reset':
      return createGame(state.seed);
  }
}

/** Tick and seed alone determine the example target's world-space position. */
export function targetPosition(state: GameState): Point3 {
  const phase = state.tick * 0.006 + state.targetIndex * 2.399963 + (state.seed % 97) * 0.01;
  return {
    x: Math.cos(phase) * 2.2,
    y: 1.4 + Math.sin(phase * 1.7) * 0.35,
    z: Math.sin(phase) * 1.45,
  };
}
