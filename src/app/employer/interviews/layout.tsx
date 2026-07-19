import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerInterviewsLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
