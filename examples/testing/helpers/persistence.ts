/** Optional example only: adapt schema and validation to the real game. */
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type SaveReadResult<T> =
  | { readonly status: 'missing' }
  | { readonly status: 'valid'; readonly state: T }
  | { readonly status: 'unsupported'; readonly version: number }
  | { readonly status: 'corrupt' }
  | { readonly status: 'unavailable' };

/** Inspect old/untrusted bytes without repairing or overwriting them on read. */
export function loadVersionedState<T>(
  storage: Pick<StoragePort, 'getItem'>,
  key: string,
  validate: (value: unknown) => T | null,
): SaveReadResult<T> {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { status: 'unavailable' };
  }
  if (raw === null) return { status: 'missing' };
  try {
    const snapshot: unknown = JSON.parse(raw);
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return { status: 'corrupt' };
    const fields = snapshot as Record<string, unknown>;
    if (!Number.isSafeInteger(fields.version) || (fields.version as number) < 1) return { status: 'corrupt' };
    if (fields.version !== 1) return { status: 'unsupported', version: fields.version as number };
    if (!Object.hasOwn(fields, 'state')) return { status: 'corrupt' };
    const state = validate(fields.state);
    return state === null ? { status: 'corrupt' } : { status: 'valid', state };
  } catch {
    return { status: 'corrupt' };
  }
}

/** Publish immutable state only after storage accepts the new snapshot. */
export function commitVersionedTransition<T>(
  current: T,
  transition: (current: T) => T,
  storage: Pick<StoragePort, 'setItem'>,
  key: string,
): T {
  const next = transition(current);
  storage.setItem(key, JSON.stringify({ version: 1, state: next }));
  return next;
}
