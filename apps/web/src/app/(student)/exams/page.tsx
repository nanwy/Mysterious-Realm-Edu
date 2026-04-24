import { StudentShell } from "@workspace/ui";
import { ExamsPage } from "@/components/exams/page";
import {
  EXAMS_PAGE_SIZE,
  EXAM_STATUS,
  EXAM_TYPE,
  type ExamStatusFilter,
  type ExamTypeFilter,
} from "@/core/exams";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const toKeyword = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

const toExamType = (
  value: string | string[] | undefined
): ExamTypeFilter => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === EXAM_TYPE.MINE || raw === EXAM_TYPE.PUBLIC) {
    return raw;
  }

  return EXAM_TYPE.PUBLIC;
};

const toExamStatus = (
  value: string | string[] | undefined
): ExamStatusFilter => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === EXAM_STATUS.ALL ||
    raw === EXAM_STATUS.IN_PROGRESS ||
    raw === EXAM_STATUS.NOT_STARTED ||
    raw === EXAM_STATUS.ENDED
  ) {
    return raw;
  }

  return EXAM_STATUS.ALL;
};

const ExamsRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
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
      description="迁移旧学员端考试列表页到 Next.js 学员端，支持公开考试/我的考试切换、状态筛选、关键词搜索与分页浏览。"
    >
      <ExamsPage initialFilters={initialFilters} />
    </StudentShell>
  );
};

export default ExamsRoute;
