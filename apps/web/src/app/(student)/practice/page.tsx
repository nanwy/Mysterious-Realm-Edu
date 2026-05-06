import { StudentShell } from "@workspace/ui";
import type { PracticeRepositoryListRequest } from "@workspace/api";
import { PracticePage } from "@/components/practice/page";

const resolvePositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const resolveKeyword = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

const PracticePageRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialQuery: PracticeRepositoryListRequest = {
    pageNo: resolvePositivePage(params.page),
    title: resolveKeyword(params.keyword),
  };

  return (
    <StudentShell
      title="在线练习"
      description="浏览和搜索练习仓库，延续旧学员端的题库检索结构，并在当前 Next.js 学员端保持可读的加载、空态与错误兜底。"
    >
      <PracticePage initialQuery={initialQuery} />
    </StudentShell>
  );
};

export default PracticePageRoute;
