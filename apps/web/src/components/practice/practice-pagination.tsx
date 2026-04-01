"use client";

import { Button } from "@workspace/ui";

export function PracticePagination({
  page,
  pageCount,
  total,
  pending,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pending: boolean;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/90 p-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        共 <span className="font-semibold text-foreground">{total}</span> 条结果，当前第{" "}
        <span className="font-semibold text-foreground">{page}</span> / {pageCount} 页
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={page <= 1 || pending}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </Button>
        {pages.map((item) => (
          <Button
            key={item}
            type="button"
            variant={item === page ? "default" : "outline"}
            className="min-w-10 rounded-xl"
            disabled={pending}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={page >= pageCount || pending}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
