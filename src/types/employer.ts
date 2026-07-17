export type EmployerIndustry =
  | "Software & Internet"
  | "Financial Services"
  | "Education"
  | "Healthcare"
  | "Manufacturing"
  | "Public Sector";

export type CompanySize = "1–10" | "11–50" | "51–200" | "201–500" | "500+";

export type EmployerProfile = {
  companyName: string;
  initials: string;
  tagline: string;
  industry: EmployerIndustry;
  size: CompanySize;
  founded: number;
  website: string;
  hq: string;
  about: string;
  openRoles: number;
  activeCandidates: number;
  hiresThisQuarter: number;
  avgTimeToHire: number;
  culture: string[];
  benefits: string[];
};

export type JobStatus = "Live" | "Draft" | "Paused" | "Closed";

export type EmployerJob = {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Internship" | "Contract";
  salary: string;
  status: JobStatus;
  posted: string;
  applicants: number;
  shortlisted: number;
  interviewing: number;
  offered: number;
  filledScore: number;
  mustHave: string[];
  niceToHave: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
};

export type CandidateStage =
  | "New"
  | "Screening"
  | "Shortlisted"
  | "Interviewing"
  | "Offer"
  | "Hired"
  | "Rejected";

export type EmployerCandidate = {
  id: string;
  name: string;
  initials: string;
  title: string;
  location: string;
  appliedFor: string;
  appliedDate: string;
  stage: CandidateStage;
  matchScore: number;
  topSkills: string[];
  summary: string;
  verification: "Verified" | "Pending" | "None";
  starred: boolean;
  timeline: Array<{ label: string; date: string; complete: boolean }>;
};

export type InterviewStatus =
  | "Scheduled"
  | "Pending confirmation"
  | "Reschedule requested"
  | "Completed"
  | "Cancelled";

export type EmployerInterview = {
  id: string;
  candidateName: string;
  candidateInitials: string;
  role: string;
  type: "Phone screen" | "Technical" | "System design" | "Behavioural" | "Final";
  interviewers: string[];
  scheduledFor: string;
  duration: number;
  status: InterviewStatus;
  scorecardItems: number;
};

export type OfferDecision = "Pending" | "Accepted" | "Declined" | "Expired";

export type EmployerOffer = {
  id: string;
  candidateName: string;
  candidateInitials: string;
  role: string;
  baseSalary: string;
  startDate: string;
  sentDate: string;
  decision: OfferDecision;
  matchScore: number;
};