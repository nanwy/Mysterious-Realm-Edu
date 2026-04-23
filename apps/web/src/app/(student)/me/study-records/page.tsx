import { StudentShell } from "@workspace/ui";
import { StudyRecordsPageShell } from "@/components/me/study-records/study-records-page-shell";

export default function StudyRecordsPage() {
  return (
    <StudentShell>
      <StudyRecordsPageShell />
    </StudentShell>
  );
}
