"use client";

/**
 * Persistent onboarding draft + current-step cursor.
 *
 * Wraps the external store in `src/lib/onboarding-store.ts`. Atomic
 * updates guarantee:
 *   - `setDraft` never erases the persisted `complete` flag;
 *   - `setStep` clamps the index into the supplied step count.
 *
 * Hydration is handled by `useSyncExternalStore`'s server-snapshot
 * contract — the server and first client render both use the empty
 * default, then a follow-up render reflects the persisted state.
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import {
  clearRecord,
  getServerSnapshot,
  getSnapshot,
  onboardingStorageKey,
  patchDraft,
  patchStep,
  subscribe,
} from "@/lib/onboarding-store";
import type { OnboardingRole } from "@/types/onboarding";

export type OnboardingDraftApi<Draft> = {
  draft: Draft;
  currentStep: number;
  complete: boolean;
  setDraft: (
    next: Draft | ((prev: Draft) => Draft),
  ) => void;
  setStep: (next: number) => void;
  reset: () => void;
  storageKey: string;
};

function isEmptyObject(value: unknown): boolean {
  return !value || typeof value !== "object" || Object.keys(value).length === 0;
}

export function useOnboardingDraft<Draft>(params: {
  role: OnboardingRole;
  initialDraft: Draft;
  stepCount: number;
}): OnboardingDraftApi<Draft> {
  const { role, initialDraft, stepCount } = params;
  const storageKey = onboardingStorageKey(role);

  const snapshot = useSyncExternalStore(
    (cb) => subscribe(storageKey, cb),
    () => getSnapshot(storageKey),
    getServerSnapshot,
  );

  // `initialDraftRef` keeps a stable identity so functional updaters
  // receive the latest version even after re-renders. Updates happen in
  // an effect so we never touch refs during render.
  const initialDraftRef = useRef(initialDraft);
  useEffect(() => {
    initialDraftRef.current = initialDraft;
  });

  // Resolve the live draft: prefer persisted snapshot.draft if it has any
  // user-entered content; otherwise fall back to the supplied initialDraft.
  const persistedDraft = snapshot.draft;
  const draft = !isEmptyObject(persistedDraft)
    ? (persistedDraft as Draft)
    : initialDraft;

  const rawStep = snapshot.currentStep;
  const currentStep = Math.max(0, Math.min(rawStep, Math.max(0, stepCount - 1)));

  const setDraft = useCallback(
    (next: Draft | ((prev: Draft) => Draft)) => {
      const base = !isEmptyObject(persistedDraft)
        ? (persistedDraft as Draft)
        : initialDraftRef.current;
      const resolved =
        typeof next === "function"
          ? (next as (prev: Draft) => Draft)(base)
          : next;
      patchDraft<Draft>(storageKey, resolved);
    },
    [persistedDraft, storageKey],
  );

  const setStep = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, Math.max(0, stepCount - 1)));
      patchStep(storageKey, clamped);
    },
    [storageKey, stepCount],
  );

  const reset = useCallback(() => clearRecord(storageKey), [storageKey]);

  return {
    draft,
    currentStep,
    complete: snapshot.complete,
    setDraft,
    setStep,
    reset,
    storageKey,
  };
}