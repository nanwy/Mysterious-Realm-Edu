"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge, SurfaceCard } from "@workspace/ui";
import { ResultsPagination } from "../common/results-pagination";
import { fetchCourses, normalizeCourseError } from "./courses-data";
import { CoursesResults } from "./courses-results";
import { CoursesSearchForm } from "./courses-search-form";
import {
  COURSE_PAGE_SIZE,
  type CourseCategoryOption,
  type CourseListItem,
  type CourseQueryState,
} from "./courses-types";

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

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <SurfaceCard
          eyebrow="Courses"
          title="课程列表"
          description="迁移旧 Vue 学员端我的课程列表，保留关键词、排序、分类与分页结构，继续请求真实 `POST /course/list` 接口。"
        >
          <div className="grid gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <Badge className="w-fit rounded-full">真实接口</Badge>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">浏览、筛选并继续你的课程进度</h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    如果接口环境未配置、登录态缺失或服务异常，页面会明确展示错误态，不假定接口已经打通。
                  </p>
                </div>
              </div>
              <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.08}>
                {[
                  { label: "分页规模", value: `${COURSE_PAGE_SIZE} 门/页` },
                  { label: "当前关键词", value: initialQuery.keyword || "全部课程" },
                  { label: "接口状态", value: getStatusCopy(error, isLoading, total) },
                ].map((item) => (
                  <MotionItem key={item.label}>
                    <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>
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
            description="结果项覆盖课程名、讲师、分类、价格、学习状态和进入课程入口，同时保留加载、空态与错误兜底。"
          >
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
