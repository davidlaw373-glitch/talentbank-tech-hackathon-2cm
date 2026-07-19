import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerJobsLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
