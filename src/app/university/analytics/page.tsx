import { AnalyticsActions } from "@/components/features/university/analytics-interactions";
import { AnalyticsAdvanced } from "@/components/features/university/analytics-advanced";
import { AnalyticsOverview } from "@/components/features/university/analytics-overview";
import { AnalyticsTabs } from "@/components/features/university/analytics-tabs";

export default function UniversityAnalyticsPage() {
  return (
    <div className="space-y-8">
      <AnalyticsActions />
      <AnalyticsTabs
        overview={<AnalyticsOverview />}
        advanced={<AnalyticsAdvanced />}
      />
    </div>
  );
}