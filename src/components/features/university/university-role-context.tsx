"use client";

import { createContext, useContext, useState } from "react";

import type { UniversityRole } from "@/types/university";

type UniversityRoleContextValue = {
  role: UniversityRole;
  setRole: (role: UniversityRole) => void;
};

const UniversityRoleContext = createContext<UniversityRoleContextValue | null>(
  null
);

export function UniversityRoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<UniversityRole>("careers");

  return (
    <UniversityRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UniversityRoleContext.Provider>
  );
}

export function useUniversityRole(): UniversityRoleContextValue {
  const context = useContext(UniversityRoleContext);

  if (!context) {
    throw new Error(
      "useUniversityRole must be used within UniversityRoleProvider"
    );
  }

  return context;
}
