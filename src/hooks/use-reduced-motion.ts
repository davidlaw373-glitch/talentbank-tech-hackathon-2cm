"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/** True when the user prefers reduced motion. JS-driven effects (RAF loops,
 *  intervals, typewriters) must check this — CSS media queries alone don't
 *  stop them. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
