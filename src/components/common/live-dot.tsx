import { cn } from "@/lib/utils";

interface LiveDotProps {
  className?: string;
  label?: string;
}

// A small pulsing status dot. The outer ring pulses via animate-pulse-ring
// and the inner dot sits on top, matching the visual language used across
// the cover page live indicators.
export function LiveDot({ className, label }: LiveDotProps) {
  return (
    <span
      className={cn("relative inline-flex h-2 w-2", className)}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/40 animate-pulse-ring" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/60" />
    </span>
  );
}
