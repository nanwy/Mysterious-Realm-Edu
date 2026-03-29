import { MobileShell, SurfaceCard } from "@workspace/ui";

export default function MobileExamPage() {
  return (
    <MobileShell title="考试页">
      <SurfaceCard
        eyebrow="Exam"
        title="移动考试骨架"
        description="预留移动端考试列表、进入考试、考试状态提示与成绩入口。"
      />
    </MobileShell>
  );
}

