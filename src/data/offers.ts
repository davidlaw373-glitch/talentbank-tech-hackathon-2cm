import offersJson from "./offers.json";
import type { Offer } from "@/types/offer";

const byId = new Map<number, Offer>();
for (const offer of offersJson as Offer[]) {
  byId.set(offer.id, offer);
}

export const list: Offer[] = offersJson as Offer[];

export function get(id: number): Offer | undefined {
  return byId.get(id);
}

export function getByApplication(applicationId: number): Offer | undefined {
  return list.find((o) => o.applicationId === applicationId);
}

export function getAccepted(): Offer[] {
  return list.filter((o) => o.decision === "Accepted");
}
