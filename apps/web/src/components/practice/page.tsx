"use client";

import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { PracticeFilters } from "./filters";
import { RepositoryList } from "./repository-list";
import { ResultsPagination } from "../common/results-pagination";
import {
  normalizePracticeError,
  PRACTICE_PAGE_SIZE,
  practiceQueryOptions,
} from "@/core/practice";
import type { PracticeQueryState } from "@/core/practice";

const createQueryString = (query: PracticeQueryState) => {
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

export const PracticePage = ({
  initialQuery,
}: {
  initialQuery: PracticeQueryState;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const practiceQuery = useQuery(practiceQueryOptions.list(initialQuery));
  const items = practiceQuery.data?.items ?? [];
  const total = practiceQuery.data?.total ?? 0;
  const error = practiceQuery.error
    ? normalizePracticeError(practiceQuery.error)
    : null;
  const isBusy = practiceQuery.isLoading || isPending;

  const navigate = (query: PracticeQueryState) => {
    startTransition(() => {
      router.push(`${pathname}${createQueryString(query)}`, {
        scroll: false,
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PRACTICE_PAGE_SIZE));
  const currentPage = Math.min(initialQuery.page, totalPages);

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <section className="rounded-[32px] border border-border bg-card/80 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="rounded-full">Practice</Badge>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  练习仓库列表
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  迁移旧 Vue 练习仓库页的搜索、列表与分页结构，继续使用
                  <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                    POST /repository/list
                  </code>
                  读取真实数据。
                </p>
              </div>
            </div>
            <MotionStagger
              className="grid gap-3 sm:grid-cols-3"
              delayChildren={0.08}
            >
              {[
                { label: "分页规模", value: `${PRACTICE_PAGE_SIZE} 条/页` },
                { label: "当前关键字", value: initialQuery.keyword || "全部题库" },
                {
                  label: "结果状态",
                  value: error
                    ? "接口异常"
                    : practiceQuery.isLoading
                      ? "加载中"
                      : `${total} 条`,
                },
              ].map((item) => (
                <MotionItem key={item.label}>
                  <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
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
        </section>
      </MotionReveal>

      <PracticeFilters
        key={initialQuery.keyword}
        defaultKeyword={initialQuery.keyword}
        pending={isPending}
        onSubmit={(keyword) => navigate({ page: 1, keyword })}
        onReset={() => {
          navigate({ page: 1, keyword: "" });
        }}
      />

      <RepositoryList
        items={items}
        loading={isBusy}
        error={error}
        keyword={initialQuery.keyword}
        onRetry={() => {
          void practiceQuery.refetch();
        }}
      />

      <ResultsPagination
        page={currentPage}
        pageCount={totalPages}
        total={total}
        pending={isPending}
        itemLabel="条结果"
        onPageChange={(page) => navigate({ page, keyword: initialQuery.keyword })}
      />
    </div>
  );
};
