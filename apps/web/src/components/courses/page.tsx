"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, SurfaceCard } from "@workspace/ui";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { CoursesFilters } from "./filters";
import { CoursesResults } from "./results";
import { ResultsPagination } from "../common/results-pagination";
import {
  COURSE_ORDER_BY,
  COURSE_ORDER_BY_OPTIONS,
  type CourseCategoryOption,
  type CourseFiltersState,
  type CourseFormValues,
  courseQueryOptions,
  normalizeCourseError,
} from "@/core/courses";

const FALLBACK_CATEGORY_OPTIONS: CourseCategoryOption[] = [
  { value: "", label: "全部分类" },
  { value: "placeholder", label: "分类待接口补充" },
];

const createQueryString = (filters: CourseFiltersState) => {
  const params = new URLSearchParams();

  if (filters.pageNo > 1) {
    params.set("page", String(filters.pageNo));
  }

  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }

  if (filters.orderBy !== COURSE_ORDER_BY.DEFAULT) {
    params.set("sort", filters.orderBy);
  }

  if (filters.categoryId) {
    params.set("category", filters.categoryId);
  }

  const result = params.toString();
  return result ? `?${result}` : "";
};

const getStatusCopy = (
  error: string | null,
  loading: boolean,
  total: number
) => {
  if (error) {
    return "接口异常";
  }

  if (loading) {
    return "加载中";
  }

  return `${total} 门课程`;
};

const getActiveFilterSummary = (
  filters: CourseFiltersState,
  categories: CourseCategoryOption[]
) => {
  const summary: string[] = [];

  if (filters.keyword) {
    summary.push(`关键词：${filters.keyword}`);
  }

  if (filters.orderBy !== COURSE_ORDER_BY.DEFAULT) {
    const label = COURSE_ORDER_BY_OPTIONS.find(
      (option) => option.value === filters.orderBy
    )?.label;
    summary.push(`排序：${label ?? "已设置"}`);
  }

  if (filters.categoryId) {
    const categoryLabel =
      categories.find((item) => item.value === filters.categoryId)?.label ??
      filters.categoryId;
    summary.push(`分类：${categoryLabel}`);
  }

  return summary;
};

export const CoursesPage = ({
  initialFilters,
}: {
  initialFilters: CourseFiltersState;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const coursesQuery = useQuery(courseQueryOptions.list(initialFilters));
  const items = coursesQuery.data?.items ?? [];
  const total = coursesQuery.data?.total ?? 0;
  const categories = coursesQuery.data?.categories ?? FALLBACK_CATEGORY_OPTIONS;
  const isLoading = coursesQuery.isPending;
  const errorMessage = coursesQuery.isError
    ? normalizeCourseError(coursesQuery.error)
    : null;

  const navigate = (nextFilters: CourseFiltersState) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextFilters)}`, {
        scroll: false,
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / initialFilters.pageSize));
  const activeFilters = getActiveFilterSummary(initialFilters, categories);
  const heroStats = [
    {
      label: "分页规模",
      value: `${initialFilters.pageSize} 门/页`,
      detail: "延续旧站列表节奏",
    },
    {
      label: "当前视图",
      value: activeFilters.length ? "精准筛选" : "全部课程",
      detail: activeFilters.length
        ? `${activeFilters.length} 个条件生效`
        : "适合先快速浏览",
    },
    {
      label: "接口状态",
      value: getStatusCopy(errorMessage, isLoading, total),
      detail: errorMessage ? "优先暴露真实异常" : "与真实接口保持同步",
    },
  ];

  const formDefaults: CourseFormValues = {
    page: initialFilters.pageNo,
    keyword: initialFilters.keyword,
    orderBy: initialFilters.orderBy,
    categoryId: initialFilters.categoryId,
  };

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <SurfaceCard
          eyebrow="Courses"
          title="课程列表"
          description="将旧学员端课程列表整理成更清晰的选课工作台：先判断接口状态，再围绕关键词、分类和排序快速缩小范围。"
        >
          <div className="grid gap-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.95fr)]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="w-fit rounded-full">真实接口</Badge>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    学习主链路 / 课程检索
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-[2.15rem]">
                    把课程筛选、进度判断和继续学习入口收敛到同一个视图里。
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    这不是静态展示页。它会优先暴露真实接口状态，让你能在分页浏览、关键词检索和分类切换之间快速定位下一门该学的课程。
                  </p>
                </div>

                <MotionStagger
                  className="grid gap-3 sm:grid-cols-3"
                  delayChildren={0.08}
                >
                  {heroStats.map((item) => (
                    <MotionItem key={item.label}>
                      <div className="rounded-[24px] border border-border/70 bg-background/75 px-4 py-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">
                          {item.value}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    </MotionItem>
                  ))}
                </MotionStagger>
              </div>

              <div className="rounded-[28px] border border-border/70 bg-background/75 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                      当前筛选策略
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      先聚焦，再进入学习
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {activeFilters.length
                      ? `${activeFilters.length} 个条件`
                      : "无额外筛选"}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3">
                  {activeFilters.length ? (
                    activeFilters.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-foreground"
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-card/70 px-4 py-4 text-sm leading-7 text-muted-foreground">
                      当前正在浏览全部课程。建议先输入课程名、讲师名或切换分类，缩短找到目标课程的时间。
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-border/60 pt-4 text-sm leading-7 text-muted-foreground">
                  接口未联通或登录态失效时，结果区会直接进入错误态，而不是展示看似完整的假数据。
                </div>
              </div>
            </div>

            <div data-testid="courses-filter-section">
              <CoursesFilters
                defaultValues={formDefaults}
                categoryOptions={categories}
                pending={isPending}
                onSubmit={(values) =>
                  navigate({
                    ...initialFilters,
                    keyword: values.keyword,
                    orderBy: values.orderBy,
                    categoryId: values.categoryId,
                    pageNo: 1,
                  })
                }
                onReset={() =>
                  navigate({
                    ...initialFilters,
                    keyword: "",
                    orderBy: COURSE_ORDER_BY.DEFAULT,
                    categoryId: "",
                    pageNo: 1,
                  })
                }
              />
            </div>
          </div>
        </SurfaceCard>
      </MotionReveal>

      <section data-testid="courses-results-section" className="grid gap-4">
        <MotionReveal direction="up" delay={0.06}>
          <SurfaceCard
            title="课程结果"
            description="结果区围绕“这门课值不值得现在点进去”组织信息，优先呈现状态、进度、内容规模和进入动作。"
          >
            <div className="grid gap-5">
              <div className="flex flex-col gap-3 border-b border-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Results summary
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {isLoading
                      ? "正在整理课程结果"
                      : errorMessage
                        ? "结果区已切换为异常兜底"
                        : `已整理 ${total} 门可浏览课程`}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(activeFilters.length ? activeFilters : ["全部课程"]).map(
                    (item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>

              <CoursesResults
                items={items}
                loading={isLoading}
                error={errorMessage}
                keyword={initialFilters.keyword}
                onRetry={() => {
                  void coursesQuery.refetch();
                }}
              />
            </div>
          </SurfaceCard>
        </MotionReveal>

        <MotionReveal direction="up" delay={0.1}>
          <ResultsPagination
            page={Math.min(initialFilters.pageNo, totalPages)}
            pageCount={totalPages}
            total={total}
            pending={isPending}
            itemLabel="门课程"
            onPageChange={(page) =>
              navigate({
                ...initialFilters,
                pageNo: page,
              })
            }
          />
        </MotionReveal>
      </section>
    </div>
  );
};
