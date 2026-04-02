import { StudentShell } from "@workspace/ui";
import { QuestionnairePageShell } from "@/components/questionnaire/questionnaire-page-shell";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialPage = toPositivePage(params.page);
  const initialKeyword = toKeyword(params.keyword);

  return (
    <StudentShell
      title="问卷调查"
      description="补齐首页问卷入口的承接页，保留旧学员端的搜索、列表、分页结构，并在真实接口失败时展示明确错误说明。"
    >
      <QuestionnairePageShell
        initialPage={initialPage}
        initialKeyword={initialKeyword}
      />
    </StudentShell>
  );
}
