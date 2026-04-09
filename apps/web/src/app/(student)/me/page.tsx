import { StudentShell } from "@workspace/ui";
import { MePageShell } from "@/components/me/me-page-shell";

export default function MePage() {
  return (
    <StudentShell>
      <MePageShell />
    </StudentShell>
  );
}
