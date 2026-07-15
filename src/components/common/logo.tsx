import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md";
  href?: string;
  ariaLabel?: string;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  href = "#top",
  ariaLabel = "CareerOS home",
  showWordmark = true,
  className,
}: LogoProps) {
  const badgeSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground",
          badgeSize,
        )}
      >
        <Sparkles className={iconSize} aria-hidden />
      </span>
      {showWordmark && (
        <small className="font-semibold tracking-tight">CareerOS</small>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label={ariaLabel} className="flex items-center gap-2">
      {content}
    </Link>
  );
}
