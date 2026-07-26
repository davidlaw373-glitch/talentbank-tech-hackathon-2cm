"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Persisted skill watchlist — survives page reloads and route changes so
 * the watchlist semantics the UI implies ("Added to the watchlist") actually
 * hold up across visits.
 *
 * Mirrors the hydration-safe shape of `useNotificationReadState`: the server
 * snapshot is a stable frozen empty array, the client snapshot is populated
 * from localStorage on the first render. Both snapshots are computed
 * synchronously so React never reconciles a divergent server-vs-client tree.
 *
 * Storage layout: `string[]` of skill names. Array is JSON-friendly and
 * stable across versions, unlike `Set`.
 */

const EMPTY: readonly string[] = Object.freeze([]) as readonly string[];

const store: Map<string, string[]> = new Map();
const subscribers: Map<string, Set<() => void>> = new Map();

function ensureSubscribers(storageKey: string): Set<() => void> {
  let set = subscribers.get(storageKey);
  if (!set) {
    set = new Set();
    subscribers.set(storageKey, set);
  }
  return set;
}

function readFromStorage(storageKey: string): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return EMPTY;
  }
}

function persistPinned(storageKey: string, value: readonly string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy errors */
  }
}

function notify(storageKey: string) {
  const set = subscribers.get(storageKey);
  if (!set) return;
  for (const cb of set) cb();
}

/** Return the snapshot for `storageKey`, allocating a stable array the
 *  first time we see this key. Same identity rule as
 *  `useNotificationReadState` — never hand back a new reference or
 *  `useSyncExternalStore` will infinite-loop. */
function snapshotFor(storageKey: string): readonly string[] {
  const cached = store.get(storageKey);
  if (cached) return cached;
  const stored = readFromStorage(storageKey);
  if (stored !== EMPTY) {
    // Defensive copy so callers can mutate in place without leaking into
    // future reads from the same stored reference.
    const copy = [...stored];
    store.set(storageKey, copy);
    return copy;
  }
  store.set(storageKey, []);
  return store.get(storageKey)!;
}

export function useSkillWatchlist(options: { storageKey: string }) {
  const { storageKey } = options;

  const getServerSnapshot = useCallback((): readonly string[] => EMPTY, []);

  const pinned = useSyncExternalStore<readonly string[]>(
    (cb) => {
      const set = ensureSubscribers(storageKey);
      set.add(cb);
      return () => {
        set.delete(cb);
      };
    },
    () => snapshotFor(storageKey),
    getServerSnapshot,
  );

  const isPinned = useCallback(
    (skill: string) => pinned.includes(skill),
    [pinned],
  );

  const toggle = useCallback(
    (skill: string) => {
      const current = store.get(storageKey) ?? [];
      const next = current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill];
      store.set(storageKey, next);
      persistPinned(storageKey, next);
      notify(storageKey);
    },
    [storageKey],
  );

  return { pinned, isPinned, toggle };
}