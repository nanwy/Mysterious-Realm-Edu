import { StudentShell } from "@workspace/ui";
import { PracticePageShell } from "@/components/practice/practice-page-shell";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialPage = toPositivePage(params.page);
  const initialKeyword = toKeyword(params.keyword);

  return (
    <StudentShell
      title="在线练习"
      description="浏览和搜索练习仓库，延续旧学员端的题库检索结构，并在当前 Next.js 学员端保持可读的加载、空态与错误兜底。"
    >
      <PracticePageShell initialPage={initialPage} initialKeyword={initialKeyword} />
    </StudentShell>
  );
}
