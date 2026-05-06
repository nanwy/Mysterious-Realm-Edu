import type { ExamListRequest } from "@workspace/api";
import { StudentShell } from "@workspace/ui";
import { ScoreDetailsPage } from "@/components/scores/details/page";
import {
  resolveScorePageParam,
  resolveScorePassedParam,
  SCORES_PAGE_SIZE,
} from "@/core/scores";

const ScoreDetailsPageRoute = async ({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const routeParams = await params;
  const query = await searchParams;

  return (
    <StudentShell
      title="成绩明细"
      description="查看某场考试的学员成绩明细，保留是否通过筛选、分页区和真实接口错误兜底。"
    >
      <ScoreDetailsPage
        examId={routeParams.examId}
        initialFilters={
          {
            passed: resolveScorePassedParam(query.passed),
            pageNo: resolveScorePageParam(query.page),
            pageSize: SCORES_PAGE_SIZE,
          } satisfies ExamListRequest
        }
      />
    </StudentShell>
  );
};

export default ScoreDetailsPageRoute;
