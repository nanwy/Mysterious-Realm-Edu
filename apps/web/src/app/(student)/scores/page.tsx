import { StudentShell } from "@workspace/ui";
import { ScoresPageShell } from "@/components/scores/scores-page-shell";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

function toPassedFilter(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1" || raw === "0" ? raw : "";
}

export default async function ScoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialFilters = {
    examTitle: toKeyword(params.keyword),
    passed: toPassedFilter(params.passed),
    pageNo: toPositivePage(params.page),
    pageSize: 10,
  } as const;

  return (
    <StudentShell
      title="成绩中心"
      description="迁移旧学员端成绩查询列表，支持考试名称与是否通过筛选，并保留真实接口调用、空态和错误兜底。"
    >
      <ScoresPageShell initialFilters={initialFilters} />
    </StudentShell>
  );
}
