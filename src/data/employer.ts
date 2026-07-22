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

export type CompanyProfile = {
  name: string;
  initials: string;
  industry: string;
  website: string;
  location: string;
  size: string;
  summary: string;
  specialties: string[];
  logoFileName?: string;
};

export type ManagedJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary: string;
  summary: string;
  requirements: string[];
  benefits: string[];
  applications: number;
  inProgress: number;
  status: "Open" | "Closed";
  posted: string;
};

export const employerCompany = {
  name: "Meridian Byte Labs",
  initials: "MB",
  industry: "Software engineering · Kuala Lumpur, Malaysia",
};

export const companyProfile: CompanyProfile = {
  name: employerCompany.name,
  initials: employerCompany.initials,
  industry: "Software engineering · B2B SaaS",
  website: "https://meridianbyte.my",
  location: "Kuala Lumpur, Malaysia",
  size: "51–200 employees",
  summary:
    "Meridian Byte Labs builds calm, dependable software for teams managing complex work. We are a Kuala Lumpur product studio with an engineering-led culture and a focus on useful, accessible experiences.",
  specialties: ["Product engineering", "B2B SaaS", "Data platforms", "Design systems"],
};

export const managedJobs: ManagedJob[] = [
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Kuala Lumpur, Malaysia",
    workMode: "Hybrid",
    employmentType: "Full-time",
    salary: "RM 7,000–9,500 monthly",
    summary: "Build polished, accessible product experiences with our platform team.",
    requirements: ["React and TypeScript experience", "Strong UI implementation skills", "Clear written communication"],
    benefits: ["Flexible hybrid schedule", "Learning budget", "Private medical coverage"],
    applications: 28,
    inProgress: 6,
    status: "Open",
    posted: "Posted 5 days ago",
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Kuala Lumpur, Malaysia",
    workMode: "Hybrid",
    employmentType: "Full-time",
    salary: "RM 8,000–11,000 monthly",
    summary: "Design reliable services and APIs for a growing SaaS platform.",
    requirements: ["Node.js or Go experience", "SQL data modelling", "Cloud deployment experience"],
    benefits: ["Flexible hybrid schedule", "Learning budget", "Annual team retreat"],
    applications: 24,
    inProgress: 5,
    status: "Open",
    posted: "Posted 8 days ago",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    department: "Product",
    location: "Remote, Malaysia",
    workMode: "Remote",
    employmentType: "Full-time",
    salary: "RM 6,500–8,500 monthly",
    summary: "Turn customer insight into simple, high-quality workflows for teams.",
    requirements: ["B2B product design portfolio", "Research planning experience", "Figma fluency"],
    benefits: ["Remote-first collaboration", "Learning budget", "Home office allowance"],
    applications: 17,
    inProgress: 3,
    status: "Open",
    posted: "Posted 12 days ago",
  },
  {
    id: "platform-intern",
    title: "Platform Engineering Intern",
    department: "Engineering",
    location: "Kuala Lumpur, Malaysia",
    workMode: "On-site",
    employmentType: "Internship",
    salary: "RM 1,800–2,200 monthly",
    summary: "Learn modern delivery practices while contributing to internal platform tools.",
    requirements: ["Computer science fundamentals", "Curiosity about developer tooling", "Available for a six-month placement"],
    benefits: ["Mentorship programme", "Lunch allowance", "Hands-on project ownership"],
    applications: 12,
    inProgress: 0,
    status: "Closed",
    posted: "Closed 2 days ago",
  },
];

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

export type ApplicantStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Rejected";

export type EmployerApplicant = {
  id: string;
  graduateId?: GraduateId;
  name: string;
  initials: string;
  role: string;
  appliedOn: string;
  experience: string;
  location: string;
  fit: number;
  stage: ApplicantStage;
  skills: string[];
  summary: string;
  portfolio?: string;
  shortlisted: boolean;
};

export type EmployerInterview = {
  id: string;
  applicantId: string;
  candidate: string;
  initials: string;
  role: string;
  date: string;
  time: string;
  format: "Video" | "On-site";
  interviewer: string;
  status: "Scheduled" | "Feedback due" | "Completed" | "Cancelled";
};

