"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { QuestionnaireFilters } from "./filters";
import { Results } from "./results";
import { ResultsPagination } from "../common/results-pagination";
import {
  normalizeQuestionnaireError,
  QUESTIONNAIRE_PAGE_SIZE,
  questionnaireQueryOptions,
} from "@/core/questionnaire";
import type {
  QuestionnaireItem,
  QuestionnaireQueryState,
} from "@/core/questionnaire";

const createQueryString = (query: QuestionnaireQueryState) => {
  const params = new URLSearchParams();

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  if (query.keyword.trim()) {
    params.set("keyword", query.keyword.trim());
  }

  const result = params.toString();
  return result ? `?${result}` : "";
};

const getLoadedRange = (page: number, total: number) => {
  if (!total) {
    return "0-0";
  }

  const start = (page - 1) * QUESTIONNAIRE_PAGE_SIZE + 1;
  const end = Math.min(page * QUESTIONNAIRE_PAGE_SIZE, total);
  return `${start}-${end}`;
};

const summarizeQuestionnaires = (items: QuestionnaireItem[]) => {
  const categories = new Set(
    items.map((item) => item.category).filter((value) => value.trim())
  );
  const activeCount = items.filter(
    (item) => !item.status || item.status === "可参与"
  ).length;

  return {
    categoryCount: categories.size,
    activeCount,
  };
};

export const QuestionnairePage = ({
  initialQuery,
}: {
  initialQuery: QuestionnaireQueryState;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const questionnaireQuery = useQuery(
    questionnaireQueryOptions.list(initialQuery)
  );
  const items = questionnaireQuery.data?.items ?? [];
  const total = questionnaireQuery.data?.total ?? 0;
  const error = questionnaireQuery.error
    ? normalizeQuestionnaireError(questionnaireQuery.error)
    : null;
  const isBusy = questionnaireQuery.isLoading || isPending;

  const navigate = (query: QuestionnaireQueryState) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(query)}`, {
        scroll: false,
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / QUESTIONNAIRE_PAGE_SIZE));
  const currentPage = Math.min(initialQuery.page, totalPages);
  const rangeLabel = getLoadedRange(initialQuery.page, total);
  const summary = summarizeQuestionnaires(items);

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <section className="relative overflow-hidden rounded-[34px] border border-border bg-card/85 p-6 shadow-sm">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-primary/5 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)]">
            <div className="grid gap-5">
              <div className="space-y-3">
                <Badge>Questionnaire</Badge>
                <div className="space-y-3">
                  <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    问卷入口从骨架列表升级为更清晰的任务面板
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    延续旧学员端的问卷搜索与分页结构，继续使用
                    <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                      POST /questionnaire/list
                    </code>
                    读取真实数据，同时把搜索上下文、当前结果范围和页面状态前置到首屏。
                  </p>
                </div>
              </div>
              <MotionStagger className="grid gap-3 sm:grid-cols-3" delayChildren={0.08}>
                {[
                  { label: "分页规模", value: `${QUESTIONNAIRE_PAGE_SIZE} 条/页` },
                  { label: "当前关键字", value: initialQuery.keyword || "全部问卷" },
                  {
                    label: "结果状态",
                    value: error
                      ? "接口异常"
                      : questionnaireQuery.isLoading
                        ? "加载中"
                        : `${total} 条`,
                  },
                ].map((item) => (
                  <MotionItem key={item.label}>
                    <div className="rounded-[24px] border border-border/70 bg-background/80 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </MotionItem>
                ))}
              </MotionStagger>
            </div>

            <MotionReveal
              direction="up"
              delay={0.04}
              className="rounded-[30px] border border-border/70 bg-background/80 p-5"
            >
              <div className="space-y-5" data-testid="questionnaire-command-board">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    当前视图
                  </p>
                  <h3 className="text-xl font-semibold text-foreground">
                    结果范围 {rangeLabel}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    当前第 {currentPage} 页，首屏同步展示可参与数量、分类覆盖和查询语境，减少空翻页与反复试错。
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-border/70 bg-card/90 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      可参与问卷
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {summary.activeCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-border/70 bg-card/90 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      当前分类
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {summary.categoryCount}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-border/70 bg-card/90 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      数据来源
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      实时接口列表
                    </p>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>
      </MotionReveal>

      <section
        data-testid="questionnaire-search-section"
        className="rounded-[30px] border border-border bg-card/90 p-5 shadow-sm"
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Search
              </p>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-foreground">快速筛出目标问卷</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  桌面端保持横向筛选结构，让关键词输入、提交和重置动作处于同一操作节奏。
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">
                关键词：{initialQuery.keyword || "未筛选"}
              </span>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1.5">
                页码：{currentPage}
              </span>
            </div>
          </div>
          <QuestionnaireFilters
            key={`${initialQuery.keyword}:${initialQuery.page}`}
            defaultValues={initialQuery}
            pending={isPending}
            onSubmit={(values) => navigate(values)}
            onReset={() =>
              navigate({
                page: 1,
                keyword: "",
              })
            }
          />
        </div>
      </section>

      <section data-testid="questionnaire-results-section" className="grid gap-4">
        <div
          className="flex flex-col gap-3 rounded-[28px] border border-border/70 bg-card/75 px-5 py-4 sm:flex-row sm:items-end sm:justify-between"
          data-testid="questionnaire-results-header"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Results
            </p>
            <h3 className="text-xl font-semibold text-foreground">
              {error
                ? "当前结果暂不可用"
                : questionnaireQuery.isLoading
                  ? "正在整理问卷列表"
                  : `已展示 ${Math.min(items.length, QUESTIONNAIRE_PAGE_SIZE)} 份问卷`}
            </h3>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {initialQuery.keyword
              ? `当前按“${initialQuery.keyword}”筛选；如果结果偏少，可以直接清空关键词查看全部问卷。`
              : "未输入关键词时默认展示全部问卷，并保留真实接口的分页与错误兜底状态。"}
          </p>
        </div>
        <Results
          items={items}
          loading={isBusy}
          error={error}
          keyword={initialQuery.keyword}
          onRetry={() => {
            void questionnaireQuery.refetch();
          }}
        />
      </section>

      <ResultsPagination
        page={currentPage}
        pageCount={totalPages}
        total={total}
        pending={isPending}
        itemLabel="份问卷"
        onPageChange={(page) =>
          navigate({
            page,
            keyword: initialQuery.keyword,
          })
        }
      />
    </div>
  );
};
