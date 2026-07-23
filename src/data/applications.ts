import type { Application } from "@/types/candidate";

export const applications: Application[] = [
  {
    id: "a-001",
    jobTitle: "Senior Frontend Engineer",
    company: "Helio",
    stage: "Interview",
    rejected: false,
    nextAction:
      "Prepare your AI summary for the panel — opens 24h before the meeting.",
    update:
      "Helio confirmed your final panel for Tue 21 Jul at 14:00 MYT. Two interviewers, 60 min.",
    appliedDate: "12 Jun 2026",
    timeline: [
      { label: "Applied", date: "12 Jun", complete: true },
      { label: "Screening", date: "16 Jun", complete: true },
      { label: "Interview", date: "23 Jun", complete: true },
      { label: "Offer", date: "1 Jul", complete: false },
      { label: "Hired", date: "TBD", complete: false },
    ],
  },
  {
    id: "a-002",
    jobTitle: "Frontend Engineer",
    company: "Lumen Studio",
    stage: "Screening",
    rejected: false,
    nextAction:
      "Nothing to do — we will email you when Lumen moves your application.",
    update:
      "Recruiter has added 2 interview slots to their calendar — expect a decision by Friday.",
    appliedDate: "28 Jun 2026",
    timeline: [
      { label: "Applied", date: "28 Jun", complete: true },
      { label: "Screening", date: "2 Jul", complete: false },
      { label: "Interview", date: "TBD", complete: false },
      { label: "Offer", date: "TBD", complete: false },
      { label: "Hired", date: "TBD", complete: false },
    ],
  },
  {
    id: "a-003",
    jobTitle: "Lead Frontend Engineer",
    company: "Northstar Labs",
    stage: "Applied",
    rejected: false,
    nextAction:
      "Add one new project to lift your match score before the hiring manager reviews.",
    update:
      "Application received — added to the recruiter queue. Reviews open Mon 20 Jul.",
    appliedDate: "10 Jul 2026",
    timeline: [
      { label: "Applied", date: "10 Jul", complete: true },
      { label: "Screening", date: "TBD", complete: false },
      { label: "Interview", date: "TBD", complete: false },
      { label: "Offer", date: "TBD", complete: false },
      { label: "Hired", date: "TBD", complete: false },
    ],
  },
];
