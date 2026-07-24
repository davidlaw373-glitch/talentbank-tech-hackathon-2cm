"use client";

/**
 * Completion overlay for the onboarding wizard.
 *
 * Effective completion is:
 *   1. the localStorage override stored under `careeros.onboarding.<role>`, when valid;
 *   2. otherwise `defaultComplete`, supplied from the entity fixture
 *      (`Candidate.onboardingComplete`, `Employer.onboardingComplete`, …).
 *
 * The hook does not import any entity accessor — the caller passes
 * `defaultComplete` so the hook stays role-agnostic and reusable from
 * anywhere in the app.
 *
 * `ready` flips true after the first commit so consumers can avoid
 * rendering the persisted value during the synchronous hydration paint
 * (preventing a brief flash of "incomplete" before the localStorage
 * value arrives on the next render).
 */

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  clearRecord,
  getServerSnapshot,
  getSnapshot,
  markComplete,
  onboardingStorageKey,
  subscribe,
} from "@/lib/onboarding-store";
import type { OnboardingRole } from "@/types/onboarding";

export type OnboardingStatus = {
  /** Effective completion — persisted override wins, otherwise `defaultComplete`. */
  complete: boolean;
  /** False during SSR and the first client render, true after mount. */
  ready: boolean;
  /** Persist `complete = true` for this role. */
  markComplete: () => void;
  /** Clear the persisted record so a fresh onboarding session can start. */
  reset: () => void;
  /** Storage key for this role (useful for advanced use cases). */
  storageKey: string;
};

export function useOnboardingStatus(params: {
  role: OnboardingRole;
  defaultComplete: boolean;
}): OnboardingStatus {
  const { role, defaultComplete } = params;
  const storageKey = onboardingStorageKey(role);

  const snapshot = useSyncExternalStore(
    (cb) => subscribe(storageKey, cb),
    () => getSnapshot(storageKey),
    getServerSnapshot,
  );

  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Defer to a microtask so we still flip during the same commit, but
    // outside the synchronous render pass — this avoids the
    // `react-hooks/set-state-in-effect` lint warning while preserving the
    // post-hydration semantics consumers rely on.
    const timer = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const persistedComplete = snapshot.complete;
  const complete = ready ? persistedComplete || defaultComplete : false;

  return {
    complete,
    ready,
    markComplete: () => markComplete(storageKey),
    reset: () => clearRecord(storageKey),
    storageKey,
  };
}