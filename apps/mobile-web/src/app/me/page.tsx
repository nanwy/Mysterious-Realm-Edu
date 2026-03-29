import { MobileShell, SurfaceCard } from "@workspace/ui";

export default function MobileMePage() {
  return (
    <MobileShell title="我的">
      <SurfaceCard
        eyebrow="Profile"
        title="个人中心骨架"
        description="后续接入移动端账号设置、我的课程、我的考试与消息通知。"
      />
    </MobileShell>
  );
}
