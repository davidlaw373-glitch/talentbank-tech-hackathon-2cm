import type { Application } from "@/types/candidate";

export const applications: Application[] = [
  {
    id: "a-001",
    jobTitle: "Senior Frontend Engineer",
    company: "Helio",
    status: "Interview",
    stage: "Final interview scheduled",
    nextAction:
      "Prepare your AI summary for the panel — opens 24h before the meeting.",
    update:
      "Helio confirmed your final panel for Tue 21 Jul at 14:00 MYT. Two interviewers, 60 min.",
    appliedDate: "12 Jun 2026",
    timeline: [
      { label: "Application submitted", date: "12 Jun", complete: true },
      { label: "Recruiter review", date: "16 Jun", complete: true },
      { label: "Hiring manager interview", date: "23 Jun", complete: true },
      { label: "Take-home assignment", date: "1 Jul", complete: true },
      { label: "Final interview panel", date: "Tue 21 Jul", complete: false },
    ],
  },
  {
    id: "a-002",
    jobTitle: "Frontend Engineer",
    company: "Lumen Studio",
    status: "In review",
    stage: "Awaiting recruiter decision",
    nextAction:
      "Nothing to do — we will email you when Lumen moves your application.",
    update:
      "Recruiter has added 2 interview slots to their calendar — expect a decision by Friday.",
    appliedDate: "28 Jun 2026",
    timeline: [
      { label: "Application submitted", date: "28 Jun", complete: true },
      { label: "Recruiter review", date: "2 Jul", complete: false },
      { label: "Hiring manager interview", date: "TBD", complete: false },
      { label: "Take-home assignment", date: "TBD", complete: false },
      { label: "Final interview panel", date: "TBD", complete: false },
    ],
  },
  {
    id: "a-003",
    jobTitle: "Lead Frontend Engineer",
    company: "Northstar Labs",
    status: "Submitted",
    stage: "Application received",
    nextAction:
      "Add one new project to lift your match score before the hiring manager reviews.",
    update:
      "Application received — added to the recruiter queue. Reviews open Mon 20 Jul.",
    appliedDate: "10 Jul 2026",
    timeline: [
      { label: "Application submitted", date: "10 Jul", complete: true },
      { label: "Recruiter review", date: "TBD", complete: false },
      { label: "Hiring manager interview", date: "TBD", complete: false },
      { label: "Take-home assignment", date: "TBD", complete: false },
      { label: "Final interview panel", date: "TBD", complete: false },
    ],
  },
];
