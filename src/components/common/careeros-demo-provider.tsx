"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  employmentOutcomes,
  graduates,
  universityActivity,
  universityProfile,
  verificationRecords,
} from "@/data/university";
import {
  createUniversityDemoState,
  executeUniversityCommand,
  type UniversityCommand,
  type UniversityCommandResult,
  type UniversityDemoState,
} from "@/lib/university-demo-state";

type CareerOSDemoContextValue = {
  state: UniversityDemoState;
  execute: (command: UniversityCommand) => UniversityCommandResult;
};

const CareerOSDemoContext = createContext<CareerOSDemoContextValue | null>(null);

export function CareerOSDemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState(() =>
    createUniversityDemoState({
      institutionName: universityProfile.name,
      graduates,
      verificationRecords,
      employmentOutcomes,
      activities: universityActivity,
    })
  );
  const stateRef = useRef(state);

  const execute = useCallback((command: UniversityCommand) => {
    const result = executeUniversityCommand(stateRef.current, command);
    if (result.ok) {
      stateRef.current = result.state;
      setState(result.state);
    }
    return result;
  }, []);

  const value = useMemo(() => ({ state, execute }), [execute, state]);

  return (
    <CareerOSDemoContext.Provider value={value}>
      {children}
    </CareerOSDemoContext.Provider>
  );
}

export function useCareerOSDemo() {
  const context = useContext(CareerOSDemoContext);
  if (!context) {
    throw new Error("useCareerOSDemo must be used within CareerOSDemoProvider");
  }
  return context;
}
