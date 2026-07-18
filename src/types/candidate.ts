export type ApplicationStatus = "Submitted" | "In review" | "Interview" | "Offer";

export type ApplicationTimelineStep = {
  label: string;
  date: string;
  complete: boolean;
};

export type Application = {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  stage: string;
  nextAction: string;
  appliedDate: string;
  update: string;
  timeline: ApplicationTimelineStep[];
};

export type CandidateEvidence = {
  name: string;
  type: string;
  status: "Verified" | "Pending" | "Not started";
};

export type CandidateExperience = {
  company: string;
  role: string;
  period: string;
  description: string;
};

export type CandidateEducation = {
  institution: string;
  qualification: string;
  period: string;
};

export type CandidateProject = {
  name: string;
  description: string;
  skills: string[];
};

export type CandidateProfile = {
  name: string;
  initials: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  profileCompletion: number;
  verificationStatus: string;
  skills: string[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  projects: CandidateProject[];
  evidence: CandidateEvidence[];
};
