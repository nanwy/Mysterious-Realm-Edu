import { StudentShell } from "@workspace/ui";
import { MePageShell } from "@/components/me/me-page-shell";

export default function MePage() {
  return (
    <StudentShell
      title="我的空间"
      description="把学习状态、考试提醒、消息和账户管理收进同一个个人工作区，让你一进来就知道先处理什么。"
    >
      <MePageShell />
    </StudentShell>
  );
}
