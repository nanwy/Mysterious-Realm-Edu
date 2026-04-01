"use client";

import { Button, Input } from "@workspace/ui";
import { Search, RotateCcw } from "lucide-react";
import type { FormEvent } from "react";

export function PracticeSearchForm({
  value,
  pending,
  onValueChange,
  onSubmit,
  onReset,
}: {
  value: string;
  pending: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-3xl border border-border bg-card/95 p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto_auto]"
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">搜索题库</span>
        <Input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="输入题库名称或关键字"
          className="h-11 rounded-2xl border-border bg-background px-4"
        />
      </label>
      <Button
        type="submit"
        size="lg"
        className="mt-auto h-11 rounded-2xl"
        disabled={pending}
      >
        <Search className="size-4" />
        搜索
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="mt-auto h-11 rounded-2xl"
        onClick={onReset}
        disabled={pending}
      >
        <RotateCcw className="size-4" />
        重置
      </Button>
    </form>
  );
}
