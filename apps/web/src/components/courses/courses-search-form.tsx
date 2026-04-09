"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import type { CourseCategoryOption, CourseQueryState } from "./courses-types";

const ORDER_BY_OPTIONS = [
  { value: "", label: "综合排序" },
  { value: "1", label: "最新上架" },
  { value: "2", label: "学习热度" },
  { value: "3", label: "价格优先" },
];

export function CoursesSearchForm({
  defaultValues,
  categoryOptions,
  pending,
  activeFilters,
  onSubmit,
  onReset,
}: {
  defaultValues: CourseQueryState;
  categoryOptions: CourseCategoryOption[];
  pending: boolean;
  activeFilters: string[];
  onSubmit: (values: CourseQueryState) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        ...value,
        page: 1,
        keyword: value.keyword?.trim(),
      });
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <section
      data-testid="courses-filter-section"
      className="rounded-[32px] border border-border bg-card/90 p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Course filters
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            缩小范围后再进入课程
          </h3>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            关键词适合找具体课程，分类适合快速浏览专题，排序适合在新课与热度之间切换。
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
          {pending
            ? "筛选条件更新中..."
            : "修改任一条件后点击查询，结果会保持在当前页面内刷新。"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)]">
        <div className="rounded-[24px] border border-border/70 bg-background/72 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            当前已生效的筛选
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(activeFilters.length ? activeFilters : ["全部课程"]).map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-sm text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-background/72 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            快速建议
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            找具体课程时优先输入关键词；做第一次扫读时先切分类，再根据热度或上新排序决定进入顺序。
          </p>
        </div>
      </div>

      <form
        className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_220px_220px_auto] xl:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="grid grid-cols-subgrid gap-4 xl:col-span-4 xl:grid-cols-3 xl:items-end">
          <form.Field name="keyword">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="courses-keyword">关键词搜索</FieldLabel>
                <Input
                  id="courses-keyword"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入课程名、讲师名等关键词"
                  className="rounded-2xl border-border bg-background px-4"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="orderByType">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="courses-order-by">排序方式</FieldLabel>
                <Select
                  items={ORDER_BY_OPTIONS}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger
                    id="courses-order-by"
                    className="bg-background"
                  >
                    <SelectValue placeholder="综合排序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>排序方式</SelectLabel>
                      {ORDER_BY_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value || "all"}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          <form.Field name="categoryId">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="courses-category">课程分类</FieldLabel>
                <Select
                  items={categoryOptions}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger
                    id="courses-category"
                    className="bg-background"
                  >
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>课程分类</SelectLabel>
                      {categoryOptions.map((option) => (
                        <SelectItem
                          key={option.value || "all"}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Button
              size="lg"
              type="submit"
              disabled={pending}
              className="min-w-24 rounded-2xl"
            >
              查询
            </Button>
            <Button
              size="lg"
              type="button"
              variant="outline"
              disabled={pending}
              className="min-w-24 rounded-2xl"
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
        </FieldGroup>
      </form>
    </section>
  );
}
