import { EmployerShell } from "@/components/layout/employer-shell";

export default function EmployerOffersLayout({ children }: { children: React.ReactNode }) {
  return <EmployerShell>{children}</EmployerShell>;
}
