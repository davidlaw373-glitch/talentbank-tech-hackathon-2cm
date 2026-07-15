import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  ariaLabel: string;
  variant?: "default" | "muted";
  size?: "default" | "tight" | "loose";
  className?: string;
  children: React.ReactNode;
}

export function Section({
  id,
  ariaLabel,
  variant = "default",
  size = "default",
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "relative w-full overflow-hidden border-t",
        variant === "muted" && "bg-muted/30",
        className,
      )}
    >
      <div
        className={cn(
          "container relative mx-auto px-6",
          size === "tight" && "py-12",
          size === "default" && "py-20 md:py-28",
          size === "loose" && "py-24 md:py-32",
        )}
      >
        {children}
      </div>
    </section>
  );
}
