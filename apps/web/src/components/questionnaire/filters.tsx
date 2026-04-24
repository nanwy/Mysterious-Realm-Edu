"use client";

import { useForm } from "@tanstack/react-form";
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
} from "@workspace/ui";
import type { QuestionnaireQueryState } from "@/core/questionnaire";

export const QuestionnaireFilters = ({
  defaultValues,
  pending,
  onSubmit,
  onReset,
}: {
  defaultValues: QuestionnaireQueryState;
  pending: boolean;
  onSubmit: (values: QuestionnaireQueryState) => void;
  onReset: () => void;
}) => {
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

  return (
    <form
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="grid gap-4">
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
                placeholder="输入问卷名称、用途或调查主题"
              />
              <FieldDescription>
                支持按问卷标题模糊检索，提交后会自动回到第 1 页。
              </FieldDescription>
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      <div className="flex flex-wrap gap-3 xl:self-end xl:justify-end">
        <Button size="lg" type="submit" disabled={pending}>
          查询
        </Button>
        <Button
          size="lg"
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onReset}
        >
          重置
        </Button>
      </div>
    </form>
  );
};

