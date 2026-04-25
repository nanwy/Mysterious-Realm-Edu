import { StudentShell } from "@workspace/ui";
import { NewsPage } from "@/components/news/page";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const toKeyword = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

const NewsPageRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialQuery = {
    page: toPositivePage(params.page),
    keyword: toKeyword(params.keyword),
  };

  return (
    <StudentShell
      title="新闻资讯"
      description="迁移旧 Vue 学员端新闻资讯主页，承接首页资讯入口并保留推荐、搜索、资讯列表、热榜和分页结构。"
    >
      <NewsPage initialQuery={initialQuery} />
    </StudentShell>
  );
};

export default NewsPageRoute;
