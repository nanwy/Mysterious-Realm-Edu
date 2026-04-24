import { StudentShell } from "@workspace/ui";
import { ScoreDetailsPage } from "@/components/scores/details/page";
import { SCORE_PASS_STATE, SCORES_PAGE_SIZE } from "@/core/scores";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const toPassedFilter = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === SCORE_PASS_STATE.PASSED || raw === SCORE_PASS_STATE.FAILED
    ? raw
    : SCORE_PASS_STATE.ALL;
};

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
        initialFilters={{
          passed: toPassedFilter(query.passed),
          pageNo: toPositivePage(query.page),
          pageSize: SCORES_PAGE_SIZE,
        }}
      />
    </StudentShell>
  );
};

export default ScoreDetailsPageRoute;
