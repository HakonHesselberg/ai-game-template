/** Optional example only: adapt schema and validation to the real game. */
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Inspect old/untrusted bytes without repairing or overwriting them on read. */
export function loadVersionedState<T>(
  storage: Pick<StoragePort, 'getItem'>,
  key: string,
  validate: (value: unknown) => T | null,
): T | null {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const snapshot: unknown = JSON.parse(raw);
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return null;
    const fields = snapshot as Record<string, unknown>;
    if (fields.version !== 1 || !Object.hasOwn(fields, 'state')) return null;
    return validate(fields.state);
  } catch {
    return null;
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
