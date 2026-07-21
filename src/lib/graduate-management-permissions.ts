import type { Graduate, UniversityRole } from "@/types/university";

export type GraduateDraft = Omit<Graduate, "id" | "initials">;

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function createGraduateForRole(
  draft: GraduateDraft,
  role: UniversityRole,
  id: string
): Graduate {
  return {
    ...draft,
    id,
    initials: initialsFor(draft.name),
    employmentStatus:
      role === "registry" ? "Unknown" : draft.employmentStatus,
    verificationStatus:
      role === "careers" ? "Pending" : draft.verificationStatus,
    nextAction:
      role === "registry"
        ? "Employment outcome not yet recorded"
        : draft.nextAction.trim() || "Review graduate record",
  };
}
