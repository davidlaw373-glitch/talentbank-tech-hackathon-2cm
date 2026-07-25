"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * A back button that prefers `router.back()` so users return to whichever
 * list they navigated from (verification pipeline, graduates directory,
 * disputes queue). Falls back to a known safe URL when there is no
 * navigation history (e.g. direct deep-link or a new tab).
 */
export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <ArrowLeft aria-hidden />
      Back
    </Button>
  );
}
