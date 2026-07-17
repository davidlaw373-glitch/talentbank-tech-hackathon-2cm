import { VerificationPipeline } from "@/components/features/university/verification-pipeline";
import { graduateRecords } from "@/data/university";

export default function UniversityVerificationPage() {
  return <VerificationPipeline initialRecords={graduateRecords} />;
}
