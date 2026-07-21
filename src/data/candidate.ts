import type { CandidateProfile } from "@/types/candidate";

export const candidateProfile: CandidateProfile = {
  name: "Alex Morgan",
  initials: "AM",
  title: "Frontend Developer",
  location: "Kuala Lumpur, Malaysia",
  email: "alex.morgan@example.com",
  phone: "+60 12 345 6789",
  summary:
    "Product-minded frontend developer who enjoys turning complex workflows into accessible, dependable experiences.",
  profileCompletion: 82,
  verificationStatus: "Pending",
  skills: ["TypeScript", "React", "Next.js", "Accessibility", "Product discovery"],
  education: [
    {
      institution: "University of Malaya",
      qualification: "BSc Computer Science",
      period: "2020–2024",
    },
  ],
  experience: [
    {
      company: "Northstar Labs",
      role: "Frontend Developer Intern",
      period: "Jan–Jun 2024",
      description: "Built reusable product interfaces and improved core accessibility checks.",
    },
  ],
  projects: [
    {
      name: "Community Skills Exchange",
      description: "A responsive platform that connects mentors with early-career learners.",
      skills: ["Next.js", "TypeScript", "User research"],
    },
  ],
  evidence: [
    {
      name: "Computer Science degree",
      type: "Education",
      status: "Verified",
      issuer: "University of Malaya",
      displayStatus: "University verified",
    },
    { name: "Northstar Labs internship", type: "Experience", status: "Pending" },
    { name: "Project portfolio", type: "Portfolio", status: "Verified" },
  ],
};

export const recentActivity = [
  "Profile summary updated",
  "Frontend Developer role saved",
  "Application moved to interview review",
];
