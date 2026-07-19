import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerCompanyLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