export type EmployerOffer = {
  id: string;
  applicantId: string;
  candidate: string;
  initials: string;
  role: string;
  salary: string;
  startDate: string;
  sentOn: string;
  expiresOn: string;
  status: "Awaiting response" | "Accepted" | "Declined" | "Draft";
};

export type TalentRecord = {
  id: string;
  name: string;
  initials: string;
  headline: string;
  location: string;
  skills: string[];
  lastInteraction: string;
  note: string;
};

export type EmployerNotification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "Application" | "Interview" | "Offer" | "Talent";
  read: boolean;
  href: string;
};

export const employerApplicants: EmployerApplicant[] = [
  {
    id: "alex-morgan",
    graduateId: "graduate-alex",
    name: "Alex Morgan",
    initials: "AM",
    role: "Frontend Engineer",
    appliedOn: "Today",
    experience: "Early career \u00B7 Next.js, TypeScript",
    location: "Kuala Lumpur, Malaysia",
    fit: 91,
    stage: "Screening",
    skills: ["TypeScript", "React", "Next.js", "Accessibility"],
    summary:
      "Product-minded frontend developer who builds accessible, dependable product experiences.",
    portfolio: "Portfolio available",
    shortlisted: true,
  },
  {
    id: "nur-aisyah-rahman",
    name: "Nur Aisyah Rahman",
    initials: "NR",
    role: "Frontend Engineer",
    appliedOn: "Today",
    experience: "4 years · React, TypeScript",
    location: "Kuala Lumpur, Malaysia",
    fit: 94,
    stage: "Interview",
    skills: ["React", "TypeScript", "Design systems"],
    summary: "Product-minded frontend engineer with strong accessibility and component-system experience.",
    portfolio: "Portfolio available",
    shortlisted: true,
  },
  {
    id: "daniel-tan",
    name: "Daniel Tan",
    initials: "DT",
    role: "Backend Engineer",
    appliedOn: "Today",
    experience: "5 years · Node.js, AWS",
    location: "Petaling Jaya, Malaysia",
    fit: 89,
    stage: "Screening",
    skills: ["Node.js", "PostgreSQL", "AWS"],
    summary: "Backend engineer experienced in building and operating multi-tenant SaaS services.",
    shortlisted: true,
  },
  {
    id: "mei-lin-wong",
    name: "Mei Lin Wong",
    initials: "MW",
    role: "Product Designer",
    appliedOn: "Yesterday",
    experience: "3 years · B2B SaaS",
    location: "Remote, Malaysia",
    fit: 92,
    stage: "Offer",
    skills: ["Figma", "Research", "Prototyping"],
    summary: "End-to-end product designer who turns customer research into clear workflows.",
    portfolio: "Portfolio available",
    shortlisted: true,
  },
  {
    id: "kavin-raj",
    name: "Kavin Raj",
    initials: "KR",
    role: "Data Engineer",
    appliedOn: "Yesterday",
    experience: "4 years · Python, dbt",
    location: "Shah Alam, Malaysia",
    fit: 86,
    stage: "Interview",
    skills: ["Python", "SQL", "dbt"],
    summary: "Data engineer with hands-on experience improving reliable analytics pipelines.",
    shortlisted: false,
  },
  {
    id: "farah-nabilah",
    name: "Farah Nabilah",
    initials: "FN",
    role: "Frontend Engineer",
    appliedOn: "2 days ago",
    experience: "2 years · Next.js, Tailwind",
    location: "Kuala Lumpur, Malaysia",
    fit: 78,
    stage: "Applied",
    skills: ["Next.js", "Tailwind CSS", "JavaScript"],
    summary: "Early-career frontend developer with a focused portfolio of responsive web applications.",
    portfolio: "Portfolio available",
    shortlisted: false,
  },
  {
    id: "adam-lim",
    name: "Adam Lim",
    initials: "AL",
    role: "Backend Engineer",
    appliedOn: "3 days ago",
    experience: "6 years · Go, Kubernetes",
    location: "Cyberjaya, Malaysia",
    fit: 83,
    stage: "Rejected",
    skills: ["Go", "Kubernetes", "Redis"],
    summary: "Senior backend engineer with infrastructure and distributed-systems experience.",
    shortlisted: false,
  },
];

