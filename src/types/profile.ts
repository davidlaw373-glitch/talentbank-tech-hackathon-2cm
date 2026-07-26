import type { CredentialStatus } from "@/types/credential";

export type VerificationStatus = "Verified" | "Pending" | "Not started";

export type Experience = {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
};

export type Education = {
  id: number;
  institution: string;
  qualification: string;
  period: string;
  status: CredentialStatus;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  skills: string[];
  status: CredentialStatus;
};

export type Evidence = {
  id: number;
  name: string;
  type: string;
  status: VerificationStatus;
};

export type ProfileBasics = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
};
