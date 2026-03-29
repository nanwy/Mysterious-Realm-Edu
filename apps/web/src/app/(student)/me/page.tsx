import { StudentShell, SurfaceCard } from "@workspace/ui";

export default function MePage() {
  return (
    <StudentShell
      title="个人中心"
      description="对应旧项目用户信息、账号安全、我的课程、我的考试、订单、消息中心等整组个人中心页面。"
    >
      <SurfaceCard
        eyebrow="Account"
        title="个人中心导航骨架"
        description="后续这里会拆分为资料设置、学习记录、订单、消息、证书等子路由，并接入部门切换与用户信息查询。"
      />
    </StudentShell>
  );
}

