import { StudentShell } from "@workspace/ui";
import { ExamsPage } from "@/components/exams/page";
import {
  EXAMS_PAGE_SIZE,
  resolveExamKeywordParam,
  resolveExamPageParam,
  resolveExamStatusParam,
  resolveExamTypeParam,
} from "@/core/exams";

const ExamsRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialFilters = {
    examTitle: resolveExamKeywordParam(params.keyword),
    examType: resolveExamTypeParam(params.type),
    state: resolveExamStatusParam(params.status),
    pageNo: resolveExamPageParam(params.page),
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
