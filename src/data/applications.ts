import type { Application } from "@/types/candidate";

export const applications: Application[] = [
  {
    id: "app-brightpath",
    jobId: "frontend-developer",
    jobTitle: "Frontend Developer",
    company: "Brightpath Technologies",
    appliedDate: "10 July 2026",
    status: "Interview",
    stage: "Hiring manager review",
    update: "Your profile has been shared with the engineering manager.",
    nextAction: "Review the role and prepare examples of your frontend work.",
    timeline: [
      { label: "Application submitted", date: "10 July", complete: true },
      { label: "Recruiter review", date: "11 July", complete: true },
      { label: "Hiring manager review", date: "In progress", complete: false },
      { label: "Interview", date: "To be scheduled", complete: false },
    ],
  },
  {
    id: "app-civicworks",
    jobId: "product-engineer",
    jobTitle: "Associate Product Engineer",
    company: "CivicWorks",
    appliedDate: "6 July 2026",
    status: "In review",
    stage: "Recruiter review",
    update: "The hiring team is reviewing your application.",
    nextAction: "No action is needed right now.",
    timeline: [
      { label: "Application submitted", date: "6 July", complete: true },
      { label: "Recruiter review", date: "In progress", complete: false },
      { label: "Team interview", date: "Not started", complete: false },
    ],
  },
];

export function getApplication(applicationId: string) {
  return applications.find((application) => application.id === applicationId);
}
