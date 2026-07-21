import { PageHeading } from "@/components/common/page-heading";
import { UniversityReports } from "@/components/features/university/university-reports";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Reports"
        description="Prepare transparent graduate outcome reports for your institution."
      />
      <UniversityReports />
    </div>
  );
}
