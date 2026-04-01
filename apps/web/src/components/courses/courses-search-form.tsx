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
      className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
    >
      <form
        className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_220px_220px_auto] xl:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_220px_220px_auto] xl:items-end">
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
                  className="h-11 rounded-2xl border-border bg-background px-4"
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
                    className="h-11 w-full rounded-2xl px-4"
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
                    className="h-11 w-full rounded-2xl px-4"
                  >
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>排序方式</SelectLabel>
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
        </FieldGroup>
      </form>
    </section>
  );
}
