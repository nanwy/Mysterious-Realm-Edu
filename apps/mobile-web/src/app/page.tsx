import { EmptyState, MobileShell, SurfaceCard } from "@workspace/ui";

export default function MobileHomePage() {
  return (
    <MobileShell title="学习首页">
      <SurfaceCard
        eyebrow="Mobile"
        title="移动端首页骨架"
        description="首期先保留移动端独立应用和页面结构，后续按实际需求逐步承接学员端移动体验。"
      >
        <EmptyState
          title="移动端内容待接入"
          description="后续将在这里补课程推荐、最近学习、待参加考试和个人提醒。"
        />
      </SurfaceCard>
    </MobileShell>
  );
}

