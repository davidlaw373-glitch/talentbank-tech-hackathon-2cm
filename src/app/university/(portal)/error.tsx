"use client";

import { Button } from "@/components/ui/button";

export default function UniversityPortalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="max-w-xl rounded-xl border p-6" role="alert">
      <h1>We couldn&apos;t load this university page</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
