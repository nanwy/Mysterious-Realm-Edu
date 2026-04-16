import { StudentShell } from "@workspace/ui";
import { StudyProgressPageShell } from "@/components/me/study-progress/study-progress-page-shell";

export default function StudyProgressPage() {
  return (
    <StudentShell>
      <StudyProgressPageShell />
    </StudentShell>
  );
}
