import { PageHeading } from "@/components/common/page-heading";
import { GraduateManagement } from "@/components/features/university/graduate-management";

export default function GraduatesPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Graduates"
        description="View graduate records, profile completeness, outcomes, and credential status."
      />
      <GraduateManagement />
    </div>
  );
}
