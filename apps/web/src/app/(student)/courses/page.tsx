import { StudentShell } from "@workspace/ui";
import { CoursesPageShell } from "@/components/courses/courses-page-shell";

function toPositivePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function toKeyword(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialQuery = {
    page: toPositivePage(params.page),
    keyword: toKeyword(params.keyword),
    orderByType: toKeyword(params.sort),
    categoryId: toKeyword(params.category),
  };

  return (
    <StudentShell
      title="我的课程"
      description="对应旧项目 `views/user/MyCourse.vue` 的学员课程列表页，现已迁移为可浏览、可筛选、可分页的 Next.js 课程中心。"
    >
      <CoursesPageShell initialQuery={initialQuery} />
    </StudentShell>
  );
}
