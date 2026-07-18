import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
};

/**
 * Static, hydration-safe stat display.
 *
 * Why no animation: any client-side count-up requires setState after first
 * render, which causes React 19's hydration check to flag server-vs-client
 * mismatch (server renders the final value, client would render `0` until
 * the animation kicks in). Since the underlying purpose — surfacing the
 * final number to the reader — is fully satisfied by a static value, we
 * ship the static version. Any future animation should be CSS-only.
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className,
  decimals,
}: AnimatedCounterProps) {
  const decimalsToShow = decimals ?? (Number.isInteger(value) ? 0 : 1);
  const formatted = value.toFixed(decimalsToShow);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
