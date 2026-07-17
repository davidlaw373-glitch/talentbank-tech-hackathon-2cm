import { UniversityShell } from "@/components/layout/university-shell";

export default function UniversityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UniversityShell>{children}</UniversityShell>;
}