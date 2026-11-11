/** Stateless seeded PRNG step (xorshift32). Never use Math.random for rules. */
export function nextRandom(seed: number): { readonly seed: number; readonly value: number } {
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffff_ffff) {
    throw new RangeError('PRNG seed must be a nonzero unsigned 32-bit integer');
  }
  let next = seed >>> 0;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return { seed: next, value: next / 0x1_0000_0000 };
}
