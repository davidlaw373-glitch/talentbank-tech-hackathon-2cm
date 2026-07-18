export type VerificationStatus = "Verified" | "Pending" | "Not started";

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
};

export type Education = {
  id: string;
  institution: string;
  qualification: string;
  period: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  skills: string[];
};

export type Evidence = {
  id: string;
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
