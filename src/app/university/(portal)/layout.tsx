import { UniversityShell } from "@/components/layout/university-shell";

export default function UniversityPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UniversityShell>{children}</UniversityShell>;
}
