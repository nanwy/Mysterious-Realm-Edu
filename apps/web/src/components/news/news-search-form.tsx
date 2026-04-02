"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Button, Input } from "@workspace/ui";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import type { NewsSuggestionItem } from "./news-types";

export function NewsSearchForm({
  defaultKeyword,
  pending,
  suggestions,
  suggestionsLoading,
  suggestionsError,
  onKeywordChange,
  onSubmit,
  onReset,
}: {
  defaultKeyword: string;
  pending: boolean;
  suggestions: NewsSuggestionItem[];
  suggestionsLoading: boolean;
  suggestionsError: string | null;
  onKeywordChange: (value: string) => void;
  onSubmit: (keyword: string) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues: {
      keyword: defaultKeyword,
    },
    onSubmit: ({ value }) => {
      onSubmit(value.keyword.trim());
    },
  });

  useEffect(() => {
    form.reset({
      keyword: defaultKeyword,
    });
  }, [defaultKeyword, form]);

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
          <h2 className="text-2xl font-semibold text-foreground">按关键词承接旧版资讯搜索</h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            输入标题关键词后，会优先调用旧文章搜索接口；如果接口失败，页面会明确展示失败信息，而不是伪造结果。
          </p>
        </div>

        <form
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="keyword">
            {(field) => (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">关键词搜索</span>
                <Input
                  id="news-keyword"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                    onKeywordChange(event.target.value);
                  }}
                  placeholder="输入资讯标题、关键词"
                />
              </label>
            )}
          </form.Field>

          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              搜索资讯
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                form.reset({
                  keyword: "",
                });
                onKeywordChange("");
                onReset();
              }}
            >
              重置
            </Button>
          </div>
        </form>

        <div className="grid gap-3 rounded-[24px] border border-dashed border-border bg-background/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">搜索建议</p>
            <p className="text-xs text-muted-foreground">
              {suggestionsLoading ? "搜索建议加载中" : `${suggestions.length} 条建议`}
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
}
