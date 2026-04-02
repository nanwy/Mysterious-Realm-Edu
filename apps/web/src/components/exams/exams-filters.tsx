"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Button, Field, FieldGroup, FieldLabel, Input } from "@workspace/ui";
import type { ExamFiltersState } from "./exams-types";

export function ExamsFilters({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: ExamFiltersState;
  pending: boolean;
  onSubmit: (values: ExamFiltersState) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        ...value,
        pageNo: 1,
        examTitle: value.examTitle.trim(),
      });
    },
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <section
      data-testid="exams-search-section"
      className="rounded-[28px] border border-border bg-card/90 p-5 shadow-sm"
    >
      <form
        className="flex flex-col gap-4 lg:flex-row lg:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="grid gap-4 xl:grid-cols-3 xl:col-span-4 grid-cols-subgrid  xl:items-end">
          <form.Field name="examTitle">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="exams-keyword">关键词搜索</FieldLabel>
                <Input
                  id="exams-keyword"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入考试名称搜索"
                />
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
                  ...defaultValues,
                  examTitle: "",
                  pageNo: 1,
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
