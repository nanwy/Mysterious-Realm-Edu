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
import { Search, RotateCcw, Database } from "lucide-react";

type PassedFilter = "" | "1" | "0";

interface ScoreFiltersState {
  examTitle: string;
  passed: PassedFilter;
  pageNo: number;
  pageSize: number;
}

const passedFilterItems = [
  { label: "全部成绩", value: "" },
  { label: "已通过考试", value: "1" },
  { label: "未通过考试", value: "0" },
];

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
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px_auto] items-end gap-x-0">
        {/* 考试关键词检索 */}
        <form.Field name="examTitle">
          {(field) => (
            <div className="flex flex-col border-r border-border/10 md:pr-12 last:border-0 relative">
              <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <div className="w-1 h-2 bg-primary" />
                关键词搜索 // KEYWORD
              </label>
              <div className="relative group">
                <Input
                  id="scores-exam-title"
                  className="border-0 bg-transparent rounded-none px-0 text-xl font-bold placeholder:text-muted-foreground/10 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                  placeholder="输入考试名称关键词..."
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    onChange({
                      ...form.state.values,
                      examTitle: e.target.value,
                    });
                  }}
                />
                <div className="absolute bottom-0 left-0 right-12 h-[2px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left" />
                <div className="absolute bottom-0 left-0 right-12 h-[1px] bg-border/20" />
              </div>
            </div>
          )}
        </form.Field>

        {/* 考试状态筛选 */}
        <form.Field name="passed">
          {(field) => (
            <div className="flex flex-col border-r border-border/10 md:px-12 last:border-0 pt-10 md:pt-0">
              <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <div className="w-1 h-2 bg-primary/40" />
                成绩状态 // STATUS
              </label>
              <Select
                items={passedFilterItems}
                value={field.state.value}
                onValueChange={(val) => {
                  field.handleChange(val as PassedFilter);
                  onChange({
                    ...form.state.values,
                    passed: val as PassedFilter,
                  });
                }}
              >
                <SelectTrigger className="h-16 border-0 w-full bg-transparent rounded-none px-0 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="全部成绩" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/40">
                  <SelectGroup>
                    <SelectLabel className="px-4 py-2 border-b border-border/10 text-[9px] font-mono font-black uppercase opacity-30">
                      FILTER_OPTIONS
                    </SelectLabel>
                    {passedFilterItems.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="py-3 px-4 focus:bg-primary/5"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="h-[1px] bg-border/20" />
            </div>
          )}
        </form.Field>

        {/* 搜索指令 */}
        <div className="flex items-center gap-6 md:pl-12 pt-10 md:pt-0">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-16 px-12 rounded-none bg-foreground text-background font-black uppercase tracking-[0.2em] hover:bg-primary transition-all relative overflow-hidden group shadow-2xl"
          >
            {/* 物理反馈光条 */}
            <div className="absolute inset-x-0 h-full top-0 bg-white/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Search className="size-4 mr-3" />
            立即查询 // SEARCH
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset({
                examTitle: "",
                passed: "",
                pageNo: 1,
                pageSize: filters.pageSize,
              });
              onReset();
            }}
            className="h-16 px-6 rounded-none border border-border/10 uppercase font-mono text-[10px] tracking-widest hover:bg-muted"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
