import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CoverEyebrowProps = {
  children: ReactNode;
  className?: string;
  align?: "center" | "start";
  /**
   * Background tone of the parent section. Drives the text and divider
   * color so the eyebrow stays legible on either light cream-sage or the
   * darker sage sections (bg-secondary).
   *   "light"  — dark forest on cream (default)
   *   "dark"   — cream on sage (use when parent has bg-secondary)
   */
  tone?: "light" | "dark";
};

function renderText(text: string) {
  const parts = text.split(/~~(.*?)~~/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="line-through">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function CoverEyebrow({
  children,
  className,
  align = "center",
  tone = "light",
}: CoverEyebrowProps) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          "block h-px w-10",
          isDark ? "bg-secondary-foreground/40" : "bg-foreground/30",
        )}
      />
      <span
        className={cn(
          "text-sm font-semibold uppercase tracking-[0.18em] sm:text-base",
          isDark ? "text-secondary-foreground" : "text-foreground",
        )}
      >
        {typeof children === "string" ? renderText(children) : children}
      </span>
      <span
        className={cn(
          "block h-px w-10",
          isDark ? "bg-secondary-foreground/40" : "bg-foreground/30",
          align === "start" && "hidden"
        )}
      />
    </div>
  );
}
