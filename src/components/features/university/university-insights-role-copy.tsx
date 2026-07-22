"use client";

import { useUniversityRole } from "@/components/features/university/university-role-context";

export function UniversityInsightsRoleCopy() {
  const { role } = useUniversityRole();
  const roleName = role === "careers" ? "Career Services" : "Registry";

  return (
    <>
      {roleName} view of tracked demand and curriculum evidence. These signals
      inform review; they do not change curriculum records.
    </>
  );
}
