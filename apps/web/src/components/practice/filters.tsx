"use client";

import { Button, Input } from "@workspace/ui";
import { RotateCcw, Search } from "lucide-react";
import { type FormEvent, useState } from "react";

export const PracticeFilters = ({
  defaultKeyword,
  pending,
  onSubmit,
  onReset,
}: {
  defaultKeyword: string;
  pending: boolean;
  onSubmit: (keyword: string) => void;
  onReset: () => void;
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(keyword.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-3xl border border-border bg-card/95 p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto_auto]"
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">搜索题库</span>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
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
};
