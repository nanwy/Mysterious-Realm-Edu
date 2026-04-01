"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ResultsPagination } from "../common/results-pagination";
import {
  fetchPracticeRepositories,
  normalizePracticeError,
} from "./practice-data";
import { PracticeRepositoryList } from "./practice-repository-list";
import { PracticeSearchForm } from "./practice-search-form";
import {
  PRACTICE_PAGE_SIZE,
  type PracticeRepositoryItem,
} from "./practice-types";

function createQueryString(page: number, keyword: string) {
  const query = new URLSearchParams();
  if (page > 1) {
    query.set("page", String(page));
  }
  if (keyword.trim()) {
    query.set("keyword", keyword.trim());
  }

  const result = query.toString();
  return result ? `?${result}` : "";
}

export function PracticePageShell({
  initialPage,
  initialKeyword,
}: {
  initialPage: number;
  initialKeyword: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [items, setItems] = useState<PracticeRepositoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchPracticeRepositories({
      page: initialPage,
      keyword: initialKeyword,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setItems(result.items);
        setTotal(result.total);
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }

        setItems([]);
        setTotal(0);
        setError(normalizePracticeError(nextError));
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
  }, [initialKeyword, initialPage, reloadVersion]);

  const navigate = (page: number, nextKeyword: string) => {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(page, nextKeyword)}`, {
        scroll: false,
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PRACTICE_PAGE_SIZE));

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
                { label: "当前关键字", value: initialKeyword || "全部题库" },
                {
                  label: "结果状态",
                  value: error
                    ? "接口异常"
                    : isLoading
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

      <PracticeSearchForm
        value={keyword}
        pending={isPending}
        onValueChange={setKeyword}
        onSubmit={() => navigate(1, keyword)}
        onReset={() => {
          setKeyword("");
          navigate(1, "");
        }}
      />

      <PracticeRepositoryList
        items={items}
        loading={isLoading}
        error={error}
        keyword={initialKeyword}
        onRetry={() => {
          setIsPending(false);
          setReloadVersion((value) => value + 1);
        }}
      />

      <ResultsPagination
        page={Math.min(initialPage, totalPages)}
        pageCount={totalPages}
        total={total}
        pending={isPending}
        itemLabel="条结果"
        onPageChange={(page: number) => navigate(page, initialKeyword)}
      />
    </div>
  );
}
