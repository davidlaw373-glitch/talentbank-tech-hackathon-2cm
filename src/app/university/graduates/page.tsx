import { GraduateManagement } from "@/components/features/university/graduate-management";
import { academicGraduateRecords } from "@/lib/university-helpers";

export default function UniversityGraduatesPage() {
  return <GraduateManagement initialRecords={academicGraduateRecords} />;
}
