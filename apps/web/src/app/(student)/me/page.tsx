import { StudentShell } from "@workspace/ui";
import { MePageShell } from "@/components/me/me-page-shell";

export default function MePage() {
  return (
    <StudentShell
      title="个人中心"
      description="对应旧项目用户信息、账号安全、课程学习、订单、证书与消息中心等整组个人中心入口页。"
    >
      <MePageShell />
    </StudentShell>
  );
}
