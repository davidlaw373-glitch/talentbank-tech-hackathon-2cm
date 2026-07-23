"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { list as employerCandidates } from "@/data/candidates";
import { list as talentPoolSeedEntries } from "@/data/talent-pool";
import type { Candidate } from "@/types/candidate";
import type { TalentPoolEntry } from "@/types/talent-pool";

type AddInput = {
  candidateId: number;
  employerId?: number;
  status?: TalentPoolEntry["status"];
  source?: TalentPoolEntry["source"];
  sourceDetail?: string;
  notes?: string;
  tags?: TalentPoolEntry["tags"];
};

type TalentPoolContextValue = {
  entries: TalentPoolEntry[];
  add: (input: AddInput) => TalentPoolEntry | null;
  remove: (id: number) => void;
  update: (id: number, patch: Partial<TalentPoolEntry>) => void;
  getByCandidate: (candidateId: number) => TalentPoolEntry | undefined;
  isInPool: (candidateId: number) => boolean;
};

const TalentPoolContext = createContext<TalentPoolContextValue | null>(null);

export function useTalentPool() {
  const ctx = useContext(TalentPoolContext);
  if (!ctx) {
    throw new Error("useTalentPool must be used inside <TalentPoolProvider>");
  }
  return ctx;
}

const candidateById: Map<number, Candidate> = new Map(
  employerCandidates.map((c) => [c.id, c]),
);

export function TalentPoolProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TalentPoolEntry[]>(
    talentPoolSeedEntries,
  );

  const add = useCallback<TalentPoolContextValue["add"]>((input) => {
    const candidate = candidateById.get(input.candidateId);
    if (!candidate) return null;
    let created: TalentPoolEntry | null = null;
    setEntries((prev) => {
      const existing = prev.find((e) => e.candidateId === input.candidateId);
      if (existing) return prev;
      const id = Date.now();
      const next: TalentPoolEntry = {
        id,
        employerId: input.employerId ?? 1,
        candidateId: input.candidateId,
        status: input.status ?? "Active",
        savedAt: "Just now",
        lastContactedAt: null,
        notes: input.notes ?? "",
        tags: input.tags ?? [],
        source: input.source ?? "Application",
        sourceDetail:
          input.sourceDetail ?? candidate.title ?? "Saved manually",
        // Re-engagement is no longer stored per candidate; default to 80
        // when adding from a candidate row that doesn't carry one.
        reEngagementScore: 80,
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