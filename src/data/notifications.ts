import notificationsJson from "./notifications.json";
import type { NotificationItem } from "@/types/notification";

/**
 * Notifications are stored as a single JSON object with three role-keyed
 * arrays so the shell and the notifications page can pull only the
 * subset they need without filtering by a recipient field.
 */
const data = notificationsJson as {
  candidate: NotificationItem[];
  employer: NotificationItem[];
  university: NotificationItem[];
};

export function getCandidateNotifications(): NotificationItem[] {
  return data.candidate;
}

export function getEmployerNotifications(): NotificationItem[] {
  return data.employer;
}

export function getUniversityNotifications(): NotificationItem[] {
  return data.university;
}
