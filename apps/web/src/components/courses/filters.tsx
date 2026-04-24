"use client";

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
import {
  COURSE_ORDER_BY,
  COURSE_ORDER_BY_OPTIONS,
  type CourseCategoryOption,
  type CourseFormValues,
} from "@/core/courses";

export const CoursesFilters = ({
  defaultValues,
  categoryOptions,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: CourseFormValues;
  categoryOptions: CourseCategoryOption[];
  pending: boolean;
  onSubmit: (values: CourseFormValues) => void;
  onReset: () => void;
}) => {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        page: 1,
        keyword: value.keyword.trim(),
        orderBy: value.orderBy,
        categoryId: value.categoryId,
      });
    },
  });

  return (
    <section
      data-testid="courses-filter-section"
      className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
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

      <form
        className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_220px_220px_auto] xl:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="grid gap-4 xl:grid-cols-3 xl:col-span-4 grid-cols-subgrid  xl:items-end">
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

          <form.Field name="orderBy">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="courses-order-by">排序方式</FieldLabel>
                <Select
                  items={COURSE_ORDER_BY_OPTIONS}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as COURSE_ORDER_BY)
                  }
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
                      {COURSE_ORDER_BY_OPTIONS.map((option) => (
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
                  onValueChange={(value) => {
                    field.handleChange(value as string);
                  }}
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
                  orderBy: COURSE_ORDER_BY.DEFAULT,
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
};
