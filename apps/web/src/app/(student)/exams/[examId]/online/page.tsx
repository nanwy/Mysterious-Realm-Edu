import { StudentShell } from "@workspace/ui";
import { OnlineExamPage } from "@/components/exams/online/page";

const OnlineExamRoute = async ({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ userExamId?: string | string[] }>;
}) => {
  const routeParams = await params;
  const routeSearchParams = await searchParams;
  const userExamId = Array.isArray(routeSearchParams.userExamId)
    ? routeSearchParams.userExamId[0]
    : routeSearchParams.userExamId;

  return (
    <StudentShell
      title="在线考试"
      description="进入正式作答空间，确认题目、计时、答题进度与保存状态。"
    >
      <OnlineExamPage examId={routeParams.examId} userExamId={userExamId} />
    </StudentShell>
  );
};

export default OnlineExamRoute;
