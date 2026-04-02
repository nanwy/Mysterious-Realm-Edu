import { StudentShell } from "@workspace/ui";
import { ExamPreviewPageShell } from "@/components/exams/preview/exam-preview-page-shell";

export default async function ExamPreviewPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const routeParams = await params;

  return (
    <StudentShell
      title="考试预览"
      description="查看考试标题、说明、基础统计与开始入口，在接口异常时保留 loading、empty、error 三种明确状态。"
    >
      <ExamPreviewPageShell examId={routeParams.examId} />
    </StudentShell>
  );
}
