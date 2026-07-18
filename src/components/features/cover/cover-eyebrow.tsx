import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CoverEyebrowProps = {
  children: ReactNode;
  className?: string;
  align?: "center" | "start";
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
}: CoverEyebrowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
      aria-hidden
    >
      <span className="block h-px w-10 bg-foreground/30" />
      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground sm:text-base">
        {typeof children === "string" ? renderText(children) : children}
      </span>
      <span
        className={cn(
          "block h-px w-10 bg-foreground/30",
          align === "start" && "hidden"
        )}
      />
    </div>
  );
}
