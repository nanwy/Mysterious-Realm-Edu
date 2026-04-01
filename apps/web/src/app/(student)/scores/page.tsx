import { StudentShell } from "@workspace/ui";
import { ScoresPageShell } from "@/components/scores/scores-page-shell";

export default function ScoresPage() {
  return (
    <StudentShell
      title="成绩中心"
      description="迁移旧学员端成绩查询列表，支持考试名称与是否通过筛选，并保留真实接口调用、空态和错误兜底。"
    >
      <ScoresPageShell />
    </StudentShell>
  );
}
