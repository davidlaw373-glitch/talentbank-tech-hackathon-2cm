import type { GraduateId } from "@/types/university";

export type VerificationStatus = "Verified" | "Pending" | "Not started";

export type CandidateProfile = {
  graduateId: GraduateId;
  name: string;
  initials: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  profileCompletion: number;
  verificationStatus: VerificationStatus;
  skills: string[];
  education: Array<{ institution: string; qualification: string; period: string }>;
  experience: Array<{ company: string; role: string; period: string; description: string }>;
  projects: Array<{ name: string; description: string; skills: string[] }>;
  evidence: Array<{ name: string; type: string; status: VerificationStatus }>;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Internship";
  salary: string;
  posted: string;
  matchScore: number;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  matchingSkills: string[];
  missingSkills: string[];
};

export type ApplicationStatus = "Submitted" | "In review" | "Interview" | "Offer";

export type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
  stage: string;
  update: string;
  nextAction: string;
  timeline: Array<{ label: string; date: string; complete: boolean }>;
};
