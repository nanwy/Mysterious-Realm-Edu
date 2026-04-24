"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, SurfaceCard } from "@workspace/ui";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { fetchCourses, normalizeCourseError } from "./courses-data";
import { CoursesResults } from "./courses-results";
import { CoursesSearchForm } from "./courses-search-form";
import {
  COURSE_PAGE_SIZE,
  type CourseCategoryOption,
  type CourseListItem,
  type CourseQueryState,
} from "./courses-types";
import { ResultsPagination } from "../common/results-pagination";

function createQueryString(query: CourseQueryState) {
  const params = new URLSearchParams();

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.keyword?.trim()) {
    params.set("keyword", query.keyword.trim());
  }

  if (query.orderByType) {
    params.set("sort", query.orderByType);
  }

  if (query.categoryId) {
    params.set("category", query.categoryId);
  }

  const result = params.toString();
  return result ? `?${result}` : "";
}

function getStatusCopy(error: string | null, loading: boolean, total: number) {
  if (error) {
    return "接口异常";
  }

  if (loading) {
    return "加载中";
  }

  return `${total} 门课程`;
}

function getActiveFilterSummary(query: CourseQueryState, categories: CourseCategoryOption[]) {
  const summary = [];

  if (query.keyword?.trim()) {
    summary.push(`关键词：${query.keyword.trim()}`);
  }

  if (query.orderByType) {
    const sortMap = new Map([
      ["1", "最新上架"],
      ["2", "学习热度"],
      ["3", "价格优先"],
    ]);
    summary.push(`排序：${sortMap.get(query.orderByType) ?? "已设置"}`);
  }

  if (query.categoryId) {
    const categoryLabel = categories.find((item) => item.value === query.categoryId)?.label ?? query.categoryId;
    summary.push(`分类：${categoryLabel}`);
  }

  return summary;
}

export function CoursesPageShell({ initialQuery }: { initialQuery: CourseQueryState }) {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<CourseListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [categories, setCategories] = useState<CourseCategoryOption[]>([
    { value: "", label: "全部分类" },
    { value: "placeholder", label: "分类待接口补充" },
  ]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchCourses(initialQuery)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setItems(result.items);
        setTotal(result.total);
        setCategories(result.categories);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setItems([]);
        setTotal(0);
        setCategories([
          { value: "", label: "全部分类" },
          { value: "placeholder", label: "分类待接口补充" },
        ]);
        setError(normalizeCourseError(requestError));
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
        setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialQuery, reloadVersion]);

  const navigate = (nextQuery: CourseQueryState) => {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(nextQuery)}`, { scroll: false });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / COURSE_PAGE_SIZE));
  const activeFilters = getActiveFilterSummary(initialQuery, categories);
  const heroStats = [
    { label: "分页规模", value: `${COURSE_PAGE_SIZE} 门/页`, detail: "延续旧站列表节奏" },
    { label: "当前视图", value: activeFilters.length ? "精准筛选" : "全部课程", detail: activeFilters.length ? `${activeFilters.length} 个条件生效` : "适合先快速浏览" },
    { label: "接口状态", value: getStatusCopy(error, isLoading, total), detail: error ? "优先暴露真实异常" : "与真实接口保持同步" },
  ];

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

                <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.08}>
                  {heroStats.map((item) => (
                    <MotionItem key={item.label}>
                      <div className="rounded-[24px] border border-border/70 bg-background/75 px-4 py-4">
                        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-3 text-lg font-semibold text-foreground">{item.value}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
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
                    <p className="mt-2 text-lg font-semibold text-foreground">先聚焦，再进入学习</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {activeFilters.length ? `${activeFilters.length} 个条件` : "无额外筛选"}
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
              <CoursesSearchForm
                defaultValues={initialQuery}
                categoryOptions={categories}
                pending={isPending}
                onSubmit={(values) => navigate(values)}
                onReset={() =>
                  navigate({
                    page: 1,
                    keyword: "",
                    orderByType: "",
                    categoryId: "",
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
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Results summary</p>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {isLoading ? "正在整理课程结果" : error ? "结果区已切换为异常兜底" : `已整理 ${total} 门可浏览课程`}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(activeFilters.length ? activeFilters : ["全部课程"]).map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <CoursesResults
                items={items}
                loading={isLoading}
                error={error}
                keyword={initialQuery.keyword}
                onRetry={() => {
                  setIsPending(false);
                  setReloadVersion((value) => value + 1);
                }}
              />
            </div>
          </SurfaceCard>
        </MotionReveal>

        <MotionReveal direction="up" delay={0.1}>
          <ResultsPagination
            page={Math.min(initialQuery.page, totalPages)}
            pageCount={totalPages}
            total={total}
            pending={isPending}
            itemLabel="门课程"
            onPageChange={(page) =>
              navigate({
                ...initialQuery,
                page,
              })
            }
          />
        </MotionReveal>
      </section>
    </div>
  );
}
