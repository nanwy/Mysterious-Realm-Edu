import { StudentShell } from "@workspace/ui";
import { MePageShell } from "@/components/me/me-page-shell";

export default function MePage() {
  return (
    <StudentShell
      title="个人中心"
      description="统一查看个人资料、课程学习、考试安排、订单服务、证书与消息提醒的学员入口门户。"
    >
      <MePageShell />
    </StudentShell>
  );
}
