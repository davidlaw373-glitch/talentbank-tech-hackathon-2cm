import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Skeleton primitives — match real Card geometry so layout doesn't shift
 * when real content streams in. Restraint per AGENTS.md:
 * only bg-muted and layout utilities, no custom colors.
 */

type SkeletonBarProps = {
  className?: string;
};

export function SkeletonBar({ className }: SkeletonBarProps) {
  return (
    <div
      aria-hidden
      className={cn("h-3 rounded bg-muted", className)}
    />
  );
}

export function StatTileSkeleton() {
  return (
    <Card aria-hidden>
      <CardContent className="space-y-3 p-5 sm:p-6">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="h-8 w-20 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function RowSkeleton() {
  return (
    <div
      aria-hidden
      className="flex items-center gap-3 rounded-md border bg-background p-3"
    >
      <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/4 rounded bg-muted" />
      </div>
      <div className="h-6 w-16 rounded bg-muted" />
    </div>
  );
}

export function CardListSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <Card aria-hidden>
      <CardHeader className="space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}