export const employerInterviews: EmployerInterview[] = [
  {
    id: "interview-nur-aisyah",
    applicantId: "nur-aisyah-rahman",
    candidate: "Nur Aisyah Rahman",
    initials: "NR",
    role: "Frontend Engineer",
    date: "Tomorrow",
    time: "10:00 AM",
    format: "Video",
    interviewer: "Sam Lee · Engineering",
    status: "Scheduled",
  },
  {
    id: "interview-kavin",
    applicantId: "kavin-raj",
    candidate: "Kavin Raj",
    initials: "KR",
    role: "Data Engineer",
    date: "Thursday, 24 July",
    time: "2:30 PM",
    format: "On-site",
    interviewer: "Priya Nair · Data",
    status: "Feedback due",
  },
  {
    id: "interview-daniel",
    applicantId: "daniel-tan",
    candidate: "Daniel Tan",
    initials: "DT",
    role: "Backend Engineer",
    date: "Friday, 25 July",
    time: "11:00 AM",
    format: "Video",
    interviewer: "Marcus Wong · Engineering",
    status: "Scheduled",
  },
];

export const employerOffers: EmployerOffer[] = [
  {
    id: "offer-mei-lin",
    applicantId: "mei-lin-wong",
    candidate: "Mei Lin Wong",
    initials: "MW",
    role: "Product Designer",
    salary: "RM 8,500 monthly",
    startDate: "1 September 2026",
    sentOn: "16 July 2026",
    expiresOn: "25 July 2026",
    status: "Awaiting response",
  },
  {
    id: "offer-hannah-lee",
    applicantId: "hannah-lee",
    candidate: "Hannah Lee",
    initials: "HL",
    role: "QA Engineer",
    salary: "RM 6,800 monthly",
    startDate: "18 August 2026",
    sentOn: "12 July 2026",
    expiresOn: "19 July 2026",
    status: "Accepted",
  },
];

export const talentRecords: TalentRecord[] = [
  {
    id: "siti-husna",
    name: "Siti Husna",
    initials: "SH",
    headline: "Frontend Engineer · 3 years experience",
    location: "Kuala Lumpur, Malaysia",
    skills: ["React", "Next.js", "Testing"],
    lastInteraction: "Interviewed in March 2026",
    note: "Strong product thinking. Reconnect for future frontend openings.",
  },
  {
    id: "jonathan-ong",
    name: "Jonathan Ong",
    initials: "JO",
    headline: "Data Engineer · 5 years experience",
    location: "Petaling Jaya, Malaysia",
    skills: ["Python", "Airflow", "BigQuery"],
    lastInteraction: "Saved 2 weeks ago",
    note: "Relevant for the data platform roadmap later this year.",
  },
  {
    id: "aisha-razak",
    name: "Aisha Razak",
    initials: "AR",
    headline: "Product Designer · 4 years experience",
    location: "Remote, Malaysia",
    skills: ["Research", "Figma", "Design systems"],
    lastInteraction: "Interviewed in January 2026",
    note: "Excellent researcher; follow up when a senior product role opens.",
  },
];

export const employerNotificationItems: EmployerNotification[] = [
  {
    id: "application-daniel",
    title: "New application from Daniel Tan",
    message: "Daniel applied for Backend Engineer. His profile is ready for screening.",
    timestamp: "12 minutes ago",
    category: "Application",
    read: false,
    href: "/employer/candidates",
  },
  {
    id: "feedback-kavin",
    title: "Interview feedback is due",
    message: "Please record feedback for Kavin Raj before the next hiring review.",
    timestamp: "1 hour ago",
    category: "Interview",
    read: false,
    href: "/employer/interviews",
  },
  {
    id: "offer-mei",
    title: "Offer decision due soon",
    message: "Mei Lin Wong's Product Designer offer expires on 25 July.",
    timestamp: "Yesterday",
    category: "Offer",
    read: false,
    href: "/employer/offers",
  },
  {
    id: "talent-siti",
    title: "Talent pool reminder",
    message: "Siti Husna's skills match your current Frontend Engineer opening.",
    timestamp: "2 days ago",
    category: "Talent",
    read: true,
    href: "/employer/talent",
  },
];
import type { GraduateId } from "@/types/university";
