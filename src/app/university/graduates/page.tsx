import { GraduateManagement } from "@/components/features/university/graduate-management";
import {
  academicGraduateRecords,
  universityProfile,
} from "@/lib/university-helpers";

export default function UniversityGraduatesPage() {
  return (
    <GraduateManagement
      initialRecords={academicGraduateRecords}
      totalStudents={universityProfile.totalStudents}
      activeCohorts={universityProfile.activeCohorts}
    />
  );
}
