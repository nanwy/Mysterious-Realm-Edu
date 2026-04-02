"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Button, Field, FieldLabel, Input } from "@workspace/ui";
import type { QuestionnaireQueryState } from "./questionnaire-types";

export function QuestionnaireSearchForm({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: QuestionnaireQueryState;
  pending: boolean;
  onSubmit: (values: QuestionnaireQueryState) => void;
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
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="keyword">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="questionnaire-keyword">关键词搜索</FieldLabel>
            <Input
              id="questionnaire-keyword"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="输入问卷名称"
            />
          </Field>
        )}
      </form.Field>

      <div className="flex flex-wrap gap-3 lg:self-end">
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
            });
            onReset();
          }}
        >
          重置
        </Button>
      </div>
    </form>
  );
}
