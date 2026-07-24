import { GraduationCap, Lock, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CredentialView } from "@/components/features/candidate/credential-derivations";

/**
 * Read-only list of university-issued credentials. Presentational only — no
 * client state, so it renders on the server. The candidate can never edit,
 * delete, or change the status of these records; the institution owns them.
 * Meaning is carried by text (icons are decorative / aria-hidden) and never
 * by colour alone.
 */
type VerifiedCredentialListProps = {
  items: CredentialView[];
  /** "compact" trims metadata for the dashboard summary card. */
  variant?: "full" | "compact";
  className?: string;
};

function statusLabel(status: CredentialView["status"]): string {
  if (status === "Verified") return "Verified";
  if (status === "Pending") return "Awaiting university review";
  return "Not yet verified";
}

export function VerifiedCredentialList({
  items,
  variant = "full",
  className,
}: VerifiedCredentialListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No university credentials issued yet. Connect your institution to have
        your degree and capstone verified.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => {
        const verified = item.status === "Verified";
        return (
          <li
            key={item.id}
            className="rounded-lg border bg-surface-tint p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    verified
                      ? "bg-chart-1/20 text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {verified ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <GraduationCap className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.institutionName ? (
                      <>
                        {verified ? "Verified by " : "Issued by "}
                        <span className="font-medium text-foreground">
                          {item.institutionName}
                        </span>
                      </>
                    ) : (
                      "Issuing institution unavailable"
                    )}
                  </p>
                </div>
              </div>
              <Badge
                variant={verified ? "secondary" : "outline"}
                // The secondary variant bakes in a hover tint that makes the
                // badge look interactive; these badges are static, so cancel
                // the hover to keep the colour stable.
                className={cn(
                  "shrink-0",
                  verified ? "hover:bg-secondary" : "text-muted-foreground",
                )}
              >
                {statusLabel(item.status)}
              </Badge>
            </div>

            {variant === "full" ? (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {item.role ? (
                  <MetaCell label="Role" value={item.role} />
                ) : null}
                {item.graduationYear ? (
                  <MetaCell
                    label="Graduated"
                    value={String(item.graduationYear)}
                  />
                ) : null}
                {item.gpa ? <MetaCell label="GPA" value={item.gpa} /> : null}
                {item.capstone ? (
                  <MetaCell
                    label="Capstone"
                    value={item.capstone}
                    className="col-span-2"
                  />
                ) : null}
              </dl>
            ) : null}

            {variant === "full" && item.skills.length > 0 ? (
              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Institution-recorded skills
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden />
              University-managed record — you can&apos;t edit this.
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function MetaCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
