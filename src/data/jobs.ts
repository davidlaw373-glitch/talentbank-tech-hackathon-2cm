export type JobWorkMode = "Remote" | "Hybrid" | "On-site";
export type JobEmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: JobWorkMode;
  employmentType: JobEmploymentType;
  posted: string;
  salary: string;
  summary: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  aboutCompany: string;
};

export const jobs: Job[] = [
  {
    id: "j-001",
    title: "Senior Frontend Engineer",
    company: "Helio",
    location: "Singapore",
    workMode: "Remote",
    employmentType: "Full-time",
    posted: "2 days ago",
    salary: "SGD 140–180k",
    summary:
      "Helio is hiring a senior IC to lead the customer dashboard rebuild — accessibility-first React, design-system collaboration, and a small product team.",
    matchScore: 94,
    matchingSkills: ["React", "TypeScript", "Next.js", "Accessibility"],
    missingSkills: ["GraphQL"],
    responsibilities: [
      "Drive the customer dashboard rebuild end-to-end with design and product.",
      "Set the long-term accessibility-first engineering bar for the team.",
      "Mentor mid-level engineers via review and pairing.",
    ],
    requirements: [
      "5+ years shipping production React at scale.",
      "Strong accessibility literacy (WCAG 2.2 AA).",
      "Track record leading design-system work.",
    ],
    benefits: [
      "Fully remote across APAC.",
      "Annual learning budget.",
      "Equity for senior ICs.",
    ],
    aboutCompany:
      "Helio is a 90-person platform building energy-market analytics for utilities — backed by a Series C and operating across APAC.",
  },
  {
    id: "j-002",
    title: "Frontend Engineer",
    company: "Lumen Studio",
    location: "London",
    workMode: "Hybrid",
    employmentType: "Full-time",
    posted: "5 days ago",
    salary: "GBP 80–105k",
    summary:
      "Lumen is building the next realtime collaboration suite for learners — React, TypeScript, and a tight collaboration with design.",
    matchScore: 88,
    matchingSkills: ["React", "TypeScript", "Next.js", "Design systems"],
    missingSkills: ["WebRTC"],
    responsibilities: [
      "Build features end-to-end on the collaboration suite.",
      "Partner closely with design on interaction details.",
    ],
    requirements: [
      "3+ years of React + TypeScript in production.",
      "Comfort iterating quickly against user feedback.",
    ],
    benefits: [
      "Hybrid — 2 days a week in the London office.",
      "Generous learning budget.",
    ],
    aboutCompany:
      "Lumen is a 40-person edtech that helps learners build real projects alongside mentors.",
  },
  {
    id: "j-003",
    title: "Staff Product Engineer",
    company: "Vertex",
    location: "Seoul",
    workMode: "Remote",
    employmentType: "Full-time",
    posted: "1 week ago",
    salary: "KRW 140–180M",
    summary:
      "Vertex is hiring a Staff IC to drive the platform team — system design, mentorship, and cross-team alignment.",
    matchScore: 82,
    matchingSkills: ["TypeScript", "Next.js", "Design systems"],
    missingSkills: ["Kubernetes"],
    responsibilities: [
      "Lead platform-team architecture decisions.",
      "Mentor ICs across product teams.",
    ],
    requirements: [
      "8+ years in product engineering.",
      "Experience with distributed systems.",
    ],
    benefits: ["Fully remote", "Annual offsite"],
    aboutCompany:
      "Vertex is a marketplace business that connects local merchants with logistics partners.",
  },
  {
    id: "j-004",
    title: "Data Engineer",
    company: "Atlas",
    location: "Madrid",
    workMode: "On-site",
    employmentType: "Full-time",
    posted: "3 days ago",
    salary: "EUR 60–85k",
    summary:
      "Atlas is hiring a data engineer to modernise their analytics pipeline — Python, Snowflake, dbt.",
    matchScore: 71,
    matchingSkills: ["Python"],
    missingSkills: ["Snowflake", "dbt", "Airflow"],
    responsibilities: [
      "Modernise the analytics pipeline.",
      "Own data quality for the reporting warehouse.",
    ],
    requirements: [
      "Hands-on Snowflake + dbt experience.",
      "Strong SQL fluency.",
    ],
    benefits: ["On-site in Madrid", "Health + lunch"],
    aboutCompany:
      "Atlas is a 120-person fintech building payments infrastructure for southern Europe.",
  },
  {
    id: "j-005",
    title: "Mobile Lead (iOS)",
    company: "Polaris",
    location: "Tokyo",
    workMode: "Hybrid",
    employmentType: "Full-time",
    posted: "4 days ago",
    salary: "JPY 14–18M",
    summary:
      "Polaris needs a Mobile Lead to set the long-term iOS direction and mentor the existing 4-person team.",
    matchScore: 68,
    matchingSkills: ["Accessibility", "Product discovery"],
    missingSkills: ["Swift", "SwiftUI"],
    responsibilities: [
      "Set the iOS roadmap.",
      "Coach the existing team.",
    ],
    requirements: [
      "5+ years building production iOS apps.",
      "Prior team-lead experience.",
    ],
    benefits: ["Hybrid in Tokyo", "Annual iOSCon ticket"],
    aboutCompany:
      "Polaris is a mid-market mobility app — 1.5M monthly active users in Japan.",
  },
  {
    id: "j-006",
    title: "Lead Frontend Engineer",
    company: "Northstar Labs",
    location: "Kuala Lumpur",
    workMode: "Hybrid",
    employmentType: "Full-time",
    posted: "Today",
    salary: "MYR 180–240k",
    summary:
      "Northstar Labs is hiring a frontend lead for their internal platform — design system, mentorship, and bar-raising code reviews.",
    matchScore: 96,
    matchingSkills: [
      "TypeScript",
      "React",
      "Next.js",
      "Accessibility",
      "Design systems",
    ],
    missingSkills: [],
    responsibilities: [
      "Lead the frontend platform team.",
      "Own the design system and review bar.",
    ],
    requirements: [
      "6+ years in frontend.",
      "Experience leading 3+ engineers.",
    ],
    benefits: ["Hybrid in KL", "Equity"],
    aboutCompany:
      "Northstar Labs is a 250-person SaaS company building operations software for SMBs across SEA.",
  },
];
