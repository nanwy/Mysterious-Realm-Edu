"use client";

import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ResultsPagination } from "../common/results-pagination";
import {
  fetchQuestionnaires,
  normalizeQuestionnaireError,
} from "./questionnaire-data";
import { QuestionnaireResults } from "./questionnaire-results";
import { QuestionnaireSearchForm } from "./questionnaire-search-form";
import {
  QUESTIONNAIRE_PAGE_SIZE,
  type QuestionnaireItem,
  type QuestionnaireQueryState,
} from "./questionnaire-types";

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

export function QuestionnairePageShell({
  initialPage,
  initialKeyword,
}: {
  initialPage: number;
  initialKeyword: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<QuestionnaireItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void fetchQuestionnaires({
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
        setError(normalizeQuestionnaireError(nextError));
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

  const navigate = (query: QuestionnaireQueryState) => {
    setIsPending(true);
    startTransition(() => {
      router.push(`${pathname}${createQueryString(query.page, query.keyword)}`, {
        scroll: false,
      });
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / QUESTIONNAIRE_PAGE_SIZE));

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <section className="rounded-[32px] border border-border bg-card/80 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge>Questionnaire</Badge>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  问卷列表
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  延续旧学员端的问卷搜索与分页结构，继续使用
                  <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                    POST /questionnaire/list
                  </code>
                  读取真实数据，并在接口不可用时保持可读错误态。
                </p>
              </div>
            </div>
            <MotionStagger
              className="grid gap-3 sm:grid-cols-3"
              delayChildren={0.08}
            >
              {[
                { label: "分页规模", value: `${QUESTIONNAIRE_PAGE_SIZE} 条/页` },
                { label: "当前关键字", value: initialKeyword || "全部问卷" },
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

      <section
        data-testid="questionnaire-search-section"
        className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
      >
        <QuestionnaireSearchForm
          defaultValues={{
            page: initialPage,
            keyword: initialKeyword,
          }}
          pending={isPending}
          onSubmit={(values) => navigate(values)}
          onReset={() =>
            navigate({
              page: 1,
              keyword: "",
            })
          }
        />
      </section>

      <section data-testid="questionnaire-results-section">
        <QuestionnaireResults
          items={items}
          loading={isLoading}
          error={error}
          keyword={initialKeyword}
          onRetry={() => {
            setIsPending(false);
            setReloadVersion((value) => value + 1);
          }}
        />
      </section>

      <ResultsPagination
        page={Math.min(initialPage, totalPages)}
        pageCount={totalPages}
        total={total}
        pending={isPending}
        itemLabel="份问卷"
        onPageChange={(page) =>
          navigate({
            page,
            keyword: initialKeyword,
          })
        }
      />
    </div>
  );
}
