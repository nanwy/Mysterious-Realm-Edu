import { StudentShell } from "@workspace/ui";
import { ExamsPageShell } from "@/components/exams/exams-page-shell";
import { EXAMS_PAGE_SIZE, type ExamStatusFilter, type ExamTypeFilter } from "@/components/exams/exams-types";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

function toExamType(value: string | string[] | undefined): ExamTypeFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "2" ? "2" : "1";
}

function toExamStatus(value: string | string[] | undefined): ExamStatusFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "0" || raw === "2" || raw === "3" ? raw : "";
}

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialFilters = {
    examTitle: toKeyword(params.keyword),
    examType: toExamType(params.type),
    state: toExamStatus(params.status),
    pageNo: toPositivePage(params.page),
    pageSize: EXAMS_PAGE_SIZE,
  } as const;

  return (
    <StudentShell
      title="在线考试"
      description="迁移旧学员端考试列表页到 Next.js 学员端，支持公开考试/我的考试切换、状态筛选、关键词搜索与分页浏览，并在接口失败时保留明确错误态。"
    >
      <ExamsPageShell initialFilters={initialFilters} />
    </StudentShell>
  );
}
