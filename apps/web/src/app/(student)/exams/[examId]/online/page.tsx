import { StudentShell } from "@workspace/ui";
import { OnlineExamPage } from "@/components/exams/online/page";

const OnlineExamRoute = async ({
  params,
}: {
  params: Promise<{ examId: string }>;
}) => {
  const routeParams = await params;

  return (
    <StudentShell
      title="在线考试"
      description="进入正式作答空间，确认题目、计时、答题进度与保存状态。"
    >
      <OnlineExamPage examId={routeParams.examId} />
    </StudentShell>
  );
};

export default OnlineExamRoute;
