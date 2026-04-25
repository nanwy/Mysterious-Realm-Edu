import { StudentShell } from "@workspace/ui";
import { PracticeRecordsPage } from "@/components/me/practice-records/page";

const PracticeRecordsRoute = async () => (
  <StudentShell>
    <PracticeRecordsPage />
  </StudentShell>
);

export default PracticeRecordsRoute;
