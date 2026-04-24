import { StudentShell } from "@workspace/ui";
import { CoursesPage } from "@/components/courses/page";
import {
  COURSE_ORDER_BY,
  type CourseFiltersState,
  type CourseOrderBy,
  COURSES_PAGE_SIZE,
} from "@/core/courses";

const toPositivePage = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
};

const toKeyword = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

const toOrderBy = (value: string | string[] | undefined): CourseOrderBy => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === COURSE_ORDER_BY.LATEST ||
    raw === COURSE_ORDER_BY.HOT ||
    raw === COURSE_ORDER_BY.PRICE
  ) {
    return raw;
  }

  return COURSE_ORDER_BY.DEFAULT;
};

const CoursesRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const initialFilters: CourseFiltersState = {
    keyword: toKeyword(params.keyword),
    orderBy: toOrderBy(params.sort),
    categoryId: toKeyword(params.category),
    pageNo: toPositivePage(params.page),
    pageSize: COURSES_PAGE_SIZE,
  };

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
