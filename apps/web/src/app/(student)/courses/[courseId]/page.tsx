import { StudentShell, SurfaceCard } from "@workspace/ui";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return (
    <StudentShell
      title={`课程学习 · ${courseId}`}
      description="后续在该页面挂接视频播放器、防挂机检测、任务解锁、进度计算与学完后考试逻辑。"
    >
      <SurfaceCard
        eyebrow="Online Study"
        title="学习流程骨架"
        description="旧项目的 `OnlineStudy.vue` 涉及任务目录、学习时长统计与考试入口，这里先拆出可扩展的 Next.js 页面。"
      />
    </StudentShell>
  );
}

