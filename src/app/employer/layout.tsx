import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
