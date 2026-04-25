"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Button, Field, FieldGroup, FieldLabel, Input } from "@workspace/ui";
import { useEffect, useState } from "react";
import { newsQueryOptions, normalizeNewsError } from "@/core/news";

const useDebouncedValue = <Value,>(value: Value, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
};

export const NewsFilters = ({
  defaultKeyword,
  pending,
  onSubmit,
  onReset,
}: {
  defaultKeyword: string;
  pending: boolean;
  onSubmit: (keyword: string) => void;
  onReset: () => void;
}) => {
  const [keywordInput, setKeywordInput] = useState(defaultKeyword);
  const debouncedKeyword = useDebouncedValue(keywordInput, 300);
  const suggestionsQuery = useQuery(
    newsQueryOptions.suggestions(debouncedKeyword)
  );
  const suggestions = suggestionsQuery.data ?? [];
  const suggestionsError = suggestionsQuery.error
    ? normalizeNewsError(suggestionsQuery.error)
    : null;
  const form = useForm({
    defaultValues: {
      keyword: defaultKeyword,
    },
    onSubmit: ({ value }) => {
      onSubmit(value.keyword.trim());
    },
  });

  return (
    <section
      data-testid="news-search-section"
      className="rounded-[32px] border border-border bg-card/90 p-5 shadow-sm"
    >
      <div className="grid gap-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            搜索区
          </p>
          <h2 className="text-2xl font-semibold text-foreground">资讯检索工作台</h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            搜索区改成横向检索工作台，用户可以直接输入标题关键词、查看即时建议，再跳到目标文章。
          </p>
        </div>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <FieldGroup className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">
            <form.Field name="keyword">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="news-keyword">关键词搜索</FieldLabel>
                  <Input
                    id="news-keyword"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setKeywordInput(event.target.value);
                    }}
                    placeholder="输入资讯标题、关键词"
                  />
                </Field>
              )}
            </form.Field>

            <div className="flex items-end">
              <Button type="submit" size="lg" disabled={pending}>
                搜索资讯
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={pending}
                onClick={onReset}
              >
                重置
              </Button>
            </div>
          </FieldGroup>
        </form>

        <div className="grid gap-3 rounded-[24px] border border-dashed border-border bg-background/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">搜索建议</p>
              <p className="mt-1 text-sm text-muted-foreground">
                输入后优先返回可直达的资讯入口，减少从结果区反复筛找。
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {suggestionsQuery.isFetching ? "搜索建议加载中" : `${suggestions.length} 条建议`}
            </p>
          </div>

          {suggestionsError ? (
            <p className="text-sm leading-6 text-destructive">{suggestionsError}</p>
          ) : suggestions.length ? (
            <MotionStagger className="grid gap-3 lg:grid-cols-2" delayChildren={0.04}>
              {suggestions.map((item) => (
                <MotionItem key={item.id}>
                  <a
                    href={item.href}
                    className="block rounded-[20px] border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                  >
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {item.summary}
                    </p>
                  </a>
                </MotionItem>
              ))}
            </MotionStagger>
          ) : (
            <MotionReveal direction="up">
              <p className="text-sm leading-6 text-muted-foreground">
                输入关键词后，这里会展示快速命中的资讯建议。
              </p>
            </MotionReveal>
          )}
        </div>
      </div>
    </section>
  );
};

