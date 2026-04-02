import { StudentShell } from "@workspace/ui";
import { PracticeModePageShell } from "@/components/practice/mode/practice-mode-page-shell";

function toRepositoryId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.trim() ? raw.trim() : "-1";
}

export default async function PracticeModePage({
  params,
}: {
  params: Promise<{ id?: string | string[] }>;
}) {
  const routeParams = await params;
  const repositoryId = toRepositoryId(routeParams.id);

  return (
    <StudentShell
      title="练习模式"
      description="补齐题库列表进入后的模式承接页，延续旧学员端的题库简介、自由练习、题型练习和最近练习结构，并保留接口异常时的明确兜底提示。"
    >
      <PracticeModePageShell repositoryId={repositoryId} />
    </StudentShell>
  );
}
