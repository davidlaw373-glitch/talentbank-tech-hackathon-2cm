import interviewsJson from "./interviews.json";
import type { Interview } from "@/types/interview";

const byId = new Map<number, Interview>();
for (const interview of interviewsJson as Interview[]) {
  byId.set(interview.id, interview);
}

export const list: Interview[] = interviewsJson as Interview[];

export function get(id: number): Interview | undefined {
  return byId.get(id);
}

export function getByApplication(applicationId: number): Interview[] {
  return list.filter((i) => i.applicationId === applicationId);
}
