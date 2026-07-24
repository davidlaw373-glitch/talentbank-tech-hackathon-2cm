"use client";

/**
 * External-store module for the onboarding wizard.
 *
 * Mirrors `src/hooks/use-notification-read-state.ts` — module-level Map of
 * stable snapshots keyed by `careeros.onboarding.<role>`, subscriber Sets,
 * and `useSyncExternalStore`-compatible accessors. Each role gets its own
 * versioned record holding the completion flag, current step, and a typed
 * draft payload.
 *
 * Storage key constants are exported so any consumer can clear the record
 * (e.g. on a fresh registration) without re-deriving the naming convention.
 *
 * Hydration: the server snapshot is always a stable empty object so the
 * first client render matches. The client snapshot is populated from
 * localStorage synchronously during render, so React never reconciles a
 * divergent server-vs-client tree.
 */

import type {
  CandidateDraft,
  EmployerDraft,
  UniversityDraft,
} from "@/types/onboarding";

export const ONBOARDING_STORAGE_PREFIX = "careeros.onboarding" as const;

export function onboardingStorageKey(role: "candidate" | "employer" | "university") {
  return `${ONBOARDING_STORAGE_PREFIX}.${role}`;
}

const CURRENT_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Internal store — one entry per storage key                           */
/* ------------------------------------------------------------------ */

type StoredRecord = {
  version: number;
  complete: boolean;
  currentStep: number;
  draft: unknown;
};

const EMPTY: StoredRecord = Object.freeze({
  version: CURRENT_VERSION,
  complete: false,
  currentStep: 0,
  draft: {},
}) as StoredRecord;

const store: Map<string, StoredRecord> = new Map();
const subscribers: Map<string, Set<() => void>> = new Map();

function ensureSubscribers(storageKey: string): Set<() => void> {
  let set = subscribers.get(storageKey);
  if (!set) {
    set = new Set();
    subscribers.set(storageKey, set);
  }
  return set;
}

function readFromStorage(storageKey: string): StoredRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRecord;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.version !== CURRENT_VERSION
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persist(storageKey: string, value: StoredRecord) {
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

/**
 * Return the live snapshot for `storageKey`, allocating a stable object the
 * first time the key is seen. Subsequent reads return the same reference
 * so `useSyncExternalStore`'s Object.is comparison does not infinite-loop.
 */
function snapshotFor(storageKey: string): StoredRecord {
  const cached = store.get(storageKey);
  if (cached) return cached;
  const fromStorage = readFromStorage(storageKey);
  if (fromStorage) {
    store.set(storageKey, fromStorage);
    return fromStorage;
  }
  // Allocate a fresh stable object so later mutations can replace it.
  const fresh: StoredRecord = {
    version: CURRENT_VERSION,
    complete: false,
    currentStep: 0,
    draft: {},
  };
  store.set(storageKey, fresh);
  return fresh;
}

/* ------------------------------------------------------------------ */
/* subscribe / getSnapshot — passed directly to useSyncExternalStore    */
/* ------------------------------------------------------------------ */

export function subscribe(
  storageKey: string,
  callback: () => void,
): () => void {
  const set = ensureSubscribers(storageKey);
  set.add(callback);
  return () => {
    set.delete(callback);
  };
}

export function getSnapshot(storageKey: string): StoredRecord {
  return snapshotFor(storageKey);
}

/** Stable snapshot used during server rendering — never reflects persisted
 *  state, so the first client render always matches. */
export function getServerSnapshot(): StoredRecord {
  return EMPTY;
}

/* ------------------------------------------------------------------ */
/* Atomic mutations — callers MUST go through these so the persisted     */
/* shape stays consistent (e.g. setDraft does not erase `complete`).    */
/* ------------------------------------------------------------------ */

export function replaceRecord(storageKey: string, next: StoredRecord) {
  store.set(storageKey, next);
  persist(storageKey, next);
  notify(storageKey);
}

export function patchDraft<Draft>(
  storageKey: string,
  draft: Draft,
): void {
  const current = snapshotFor(storageKey);
  replaceRecord(storageKey, {
    ...current,
    version: CURRENT_VERSION,
    draft: draft as unknown,
  });
}

export function patchStep(storageKey: string, currentStep: number): void {
  const current = snapshotFor(storageKey);
  replaceRecord(storageKey, { ...current, currentStep });
}

export function markComplete(storageKey: string): void {
  const current = snapshotFor(storageKey);
  replaceRecord(storageKey, { ...current, complete: true });
}

export function clearRecord(storageKey: string): void {
  // Always allocate a fresh object so callers (e.g. register CTA) get a
  // guaranteed empty record. We don't undefine `store.get(storageKey)` —
  // other tabs may still be subscribed and benefit from the reset.
  const fresh: StoredRecord = {
    version: CURRENT_VERSION,
    complete: false,
    currentStep: 0,
    draft: {},
  };
  store.set(storageKey, fresh);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }
  notify(storageKey);
}

/* ------------------------------------------------------------------ */
/* Typed selectors — read the snapshot fields with role-narrowed types  */
/* ------------------------------------------------------------------ */

export function readCandidateDraft(storageKey: string): CandidateDraft | null {
  const snap = snapshotFor(storageKey);
  return snap.draft as CandidateDraft | null;
}

export function readEmployerDraft(storageKey: string): EmployerDraft | null {
  const snap = snapshotFor(storageKey);
  return snap.draft as EmployerDraft | null;
}

export function readUniversityDraft(storageKey: string): UniversityDraft | null {
  const snap = snapshotFor(storageKey);
  return snap.draft as UniversityDraft | null;
}