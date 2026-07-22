import type { NotificationItem } from "@/types/notification";

export const notifications: NotificationItem[] = [
  {
    id: "n-001",
    type: "application",
    title: "Application moved to interview",
    message:
      "Your application for Frontend Developer at Northstar Labs has progressed to the interview stage.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "n-002",
    type: "match",
    title: "New job match",
    message:
      "A new role matches your skills — Senior Frontend Engineer at Lumen Studio (94% match).",
    timestamp: "Today",
    read: false,
  },
  {
    id: "n-004",
    type: "profile",
    title: "Complete your profile",
    message:
      "Add one more project to reach a 90% profile completion score and unlock more matches.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "n-005",
    type: "system",
    title: "Welcome to CareerOS",
    message:
      "Your candidate workspace is ready. Explore the dashboard to discover jobs and track applications.",
    timestamp: "1 week ago",
    read: true,
  },
];
