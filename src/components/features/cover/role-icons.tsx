import { cn } from "@/lib/utils";

/**
 * The three role icons used by the constellation in the cover manifesto
 * (`AnimatedMark`) — promoted to standalone SVG components so the auth
 * role cards can reuse the exact same shapes.
 *
 * Each icon is drawn inside a 24×24 viewBox with the mark centered on
 * (12, 12). Stroke uses `currentColor` so callers control tone via
 * Tailwind's `text-*` utilities.
 */

type RoleIconProps = {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

function RoleIcon({
  children,
  className,
  "aria-hidden": ariaHidden = true,
}: Partial<RoleIconProps> & { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={ariaHidden}
      className={cn("text-secondary", className)}
    >
      <g transform="translate(12 12)">{children}</g>
    </svg>
  );
}

export function CandidateIcon(props: Partial<RoleIconProps> = {}) {
  return (
    <RoleIcon {...props}>
      <circle cx="0" cy="-3" r="2.5" fill="currentColor" />
      <path d="M -5,5 a 5,4 0 0,1 10,0" fill="currentColor" />
    </RoleIcon>
  );
}

export function EmployerIcon(props: Partial<RoleIconProps> = {}) {
  return (
    <RoleIcon {...props}>
      <rect
        x="-5"
        y="-2"
        width="10"
        height="8"
        rx="1"
        fill="currentColor"
      />
      <path
        d="M -2,-2 v -2 h 4 v 2"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </RoleIcon>
  );
}

export function UniversityIcon(props: Partial<RoleIconProps> = {}) {
  return (
    <RoleIcon {...props}>
      <path d="M -7,0 L 0,-3 L 7,0 L 0,3 Z" fill="currentColor" />
      <path
        d="M -4,1.5 v 3 M 4,1.5 v 3"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </RoleIcon>
  );
}