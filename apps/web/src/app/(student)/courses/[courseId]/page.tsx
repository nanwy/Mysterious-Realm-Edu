import { StudentShell } from "@workspace/ui";
import { CourseStudyPageShell } from "@/components/courses/course-study-page-shell";
import { getCourseStudy } from "@/lib/course-study";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const study = await getCourseStudy(courseId);

  return (
    <StudentShell
      title={`课程学习 · ${courseId}`}
      description="把旧学员端在线学习页从骨架态推进为可读的学习工作台，先承接真实接口返回的课程详情、进度与最近任务，再继续补播放器、目录树和学习计时链路。"
    >
      <CourseStudyPageShell courseId={courseId} study={study} />
    </StudentShell>
  );
}
