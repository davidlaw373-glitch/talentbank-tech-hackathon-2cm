import { DisputeResolution } from "@/components/features/university/dispute-resolution";
import { universityDisputes } from "@/lib/university-helpers";

export default function UniversityDisputesPage() {
  return <DisputeResolution initialDisputes={universityDisputes} />;
}
