import { DisputeResolution } from "@/components/features/university/dispute-resolution";
import { universityDisputes } from "@/data/university";

export default function UniversityDisputesPage() {
  return <DisputeResolution initialDisputes={universityDisputes} />;
}
