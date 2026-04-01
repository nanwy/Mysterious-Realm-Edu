import { StudentShell } from "@workspace/ui";
import { MePageShell } from "@/components/me/me-page-shell";

export default function MePage() {
  return (
    <StudentShell
      title="个人中心"
      description="集中承接旧学员端的资料设置、学习考试、订单服务、证书与消息入口，作为 /me 子路由继续扩展的统一导航壳层。"
    >
      <MePageShell />
    </StudentShell>
  );
}
