"use client";

import { useForm } from "@tanstack/react-form";
import { Button, Field, FieldLabel, Input } from "@workspace/ui";
import { Search } from "lucide-react";
import type { PracticeRecordsFilterValues } from "@/core/practice-records";

export const PracticeRecordsFilters = ({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: PracticeRecordsFilterValues;
  pending: boolean;
  onSubmit: (value: PracticeRecordsFilterValues) => void;
  onReset: () => void;
}) => {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        repositoryName: value.repositoryName.trim(),
        practiceName: value.practiceName.trim(),
      });
    },
  });

  return (
    <section data-testid="practice-records-filter-section">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] xl:items-end">
          <form.Field name="repositoryName">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="practice-records-repository-name">题库名称</FieldLabel>
                <Input
                  id="practice-records-repository-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入题库名称，定位训练记录"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="practiceName">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="practice-records-practice-name">练习模式</FieldLabel>
                <Input
                  id="practice-records-practice-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="输入练习模式，筛出专项训练"
                />
              </Field>
            )}
          </form.Field>

          <div className="flex items-end">
            <Button type="submit" size="lg" disabled={pending}>
              <Search className="size-4" />
              查询记录
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
        </div>
      </form>
    </section>
  );
};
