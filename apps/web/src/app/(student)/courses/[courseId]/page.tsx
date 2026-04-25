import { StudentShell } from "@workspace/ui";
import { CourseStudyPage } from "@/components/courses/study/page";
import { fetchCourseStudy } from "@/core/courses";

const CourseDetailRoute = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { courseId } = await params;
  const studyResult = await fetchCourseStudy(courseId);

  return (
    <StudentShell
      title="课程学习工作台"
      description="把课程详情、学习进度、最近任务和考试联动收敛成统一工作台，先让继续学习路径成立，再逐步接入播放器、目录树、学习计时与防挂机逻辑。"
    >
      <CourseStudyPage courseId={courseId} studyResult={studyResult} />
    </StudentShell>
  );
};

export default CourseDetailRoute;
