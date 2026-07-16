import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployerShell>{children}</EmployerShell>;
}
