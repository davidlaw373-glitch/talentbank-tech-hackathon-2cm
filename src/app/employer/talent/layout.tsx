import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerTalentLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
