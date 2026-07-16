export type PipelineStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired";

export type EmployerStat = {
  id: "openRoles" | "activeApplicants" | "interviews" | "offers";
  label: string;
  value: number;
  delta: string;
};

export type ShortlistedCandidate = {
  name: string;
  initials: string;
  role: string;
  experience: string;
  stage: "Screening" | "Interview" | "Offer";
  fit: number;
  skills: string[];
};

export type UpcomingInterview = {
  candidate: string;
  role: string;
  day: string;
  time: string;
  interviewer: string;
};

export type OpenRole = {
  title: string;
  location: string;
  applications: number;
  inProgress: number;
  status: "Open" | "Closing soon";
};

export const employerCompany = {
  name: "Meridian Byte Labs",
  initials: "MB",
  industry: "Software engineering · Kuala Lumpur, Malaysia",
};

export const employerStats: EmployerStat[] = [
  { id: "openRoles", label: "Open roles", value: 6, delta: "2 added this month" },
  { id: "activeApplicants", label: "Active applicants", value: 81, delta: "14 new this week" },
  { id: "interviews", label: "Interviews this week", value: 7, delta: "3 scheduled tomorrow" },
  { id: "offers", label: "Offers awaiting response", value: 3, delta: "1 decision due Friday" },
];

export const recruitmentPipeline: { stage: PipelineStage; count: number }[] = [
  { stage: "Applied", count: 48 },
  { stage: "Screening", count: 21 },
  { stage: "Interview", count: 9 },
  { stage: "Offer", count: 3 },
  { stage: "Hired", count: 2 },
];

export const shortlistedCandidates: ShortlistedCandidate[] = [
  {
    name: "Nur Aisyah Rahman",
    initials: "NR",
    role: "Frontend Engineer",
    experience: "4 years · React, TypeScript",
    stage: "Interview",
    fit: 94,
    skills: ["React", "TypeScript", "Design systems"],
  },
  {
    name: "Daniel Tan",
    initials: "DT",
    role: "Backend Engineer",
    experience: "5 years · Node.js, AWS",
    stage: "Screening",
    fit: 89,
    skills: ["Node.js", "PostgreSQL", "AWS"],
  },
  {
    name: "Mei Lin Wong",
    initials: "MW",
    role: "Product Designer",
    experience: "3 years · B2B SaaS",
    stage: "Offer",
    fit: 92,
    skills: ["Figma", "Research", "Prototyping"],
  },
];

export const upcomingInterviews: UpcomingInterview[] = [
  {
    candidate: "Nur Aisyah Rahman",
    role: "Frontend Engineer",
    day: "Tomorrow",
    time: "10:00 AM",
    interviewer: "Sam Lee · Engineering",
  },
  {
    candidate: "Kavin Raj",
    role: "Data Engineer",
    day: "Thursday",
    time: "2:30 PM",
    interviewer: "Priya Nair · Data",
  },
];

export const openRoles: OpenRole[] = [
  {
    title: "Frontend Engineer",
    location: "Kuala Lumpur · Hybrid",
    applications: 28,
    inProgress: 6,
    status: "Open",
  },
  {
    title: "Backend Engineer",
    location: "Kuala Lumpur · Hybrid",
    applications: 24,
    inProgress: 5,
    status: "Open",
  },
  {
    title: "Product Designer",
    location: "Remote · Malaysia",
    applications: 17,
    inProgress: 3,
    status: "Closing soon",
  },
];

export const employerActivity = [
  "Nur Aisyah Rahman completed the technical interview.",
  "A new application arrived for Backend Engineer.",
  "Mei Lin Wong moved to the offer stage.",
];

export const employerNotifications = [
  "3 candidates are awaiting interview feedback.",
  "Frontend Engineer has reached 28 applications.",
  "One offer needs a decision by Friday.",
];
