export type UniversityRole = "careers" | "registry";
export type EmploymentStatus =
  | "Employed"
  | "Seeking"
  | "Further study"
  | "Not seeking"
  | "Unknown";
export type AcademicVerificationStatus =
  | "Pending"
  | "Verified"
  | "Rejected"
  | "Disputed";
export type VerificationDecision =
  | "approve"
  | "request-information"
  | "reject";
export type EvidenceType =
  | "Degree"
  | "Course completion"
  | "Certificate"
  | "Skill"
  | "Capstone project";

export type UniversityProfile = {
  name: string;
  initials: string;
  location: string;
  verified: boolean;
  faculties: string[];
  specialisms: string[];
};

export type Graduate = {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  faculty: string;
  programme: string;
  graduationYear: number;
  profileCompletion: number;
  nextAction: string;
};

export type VerificationRecord = {
  id: string;
  graduateId: string;
  evidenceName: string;
  evidenceType: EvidenceType;
  status: AcademicVerificationStatus;
  submittedAt: string;
  reviewer?: string;
  reviewedAt?: string;
  note?: string;
  institutionRecord: string;
  evidenceComplete: boolean;
};

export type EmploymentOutcome = {
  graduateId: string;
  status: EmploymentStatus;
  employer?: string;
  jobTitle?: string;
  industry?: string;
  employedAt?: string;
  daysToEmployment?: number;
};

export type VerificationAuditAction =
  | "Evidence submitted"
  | "Verified by Registry"
  | "Rejected by Registry"
  | "Dispute recorded"
  | "Verification requested"
  | "Approved"
  | "Approved in batch"
  | "More information requested"
  | "Rejected";

export type VerificationAuditEntry = {
  id: string;
  recordId: string;
  action: VerificationAuditAction;
  actor: string;
  occurredAt: string;
  note?: string;
};

export type CredentialProjection = {
  graduateId: string;
  candidateName: string;
  qualification: string;
  institution: string;
  verificationStatus: AcademicVerificationStatus;
  trustLabel: "University verified" | null;
};

export type IndustryDemand = {
  id: string;
  role: string;
  industry: string;
  skill: string;
  openRoles: number;
  growth: number;
};

export type CurriculumInsight = {
  id: string;
  title: string;
  change: string;
  evidence: string;
  programme: string;
  recommendation: string;
  confidence: number;
  coverage: number;
};

export type UniversityNotification = {
  id: string;
  category: "Verification" | "Dispute" | "Employment" | "Import" | "Demand";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};
