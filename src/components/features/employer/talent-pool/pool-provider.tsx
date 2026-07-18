"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  employerCandidates,
  talentPoolEntries as seedEntries,
} from "@/data/employer";
import type {
  EmployerCandidate,
  TalentPoolEntry,
} from "@/types/employer";

type AddInput = {
  candidateId: string;
  status?: TalentPoolEntry["status"];
  source?: TalentPoolEntry["source"];
  sourceDetail?: string;
  notes?: string;
  tags?: TalentPoolEntry["tags"];
};

type TalentPoolContextValue = {
  entries: TalentPoolEntry[];
  add: (input: AddInput) => TalentPoolEntry | null;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<TalentPoolEntry>) => void;
  getByCandidate: (candidateId: string) => TalentPoolEntry | undefined;
  isInPool: (candidateId: string) => boolean;
};

const TalentPoolContext = createContext<TalentPoolContextValue | null>(null);

export function useTalentPool() {
  const ctx = useContext(TalentPoolContext);
  if (!ctx) {
    throw new Error("useTalentPool must be used inside <TalentPoolProvider>");
  }
  return ctx;
}

const candidateById: Map<string, EmployerCandidate> = new Map(
  employerCandidates.map((c) => [c.id, c]),
);

export function TalentPoolProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TalentPoolEntry[]>(seedEntries);

  const add = useCallback<TalentPoolContextValue["add"]>((input) => {
    const candidate = candidateById.get(input.candidateId);
    if (!candidate) return null;
    let created: TalentPoolEntry | null = null;
    setEntries((prev) => {
      const existing = prev.find((e) => e.candidateId === input.candidateId);
      if (existing) return prev;
      const id = `pool-${input.candidateId}-${Date.now()}`;
      const next: TalentPoolEntry = {
        id,
        candidateId: input.candidateId,
        status: input.status ?? "Active",
        savedAt: "Just now",
        lastContactedAt: null,
        notes: input.notes ?? "",
        tags: input.tags ?? [],
        source: input.source ?? "Application",
        sourceDetail:
          input.sourceDetail ?? candidate.appliedFor ?? "Saved manually",
        reEngagementScore: candidate.matchScore,
      };
      created = next;
      return [next, ...prev];
    });
    return created;
  }, []);

  const remove = useCallback<TalentPoolContextValue["remove"]>((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const update = useCallback<TalentPoolContextValue["update"]>(
    (id, patch) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
    },
    [],
  );

  const getByCandidate = useCallback<TalentPoolContextValue["getByCandidate"]>(
    (candidateId) => entries.find((e) => e.candidateId === candidateId),
    [entries],
  );

  const isInPool = useCallback<TalentPoolContextValue["isInPool"]>(
    (candidateId) => entries.some((e) => e.candidateId === candidateId),
    [entries],
  );

  const value = useMemo<TalentPoolContextValue>(
    () => ({ entries, add, remove, update, getByCandidate, isInPool }),
    [entries, add, remove, update, getByCandidate, isInPool],
  );

  return (
    <TalentPoolContext.Provider value={value}>
      {children}
    </TalentPoolContext.Provider>
  );
}