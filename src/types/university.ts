export type UniversityProfile = {
  institutionName: string;
  initials: string;
  type: "Public" | "Private";
  city: string;
  country: string;
  founded: number;
  totalStudents: number;
  activeCohorts: number;
  employmentRate: number;
  medianTimeToHire: number;
  tagline: string;
  about: string;
  topPrograms: string[];
  partnerEmployers: number;
  verifiedCredentials: number;
};

export type VerificationRecordStatus =
  | "Verified"
  | "Pending review"
  | "Action required"
  | "Disputed";

export type GraduateRecord = {
  id: string;
  name: string;
  initials: string;
  program: string;
  graduationYear: number;
  gpa: string;
  status: VerificationRecordStatus;
  skills: string[];
  capstone: string;
  employment: "Employed" | "Open to work" | "In grad school" | "Unknown";
  company?: string;
  role?: string;
};

export type DisputeStatus = "Open" | "In review" | "Resolved" | "Rejected";

export type UniversityDispute = {
  id: string;
  graduateName: string;
  graduateInitials: string;
  field: string;
  claim: string;
  counter: string;
  filedDate: string;
  status: DisputeStatus;
};

export type EmploymentRecord = {
  id: string;
  cohort: string;
  total: number;
  employed: number;
  inGradSchool: number;
  seeking: number;
  avgSalary: string;
  topEmployer: string;
  topRole: string;
};

export type SkillDemand = {
  skill: string;
  openings: number;
  delta: number;
};