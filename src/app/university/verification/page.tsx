import { VerificationPipeline } from "@/components/features/university/verification-pipeline";
import { graduateRecords } from "@/lib/university-helpers";

export default function UniversityVerificationPage() {
  return <VerificationPipeline initialRecords={graduateRecords} />;
}
