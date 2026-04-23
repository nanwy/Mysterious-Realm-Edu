import { StudentShell } from "@workspace/ui";
import { ExamSessionPageShell } from "@/components/exams/session/exam-session-page-shell";

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const routeParams = await params;

  return (
    <StudentShell
      title="在线考试"
      description="进入考试作答主链路，承接题目浏览、答题缓存、倒计时和提交动作，并在接口异常时保留明确兜底。"
    >
      <ExamSessionPageShell examId={routeParams.examId} />
    </StudentShell>
  );
}
