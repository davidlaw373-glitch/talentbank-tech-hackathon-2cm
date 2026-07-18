import { EmployerShell } from "@/components/layout/employer-shell";
import { TalentPoolProvider } from "@/components/features/employer/talent-pool/pool-provider";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployerShell>
      <TalentPoolProvider>{children}</TalentPoolProvider>
    </EmployerShell>
  );
}