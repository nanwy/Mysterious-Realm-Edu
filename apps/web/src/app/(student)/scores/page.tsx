import { StudentShell, SurfaceCard } from "@workspace/ui";

export default function ScoresPage() {
  return (
    <StudentShell
      title="成绩中心"
      description="对应旧项目 `ExamScore.vue`、`UserExamResult.vue` 等成绩相关页面，后续会迁移成绩列表、考试详情与统计展示。"
    >
      <SurfaceCard
        eyebrow="Scores"
        title="成绩页骨架"
        description="预留成绩列表、错题回看、结果详情与证书联动入口。"
      />
    </StudentShell>
  );
}

