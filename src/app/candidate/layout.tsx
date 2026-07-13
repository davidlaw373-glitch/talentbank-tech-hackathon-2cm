import { CandidateShell } from "@/components/layout/candidate-shell";

export default function CandidateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <CandidateShell>{children}</CandidateShell>;
}
