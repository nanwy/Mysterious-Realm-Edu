import { StudentShell } from "@workspace/ui";
import { CoursesPage } from "@/components/courses/page";
import { buildCourseFiltersFromSearchParams } from "@/core/courses";

const CoursesRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialFilters = buildCourseFiltersFromSearchParams(params);

  return (
    <StudentShell
      title="我的课程"
      description="对应旧项目 `views/user/MyCourse.vue` 的学员课程列表页，现已迁移为可浏览、可筛选、可分页的 Next.js 课程中心。"
    >
      <CoursesPage initialFilters={initialFilters} />
    </StudentShell>
  );
};

export default CoursesRoute;
