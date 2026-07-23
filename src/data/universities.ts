import universitiesJson from "./universities.json";
import type { University } from "@/types/university";

const byId = new Map<number, University>();
for (const university of universitiesJson as University[]) {
  byId.set(university.id, university);
}

export const list: University[] = universitiesJson as University[];

export function get(id: number): University | undefined {
  return byId.get(id);
}
