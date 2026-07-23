"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { NotificationItem } from "@/types/notification";

type OverrideMap = Record<string, boolean>;

// In-memory store, keyed by storageKey. `useSyncExternalStore` reads from
// here on the client and reads a stable empty-object snapshot on the
// server, so the first client render is allowed to differ from the server.
// we deliberately hydrate the store from localStorage on the client side
// *before* the first render, so the snapshot the hook returns during
// hydration matches the server snapshot. localStorage writes from
// `setRead` / `markAll` mutate the same object reference, persist to
// localStorage, and notify subscribers in the same tick. **Never return a
// fresh object from `getSnapshot`** — `useSyncExternalStore` uses Object.is
// to compare snapshots, so a new reference every render causes an
// infinite render loop.
const EMPTY: OverrideMap = Object.freeze({}) as OverrideMap;
const store: Map<string, OverrideMap> = new Map();
const subscribers: Map<string, Set<() => void>> = new Map();

function ensureSubscribers(storageKey: string): Set<() => void> {
  let set = subscribers.get(storageKey);
  if (!set) {
    set = new Set();
    subscribers.set(storageKey, set);
  }
  return set;
}

function readFromStorage(storageKey: string): OverrideMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as OverrideMap) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persistOverride(storageKey: string, value: OverrideMap) {
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

/** Return the snapshot for `storageKey`, allocating a stable object the
 *  first time we see this key. Subsequent reads always return the same
 *  reference so `useSyncExternalStore`'s Object.is comparison sees a
 *  stable identity. */
function snapshotFor(storageKey: string): OverrideMap {
  const cached = store.get(storageKey);
  if (cached) return cached;
  const stored = readFromStorage(storageKey);
  if (stored !== EMPTY) {
    store.set(storageKey, stored);
    return stored;
  }
  // Persist an empty stable object so later writes can mutate it in place
  // and `getSnapshot` can keep returning the same reference.
  store.set(storageKey, {});
  return store.get(storageKey)!;
}

/**
 * Shared read-state for notification lists.
 *
 * Why this exists (cross-cutting UX rule — same source of truth for the
 * bell badge in the shell and the row toggles in the Notifications page).
 * Until a backend lands, the source array is treated as the seed and read
 * changes live in component state.
 *
 * Hydration: the server snapshot is always `{}`. The client snapshot is
 * populated from localStorage through `useSyncExternalStore`. Both
 * snapshots are computed *synchronously* during render, so React never
 * has to reconcile a divergent server-vs-client tree — the first client
 * render uses the SSR-default `{}`, then a follow-up render reflects the
 * persisted state. No hydration mismatch.
 */
export function useNotificationReadState(
  source: NotificationItem[],
  options: {
    storageKey?: string;
  } = {},
) {
  const { storageKey } = options;

  // Server snapshot is a single frozen object — must stay referentially
  // stable across renders or `useSyncExternalStore` will infinite-loop.
  const getServerSnapshot = useCallback((): OverrideMap => EMPTY, []);

  const override = useSyncExternalStore<OverrideMap>(
    (cb) => {
      if (!storageKey) return () => {};
      const set = ensureSubscribers(storageKey);
      set.add(cb);
      return () => {
        set.delete(cb);
      };
    },
    () => (storageKey ? snapshotFor(storageKey) : EMPTY),
    getServerSnapshot,
  );

  const setRead = useCallback(
    (id: string, next: boolean) => {
      if (!storageKey) return;
      const current = store.get(storageKey) ?? {};
      const merged = { ...current, [id]: next };
      store.set(storageKey, merged);
      persistOverride(storageKey, merged);
      notify(storageKey);
    },
    [storageKey],
  );

  const toggle = useCallback(
    (id: string) => {
      const current = source.find((n) => n.id === id);
      if (!current) return;
      const fallback = id in override ? Boolean(override[id]) : current.read;
      setRead(id, !fallback);
    },
    [override, setRead, source],
  );

  const markAll = useCallback(() => {
    if (!storageKey) return;
    const next: OverrideMap = {};
    for (const n of source) next[n.id] = true;
    store.set(storageKey, next);
    persistOverride(storageKey, next);
    notify(storageKey);
  }, [source, storageKey]);

  const unreadCount = useMemo(
    () => source.filter((n) => !isReadLocal(n, override)).length,
    [source, override],
  );

  return {
    isRead: (n: NotificationItem) => isReadLocal(n, override),
    toggle,
    setRead,
    markAll,
    unreadCount,
  };
}

function isReadLocal(n: NotificationItem, override: OverrideMap): boolean {
  if (n.id in override) return Boolean(override[n.id]);
  return n.read;
}
