import activityJson from "./activity.json";
import type { ActivityItem } from "@/types/activity";

const byId = new Map<number, ActivityItem>();
for (const item of activityJson as ActivityItem[]) {
  byId.set(item.id, item);
}

export const list: ActivityItem[] = activityJson as ActivityItem[];

export function get(id: number): ActivityItem | undefined {
  return byId.get(id);
}

export function getForCandidate(candidateId: number): ActivityItem[] {
  return list.filter((a) => a.candidateId === candidateId);
}
