import { StudentShell } from "@workspace/ui";
import { ExamsPageShell } from "@/components/me/exams/exams-page-shell";

export default function MeExamsPage() {
  return (
    <StudentShell
      title="我的考试"
      description="集中查看待参加考试、进行中任务与已结束结果，随时进入考试或回看详情。"
    >
      <ExamsPageShell />
    </StudentShell>
  );
}
