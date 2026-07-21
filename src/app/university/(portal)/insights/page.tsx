import { PageHeading } from "@/components/common/page-heading";
import { UniversityInsights } from "@/components/features/university/university-insights";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Insights"
        description="Explore employer demand and evidence-backed curriculum opportunities."
      />
      <UniversityInsights />
    </div>
  );
}
