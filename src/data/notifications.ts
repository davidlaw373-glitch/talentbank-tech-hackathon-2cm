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
    id: "n-003",
    type: "verification",
    title: "Evidence verified",
    message:
      "Your Computer Science degree record has been verified by the university.",
    timestamp: "Yesterday",
    read: true,
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

export const employerNotifications: NotificationItem[] = [
  {
    id: "e-001",
    type: "candidate",
    title: "New strong-match applicant",
    message:
      "Aisha Khan (94% match) just applied to Senior Frontend Engineer.",
    timestamp: "12 minutes ago",
    read: false,
  },
  {
    id: "e-002",
    type: "interview",
    title: "Interview confirmed",
    message:
      "Marco Okafor confirmed the technical round for Thursday 15:00 GMT.",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "e-003",
    type: "offer",
    title: "Offer accepted",
    message: "Jun Tanaka accepted the Platform PM offer. Start date 1 Jul.",
    timestamp: "Today",
    read: false,
  },
  {
    id: "e-004",
    type: "candidate",
    title: "Candidate moved to Offer",
    message:
      "Tomoko Yamamoto completed all interview rounds and is now at the Offer stage.",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "e-005",
    type: "system",
    title: "Weekly hiring digest ready",
    message:
      "You made 12 hires this quarter — 18 days median time-to-hire. View the full report.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "e-006",
    type: "match",
    title: "Talent pool alert",
    message: "3 candidates in your saved talent pool have updated profiles this week.",
    timestamp: "1 week ago",
    read: true,
  },
];

export const universityNotifications: NotificationItem[] = [
  {
    id: "u-001",
    type: "credential",
    title: "Bulk sync complete",
    message:
      "284 credentials synced from the registrar. 12 require faculty review.",
    timestamp: "30 minutes ago",
    read: false,
  },
  {
    id: "u-002",
    type: "dispute",
    title: "New dispute opened",
    message:
      "Marcus Tan filed a dispute on capstone grade. Awaiting faculty response.",
    timestamp: "4 days ago",
    read: false,
  },
  {
    id: "u-003",
    type: "graduate",
    title: "Graduate updated employment",
    message:
      "Hana Sato updated her outcome: now Senior Data Analyst at Lumen Studio.",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "u-004",
    type: "report",
    title: "Employment report ready",
    message:
      "Q2 outcomes report for Class of 2024 is ready. 92% placed within 90 days.",
    timestamp: "3 days ago",
    read: true,
  },
  {
    id: "u-005",
    type: "system",
    title: "Curriculum signal",
    message:
      "Demand for LLM evaluation is up 68%. Consider adding an elective.",
    timestamp: "1 week ago",
    read: true,
  },
];