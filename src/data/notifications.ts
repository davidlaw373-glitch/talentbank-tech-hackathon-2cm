import type { NotificationItem } from "@/types/notification";

// Stories stay consistent with the jobs and applications fixtures — every
// notification deep-links to the record it talks about.
export const notifications: NotificationItem[] = [
  {
    id: "n-001",
    type: "application",
    title: "Application moved to interview",
    message:
      "Your application for Frontend Developer at Brightpath Technologies has progressed to the interview stage.",
    timestamp: "2 hours ago",
    read: false,
    href: "/candidate/applications/app-frontend-developer",
  },
  {
    id: "n-002",
    type: "match",
    title: "New job match",
    message:
      "A new role matches your skills — Frontend Developer at Brightpath Technologies (92% match).",
    timestamp: "Today",
    read: false,
    href: "/candidate/jobs/frontend-developer",
  },
  {
    id: "n-003",
    type: "verification",
    title: "Evidence verified",
    message:
      "Your Computer Science degree record has been verified by the university.",
    timestamp: "Yesterday",
    read: true,
    href: "/candidate/profile",
  },
  {
    id: "n-004",
    type: "profile",
    title: "Complete your profile",
    message:
      "Add one project to reach 100% profile completion and unlock more matches.",
    timestamp: "2 days ago",
    read: true,
    href: "/candidate/profile",
  },
  {
    id: "n-005",
    type: "system",
    title: "Welcome to CareerOS",
    message:
      "Your candidate workspace is ready. Explore the dashboard to discover jobs and track applications.",
    timestamp: "1 week ago",
    read: true,
    href: "/candidate/dashboard",
  },
];
