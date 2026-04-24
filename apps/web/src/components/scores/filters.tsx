"use client";

import { useForm } from "@tanstack/react-form";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui";
import { RotateCcw, Search } from "lucide-react";
import {
  SCORE_PASS_OPTIONS,
  SCORE_PASS_STATE,
  type ScoreFiltersState,
  type ScorePassFilter,
} from "@/core/scores";

export const ScoresFilters = ({
  filters,
  isLoading,
  onQuery,
  onReset,
}: {
  filters: ScoreFiltersState;
  isLoading: boolean;
  onQuery: (filters: ScoreFiltersState) => void;
  onReset: () => void;
}) => {
  const form = useForm({
    defaultValues: filters,
    onSubmit: ({ value }) => {
      const nextFilters = {
        ...value,
        examTitle: value.examTitle.trim(),
        pageNo: 1,
      };
      onQuery(nextFilters);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="w-full"
    >
      <div className="grid grid-cols-1 items-end gap-x-0 md:grid-cols-[1fr_280px_auto]">
        <form.Field name="examTitle">
          {(field) => (
            <div className="relative flex flex-col border-r border-border/10 md:pr-12">
              <label className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
                <div className="h-2 w-1 bg-primary" />
                关键词搜索 // KEYWORD
              </label>
              <div className="group relative">
                <Input
                  id="scores-exam-title"
                  className="rounded-none border-0 bg-transparent px-0 text-xl font-bold transition-all placeholder:text-muted-foreground/10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="输入考试名称关键词..."
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                  }}
                />
                <div className="absolute bottom-0 left-0 right-12 h-[2px] origin-left scale-x-0 bg-primary transition-transform group-focus-within:scale-x-100" />
                <div className="absolute bottom-0 left-0 right-12 h-px bg-border/20" />
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="passed">
          {(field) => (
            <div className="flex flex-col border-r border-border/10 pt-10 md:px-12 md:pt-0">
              <label className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
                <div className="h-2 w-1 bg-primary/40" />
                成绩状态 // STATUS
              </label>
              <Select
                items={SCORE_PASS_OPTIONS}
                value={field.state.value}
                onValueChange={(value) => {
                  const passed = value as ScorePassFilter;
                  field.handleChange(passed);
                }}
              >
                <SelectTrigger className="h-16 w-full rounded-none border-0 bg-transparent px-0 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="全部成绩" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border/40">
                  <SelectGroup>
                    <SelectLabel className="border-b border-border/10 px-4 py-2 text-[9px] font-black uppercase opacity-30">
                      FILTER_OPTIONS
                    </SelectLabel>
                    {SCORE_PASS_OPTIONS.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="px-4 py-3 focus:bg-primary/5"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="h-px bg-border/20" />
            </div>
          )}
        </form.Field>

        <div className="flex items-center gap-6 pt-10 md:pl-12 md:pt-0">
          <Button
            type="submit"
            disabled={isLoading}
            className="group relative h-16 overflow-hidden rounded-none bg-foreground px-12 font-black uppercase tracking-[0.2em] text-background shadow-2xl transition-all hover:bg-primary"
          >
            <div className="absolute inset-x-0 top-0 h-full -translate-y-full bg-white/5 transition-transform duration-500 group-hover:translate-y-0" />
            <Search className="mr-3 size-4" />
            立即查询 // SEARCH
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset({
                examTitle: "",
                passed: SCORE_PASS_STATE.ALL,
                pageNo: 1,
                pageSize: filters.pageSize,
              });
              onReset();
            }}
            className="h-16 rounded-none border border-border/10 px-6 font-mono text-[10px] uppercase tracking-widest hover:bg-muted"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
