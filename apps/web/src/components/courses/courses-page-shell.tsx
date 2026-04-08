"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Layers3, SearchCheck, Sparkles } from "lucide-react";
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

function getActiveFilterSummary(query: CourseQueryState, categories: CourseCategoryOption[]) {
  const summary: string[] = [];

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

function getResultsHeadline({
  loading,
  error,
  total,
  activeFilters,
}: {
  loading: boolean;
  error: string | null;
  total: number;
  activeFilters: string[];
}) {
  if (loading) {
    return "正在根据当前条件整理课程结果";
  }

  if (error) {
    return "结果区已切换为异常兜底";
  }

  if (!total) {
    return activeFilters.length ? "当前条件下暂未找到课程" : "当前暂无可浏览课程";
  }

  return activeFilters.length
    ? `已筛出 ${total} 门更贴近当前目标的课程`
    : `已整理 ${total} 门可浏览课程`;
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
    {
      label: "分页规模",
      value: `${COURSE_PAGE_SIZE} 门/页`,
      detail: "沿用旧站分页节奏，但把信息判断前置。",
      Icon: Layers3,
    },
    {
      label: "当前视图",
      value: activeFilters.length ? "精准筛选" : "全部课程",
      detail: activeFilters.length ? `${activeFilters.length} 个条件正在收窄结果` : "适合先浏览、再缩小范围。",
      Icon: SearchCheck,
    },
    {
      label: "接口状态",
      value: getStatusCopy(error, isLoading, total),
      detail: error ? "真实暴露异常，不再用假数据撑满页面。" : "课程结果与真实接口同步联动。",
      Icon: Compass,
    },
  ];
  const selectionSignals = [
    {
      title: "先选路径",
      detail: activeFilters.length ? "当前已进入定向查找模式，可直接比较结果卡片。" : "先用分类或关键词确定学习主题，再进入课程。",
    },
    {
      title: "再看状态",
      detail: "结果卡会优先告诉你这门课是待开始、学习中还是已接近完成。",
    },
    {
      title: "最后判断动作",
      detail: "继续学习、查看课时规模与价格判断会收敛在同一张卡里。",
    },
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
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.95fr)]">
              <div className="space-y-5 rounded-[32px] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--card)_86%,var(--accent)_14%),color-mix(in_oklab,var(--background)_82%,var(--primary)_18%))] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="w-fit rounded-full">真实接口</Badge>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    学习主链路 / 课程检索
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {activeFilters.length ? "Focused browsing" : "Open browsing"}
                  </span>
                </div>

                <div className="space-y-3">
                  <h2 className="max-w-3xl text-3xl font-black tracking-[-0.05em] text-foreground sm:text-[2.5rem]">
                    让找课、判断优先级和继续学习，落在同一块学习雷达里。
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                    页面不再只是课程平铺列表，而是把筛选策略、课程状态和进入动作压缩到一次浏览决策里。你先判断方向，再决定现在点进去的是哪门课。
                  </p>
                </div>

                <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.08} data-testid="courses-hero-stats">
                  {heroStats.map(({ label, value, detail, Icon }) => (
                    <MotionItem key={label}>
                      <div className="rounded-[24px] border border-border/70 bg-background/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                            {label}
                          </p>
                          <div className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </div>
                        </div>
                        <p className="mt-4 text-xl font-semibold text-foreground">{value}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
                      </div>
                    </MotionItem>
                  ))}
                </MotionStagger>

                <div className="grid gap-3 rounded-[28px] border border-border/60 bg-background/72 p-4 lg:grid-cols-3">
                  {selectionSignals.map((item) => (
                    <div key={item.title} className="rounded-[22px] border border-border/60 bg-card/88 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-foreground/90">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[32px] border border-border/70 bg-background/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                data-testid="courses-filter-strategy"
              >
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

                <div className="mt-5 rounded-[24px] border border-border/60 bg-card/85 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <Sparkles className="size-4" />
                    浏览建议
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {activeFilters.length
                      ? "当前已经进入目标式筛选。优先看结果卡上的状态与进度，避免只按标题判断。"
                      : "当前适合做第一轮扫读。先浏览结果，再决定是否加关键词或缩小分类。"}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {activeFilters.length ? (
                    activeFilters.map((item) => (
                      <div
                        key={item}
                        className="rounded-[22px] border border-border/60 bg-card/80 px-4 py-3 text-sm text-foreground"
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-border/70 bg-card/70 px-4 py-4 text-sm leading-7 text-muted-foreground">
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
                activeFilters={activeFilters}
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
              <div className="grid gap-4 border-b border-border/60 pb-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)] xl:items-end">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Results summary</p>
                  <h3 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground">
                    {getResultsHeadline({
                      loading: isLoading,
                      error,
                      total,
                      activeFilters,
                    })}
                  </h3>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    课程卡片会把学习状态、进度、价格与课时规模放在同一视线里，减少来回进详情页确认信息的次数。
                  </p>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    当前结果策略
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(activeFilters.length ? activeFilters : ["全部课程"]).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-sm text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
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
