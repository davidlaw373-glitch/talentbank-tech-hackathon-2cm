"use client";

import { useSyncExternalStore } from "react";

/** Subscribe to a CSS media query. SSR-safe: the server snapshot is `false`,
 *  and the client re-renders with the real value after hydration. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
