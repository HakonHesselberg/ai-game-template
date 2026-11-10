import type { GameCommand } from '../../src/core/game.ts';
import { nextRandom } from '../../src/core/prng.ts';

/** Reproducible example generator; generated games replace command weights. */
export function generateCommands(seed: number, length: number): GameCommand[] {
  if (!Number.isSafeInteger(length) || length < 0) throw new RangeError('Invalid command length');
  const commands: GameCommand[] = [];
  let state = seed;
  for (let index = 0; index < length; index += 1) {
    const result = nextRandom(state);
    state = result.seed;
    const selection = Math.floor(result.value * 10);
    commands.push(selection < 7 ? { type: 'collect' } : selection < 9 ? { type: 'toggle-pause' } : { type: 'reset' });
  }
  return commands;
}

/** Simple deletion shrinker: keep removing commands while failure reproduces. */
export function shrinkCommands<T>(commands: readonly T[], stillFails: (trial: readonly T[]) => boolean): T[] {
  let current = [...commands];
  for (let index = 0; index < current.length;) {
    const trial = [...current.slice(0, index), ...current.slice(index + 1)];
    if (stillFails(trial)) current = trial;
    else index += 1;
  }
  return current;
}
