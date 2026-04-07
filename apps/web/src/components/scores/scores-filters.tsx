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
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_220px_auto] xl:items-end">
        <form.Field name="examTitle">
          {(field) => (
            <Field className="gap-2">
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
                placeholder="输入考试名称，快速锁定对应成绩"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="passed">
          {(field) => (
            <Field className="gap-2">
              <FieldLabel htmlFor="scores-passed">是否通过</FieldLabel>
              <Select
                items={[
                  { value: "", label: "全部" },
                  { value: "1", label: "通过" },
                  { value: "0", label: "未通过" },
                ]}
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
                <SelectTrigger id="scores-passed">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>是否通过</SelectLabel>
                    <SelectItem value="">全部</SelectItem>
                    <SelectItem value="1">通过</SelectItem>
                    <SelectItem value="0">未通过</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <div className="flex flex-wrap gap-3 xl:justify-end">
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
