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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";

type PassedFilter = "" | "1" | "0";

interface ScoreFiltersState {
  examTitle: string;
  passed: PassedFilter;
  pageNo: number;
  pageSize: number;
}

export function ScoresFilters({
  filters,
  isLoading,
  onChange,
  onQuery,
  onReset,
}: {
  filters: ScoreFiltersState;
  isLoading: boolean;
  onChange: (filters: ScoreFiltersState) => void;
  onQuery: (filters: ScoreFiltersState) => void;
  onReset: () => void;
}) {
  const form = useForm({
    defaultValues: filters,
    onSubmit: ({ value }) => {
      const nextFilters = {
        ...value,
        examTitle: value.examTitle.trim(),
        pageNo: 1,
      };

      onChange(nextFilters);
      onQuery(nextFilters);
    },
  });

  useEffect(() => {
    form.reset(filters);
  }, [filters, form]);

  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px_auto] lg:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="grid gap-4 lg:col-span-3 lg:grid-cols-subgrid lg:items-end">
        <form.Field name="examTitle">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="scores-exam-title">考试名称</FieldLabel>
              <Input
                id="scores-exam-title"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  const nextFilters = {
                    ...form.state.values,
                    examTitle: event.target.value,
                  };

                  field.handleChange(event.target.value);
                  onChange(nextFilters);
                }}
                placeholder="请输入考试名称"
                className="h-11 rounded-2xl border-border bg-background px-4"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="passed">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="scores-passed">是否通过</FieldLabel>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => {
                  const nextValue = value as PassedFilter;
                  const nextFilters = {
                    ...form.state.values,
                    passed: nextValue,
                  };

                  field.handleChange(nextValue);
                  onChange(nextFilters);
                }}
              >
                <SelectTrigger id="scores-passed" className="h-11 w-full rounded-2xl px-4">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="1">通过</SelectItem>
                  <SelectItem value="0">未通过</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" type="submit" disabled={isLoading}>
            查询
          </Button>
          <Button
            size="lg"
            type="button"
            variant="outline"
            onClick={() => {
              form.reset({
                examTitle: "",
                passed: "",
                pageNo: 1,
                pageSize: filters.pageSize,
              });
              onReset();
            }}
            disabled={isLoading}
          >
            清空
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
