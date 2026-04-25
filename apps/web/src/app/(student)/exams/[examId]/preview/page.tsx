import { StudentShell } from "@workspace/ui";
import { ExamPreviewPage } from "@/components/exams/preview/page";

const ExamPreviewRoute = async ({
  params,
}: {
  params: Promise<{ examId: string }>;
}) => {
  const routeParams = await params;

  return (
    <StudentShell
      title="考试预览"
      description="查看考试标题、说明、基础统计与开始入口；接口不可用时展示安全的不可用状态。"
    >
      <ExamPreviewPage examId={routeParams.examId} />
    </StudentShell>
  );
};

export default ExamPreviewRoute;
