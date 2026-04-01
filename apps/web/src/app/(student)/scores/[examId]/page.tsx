import { StudentShell } from "@workspace/ui";
import { ScoreDetailsPageShell } from "@/components/scores/score-details-page-shell";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toPassedFilter(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1" || raw === "0" ? raw : "";
}

export default async function ScoreDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const routeParams = await params;
  const query = await searchParams;

  return (
    <StudentShell
      title="成绩明细"
      description="查看某场考试的学员成绩明细，保留是否通过筛选、分页区和真实接口错误兜底。"
    >
      <ScoreDetailsPageShell
        examId={routeParams.examId}
        initialFilters={{
          passed: toPassedFilter(query.passed),
          pageNo: toPositivePage(query.page),
          pageSize: 10,
        }}
      />
    </StudentShell>
  );
}
