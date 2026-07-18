"use client";

import { useCallback, useMemo, useState } from "react";

import type { NotificationItem } from "@/types/notification";

/**
 * Shared read-state for notification lists.
 *
 * Why this exists (cross-cutting UX rule — same source of truth for the
 * bell badge in the shell and the row toggles in the Notifications page).
 * Until a backend lands, the source array is treated as the seed and read
 * changes live in component state.
 */
export function useNotificationReadState(
  source: NotificationItem[],
  options: {
    storageKey?: string;
  } = {},
) {
  const { storageKey } = options;
  const [override, setOverride] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined" || !storageKey) return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const isRead = useCallback(
    (n: NotificationItem) => {
      if (n.id in override) return Boolean(override[n.id]);
      return n.read;
    },
    [override],
  );

  const setRead = useCallback(
    (id: string, next: boolean) => {
      setOverride((current) => {
        const merged = { ...current, [id]: next };
        if (storageKey && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch {
            /* ignore quota / privacy errors */
          }
        }
        return merged;
      });
    },
    [storageKey],
  );

  const toggle = useCallback(
    (id: string) => {
      const current = source.find((n) => n.id === id);
      if (!current) return;
      setRead(id, !(id in override ? Boolean(override[id]) : current.read));
    },
    [override, setRead, source],
  );

  const markAll = useCallback(() => {
    const next: Record<string, boolean> = {};
    for (const n of source) next[n.id] = true;
    setOverride(next);
    if (storageKey && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, [setOverride, source, storageKey]);

  const unreadCount = useMemo(
    () => source.filter((n) => !isRead(n)).length,
    [source, isRead],
  );

  return { isRead, toggle, setRead, markAll, unreadCount };
}
