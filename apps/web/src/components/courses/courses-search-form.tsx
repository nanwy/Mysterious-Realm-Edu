"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Button, Input } from "@workspace/ui";
import type { CourseCategoryOption, CourseQueryState } from "./courses-types";

export function CoursesSearchForm({
  defaultValues,
  categoryOptions,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: CourseQueryState;
  categoryOptions: CourseCategoryOption[];
  pending: boolean;
  onSubmit: (values: CourseQueryState) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        ...value,
        page: 1,
        keyword: value.keyword.trim(),
      });
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <section
      data-testid="courses-filter-section"
      className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
    >
      <form
        className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_220px_220px_auto] xl:items-end"
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
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="输入课程名、讲师名等关键词"
                className="h-11 rounded-2xl border-border bg-background px-4"
              />
            </label>
          )}
        </form.Field>

        <form.Field name="orderByType">
          {(field) => (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">排序方式</span>
              <select
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-11 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">综合排序</option>
                <option value="1">最新上架</option>
                <option value="2">学习热度</option>
                <option value="3">价格优先</option>
              </select>
            </label>
          )}
        </form.Field>

        <form.Field name="categoryId">
          {(field) => (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">课程分类</span>
              <select
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-11 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </form.Field>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" type="submit" disabled={pending}>
            查询
          </Button>
          <Button
            size="lg"
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              form.reset({
                page: 1,
                keyword: "",
                orderByType: "",
                categoryId: "",
              });
              onReset();
            }}
          >
            重置
          </Button>
        </div>
      </form>
    </section>
  );
}

