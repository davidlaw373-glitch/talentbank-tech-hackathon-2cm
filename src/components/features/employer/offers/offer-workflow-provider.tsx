"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  EmployerCandidateRow,
  EmployerOfferRow,
} from "@/lib/data-helpers";
import { getEmployerOfferSeedRows } from "./offer-data";
import type { OfferComposerValues } from "./offer-composer-dialog";

const REMINDER_COOLDOWN_MS = 30_000;

type OfferWorkflowContextValue = {
  rows: EmployerOfferRow[];
  sendOffer: (id: number) => void;
  remindOffer: (id: number) => void;
  withdrawOffer: (id: number) => void;
  createOffer: (
    candidate: EmployerCandidateRow,
    values: OfferComposerValues,
  ) => void;
  isReminderCoolingDown: (id: number) => boolean;
};

const OfferWorkflowContext =
  createContext<OfferWorkflowContextValue | null>(null);

export function OfferWorkflowProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<EmployerOfferRow[]>(
    getEmployerOfferSeedRows,
  );
  const [coolingIds, setCoolingIds] = useState<Set<number>>(
    () => new Set(),
  );
  const timers = useRef<Set<number>>(new Set());

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const sendOffer = useCallback((id: number) => {
    setRows((current) =>
      current.map((row) =>
        row.offer.id === id
          ? { ...row, offer: { ...row.offer, sentDate: "Just now" } }
          : row,
      ),
    );
  }, []);

  const remindOffer = useCallback((id: number) => {
    setCoolingIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });

    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setCoolingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }, REMINDER_COOLDOWN_MS);
    timers.current.add(timer);
  }, []);

  const withdrawOffer = useCallback((id: number) => {
    setRows((current) => current.filter((row) => row.offer.id !== id));
    setCoolingIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  const createOffer = useCallback(
    (candidate: EmployerCandidateRow, values: OfferComposerValues) => {
      setRows((current) => {
        const nextId =
          Math.max(0, ...current.map((row) => row.offer.id)) + 1;
        const newRow: EmployerOfferRow = {
          application: candidate.app,
          candidate: candidate.candidate,
          job: candidate.job,
          offer: {
            id: nextId,
            applicationId: candidate.app.id,
            decision: "Pending",
            matchScore: candidate.matchScore,
            sentDate: "Just now",
            ...values,
          },
        };
        return [newRow, ...current];
      });
    },
    [],
  );

  const value = useMemo<OfferWorkflowContextValue>(
    () => ({
      rows,
      sendOffer,
      remindOffer,
      withdrawOffer,
      createOffer,
      isReminderCoolingDown: (id) => coolingIds.has(id),
    }),
    [
      coolingIds,
      createOffer,
      remindOffer,
      rows,
      sendOffer,
      withdrawOffer,
    ],
  );

  return (
    <OfferWorkflowContext.Provider value={value}>
      {children}
    </OfferWorkflowContext.Provider>
  );
}

export function useOfferWorkflow() {
  const context = useContext(OfferWorkflowContext);
  if (!context) {
    throw new Error(
      "useOfferWorkflow must be used inside <OfferWorkflowProvider>",
    );
  }
  return context;
}
