"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { ApplicationStage } from "@/types/application";

export type CandidatePipelineStatus = {
  stage: ApplicationStage;
  rejected: boolean;
  rejectionReason?: string;
};

type CandidatePipelineContextValue = {
  getStatus: (
    applicationId: number,
    fallbackStage: ApplicationStage,
    fallbackRejected: boolean,
  ) => CandidatePipelineStatus;
  moveToStage: (applicationId: number, stage: ApplicationStage) => void;
  reject: (
    applicationId: number,
    currentStage: ApplicationStage,
    reason?: string,
  ) => void;
};

const CandidatePipelineContext =
  createContext<CandidatePipelineContextValue | null>(null);

export function useCandidatePipeline() {
  const context = useContext(CandidatePipelineContext);
  if (!context) {
    throw new Error(
      "useCandidatePipeline must be used inside <CandidatePipelineProvider>",
    );
  }
  return context;
}

export function CandidatePipelineProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [overrides, setOverrides] = useState<
    Record<number, CandidatePipelineStatus>
  >({});

  const getStatus = useCallback<CandidatePipelineContextValue["getStatus"]>(
    (applicationId, fallbackStage, fallbackRejected) =>
      overrides[applicationId] ?? {
        stage: fallbackStage,
        rejected: fallbackRejected,
      },
    [overrides],
  );

  const moveToStage = useCallback<
    CandidatePipelineContextValue["moveToStage"]
  >((applicationId, stage) => {
    setOverrides((current) => ({
      ...current,
      [applicationId]: { stage, rejected: false },
    }));
  }, []);

  const reject = useCallback<CandidatePipelineContextValue["reject"]>(
    (applicationId, currentStage, reason) => {
      setOverrides((current) => ({
        ...current,
        [applicationId]: {
          stage: current[applicationId]?.stage ?? currentStage,
          rejected: true,
          rejectionReason: reason?.trim() || undefined,
        },
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({ getStatus, moveToStage, reject }),
    [getStatus, moveToStage, reject],
  );

  return (
    <CandidatePipelineContext.Provider value={value}>
      {children}
    </CandidatePipelineContext.Provider>
  );
}
