import { GraduateManagement } from "@/components/features/university/graduate-management";
import { graduateRecords, universityProfile } from "@/lib/university-helpers";

export default function UniversityGraduatesPage() {
  return (
    <GraduateManagement
      initialRecords={graduateRecords}
      totalStudents={universityProfile.totalStudents}
      activeCohorts={universityProfile.activeCohorts}
    />
  );
}
