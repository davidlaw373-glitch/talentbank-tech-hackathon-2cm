import type { CandidateProfile } from "@/types/candidate";

export const candidateProfile: CandidateProfile = {
  name: "Alex Morgan",
  initials: "AM",
  title: "Senior Frontend Developer",
  location: "Kuala Lumpur, Malaysia",
  email: "alex.morgan@example.com",
  phone: "+60 12 345 6789",
  summary:
    "Product-minded frontend developer with 6+ years shipping accessible, well-tested React systems. Most recently led the design-system rebuild at Northstar Labs, used by 4 product teams.",
  profileCompletion: 84,
  verificationStatus: "1 pending review",
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Accessibility",
    "Design systems",
    "Product discovery",
  ],
  experience: [
    {
      company: "Northstar Labs",
      role: "Senior Frontend Developer",
      period: "Jan 2024 — present",
      description:
        "Re-built the design system, integrating it with Storybook; cut page load time by 35% across the top 10 flows.",
    },
    {
      company: "Lumen Studio",
      role: "Frontend Developer",
      period: "Aug 2021 — Dec 2023",
      description:
        "Shipped the realtime collaboration suite used by 12,000+ learners; partnered with design and product end-to-end.",
    },
  ],
  education: [
    {
      institution: "University of Malaya",
      qualification: "BSc Computer Science",
      period: "2017 — 2021",
    },
  ],
  projects: [
    {
      name: "Careeros",
      description:
        "Open-source portfolio helper — generates a personalised career timeline from your contributions.",
      skills: ["TypeScript", "Next.js", "Tailwind"],
    },
    {
      name: "Reading List",
      description:
        "Reading-list app that summarises a saved article into 5 bullet points using a small open-source model.",
      skills: ["React", "Express", "Hugging Face"],
    },
  ],
  evidence: [
    {
      name: "Computer Science degree",
      type: "Education",
      status: "Verified",
    },
    {
      name: "Northstar Labs internship",
      type: "Experience",
      status: "Pending",
    },
    {
      name: "Project portfolio",
      type: "Portfolio",
      status: "Verified",
    },
  ],
};

export const recentActivity: string[] = [
  "AI refreshed your matches — 3 new strong fits added.",
  "Your application for Senior Frontend at Helio moved to interview.",
  "AI summary for Helio interview kit is ready to review.",
  "Credentials sync completed — 1 university updated.",
];
