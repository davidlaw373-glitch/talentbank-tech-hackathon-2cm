import type { Job } from "@/types/candidate";

export const jobs: Job[] = [
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    company: "Brightpath Technologies",
    location: "Kuala Lumpur, Malaysia",
    workMode: "Hybrid",
    employmentType: "Full-time",
    salary: "RM 5,500–7,000 monthly",
    posted: "2 days ago",
    matchScore: 92,
    summary: "Build clear, accessible product experiences with a cross-functional software team.",
    responsibilities: ["Build and maintain Next.js product features", "Collaborate with design and product partners", "Improve quality through testing and peer review"],
    requirements: ["Experience with React and TypeScript", "Understanding of responsive and accessible interfaces", "Clear written and verbal communication"],
    matchingSkills: ["TypeScript", "React", "Next.js", "Accessibility"],
    missingSkills: ["Playwright"],
  },
  {
    id: "product-engineer",
    title: "Associate Product Engineer",
    company: "CivicWorks",
    location: "Remote, Malaysia",
    workMode: "Remote",
    employmentType: "Full-time",
    salary: "RM 5,000–6,500 monthly",
    posted: "4 days ago",
    matchScore: 86,
    summary: "Work across discovery and delivery to create useful services for local communities.",
    responsibilities: ["Prototype and ship product improvements", "Join customer discovery sessions", "Maintain reliable frontend systems"],
    requirements: ["Hands-on web development experience", "Interest in product discovery", "Comfort working in a small team"],
    matchingSkills: ["React", "Product discovery", "User research"],
    missingSkills: ["Node.js", "SQL"],
  },
  {
    id: "software-intern",
    title: "Software Engineering Intern",
    company: "Orbit Commerce",
    location: "Petaling Jaya, Malaysia",
    workMode: "On-site",
    employmentType: "Internship",
    salary: "RM 1,800–2,200 monthly",
    posted: "1 week ago",
    matchScore: 79,
    summary: "Learn from an experienced engineering team while delivering customer-facing features.",
    responsibilities: ["Support feature delivery", "Write maintainable application code", "Participate in reviews and team planning"],
    requirements: ["Computer science fundamentals", "A portfolio or coursework in web development", "Curiosity and willingness to learn"],
    matchingSkills: ["TypeScript", "React"],
    missingSkills: ["Automated testing", "CI/CD"],
  },
];

export function getJob(jobId: string) {
  return jobs.find((job) => job.id === jobId);
}
