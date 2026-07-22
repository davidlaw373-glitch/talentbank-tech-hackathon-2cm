import { cn } from "@/lib/utils";

/**
 * Three nodes — Candidates, Employers, Universities — connected into a
 * single mark. Lives next to the wordmark everywhere the brand appears
 * (cover nav + footer, dashboard shells, /login, /register). Tone matches
 * `bg-primary text-primary-foreground` so it sits on the dark forest
 * square of every surface.
 *
 * The vector is the same on every size; only the wrapper box and the
 * inner SVG dimensions change. Stroke width is held at 1.6 so the mark
 * keeps its weight even when shrunk to 14px.
 */
type BrandMarkProps = {
  /**
   * Wrapper size in Tailwind units. `8` (32px box / 16px icon) is the
   * default and matches the shells + cover-nav. `7` (28px / 14px) is
   * the smaller footer variant.
   */
  size?: 7 | 8;
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  7: "h-7 w-7",
  8: "h-8 w-8",
};

const ICON_PX: Record<NonNullable<BrandMarkProps["size"]>, number> = {
  7: 14,
  8: 16,
};

export function BrandMark({ size = 8, className }: BrandMarkProps) {
  const icon = ICON_PX[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
        SIZE_CLASS[size],
        className,
      )}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <line
          x1="6"
          y1="18"
          x2="18"
          y2="18"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <line
          x1="6"
          y1="18"
          x2="12"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <line
          x1="18"
          y1="18"
          x2="12"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="6" cy="18" r="2.4" fill="currentColor" />
        <circle cx="18" cy="18" r="2.4" fill="currentColor" />
        <circle cx="12" cy="6" r="2.4" fill="currentColor" />
      </svg>
    </span>
  );
}