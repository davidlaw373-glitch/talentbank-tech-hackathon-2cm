import marketSignalsJson from "./market-signals.json";
import type { MarketSignal } from "@/types/market-signal";

const byId = new Map<number, MarketSignal>();
for (const signal of marketSignalsJson as MarketSignal[]) {
  byId.set(signal.id, signal);
}

export const list: MarketSignal[] = marketSignalsJson as MarketSignal[];

export function get(id: number): MarketSignal | undefined {
  return byId.get(id);
}

export function getBySkill(skill: string): MarketSignal | undefined {
  return list.find((s) => s.skill === skill);
}

/** Top N signals by 12-month delta — used for "trending" callouts. */
export function getTrending(limit: number): MarketSignal[] {
  return [...list].sort((a, b) => b.delta - a.delta).slice(0, limit);
}

/** Top N signals by current openings — used for "most in demand" callouts. */
export function getByOpenings(limit: number): MarketSignal[] {
  return [...list].sort((a, b) => b.openings - a.openings).slice(0, limit);
}
