/** Stateless seeded PRNG step (xorshift32). Never use Math.random for rules. */
export function nextRandom(seed: number): { readonly seed: number; readonly value: number } {
  if (!Number.isSafeInteger(seed) || seed < 0) throw new RangeError('PRNG seed must be a non-negative safe integer');
  let next = (seed >>> 0) || 0x9e3779b9;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return { seed: next, value: next / 0x1_0000_0000 };
}
