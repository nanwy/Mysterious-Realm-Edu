"use client";

import { Fragment } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui";

function getVisiblePages(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);

  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }

  if (page >= pageCount - 2) {
    pages.add(pageCount - 1);
    pages.add(pageCount - 2);
    pages.add(pageCount - 3);
  }

  return Array.from(pages)
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((left, right) => left - right);
}

export function ResultsPagination({
  page,
  pageCount,
  total,
  pending,
  itemLabel = "条结果",
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pending: boolean;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = getVisiblePages(page, pageCount);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/90 p-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        共 <span className="font-semibold text-foreground">{total}</span>{" "}
        {itemLabel}，当前第{" "}
        <span className="font-semibold text-foreground">{page}</span> /{" "}
        {pageCount} 页
      </p>
      <Pagination className="mx-0 w-auto justify-start md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              type="button"
              className={
                page <= 1 || pending
                  ? "cursor-not-allowed opacity-50 pointer-events-none"
                  : ""
              }
              onClick={() => onPageChange(page - 1)}
            />
          </PaginationItem>
          {pages.map((item, index) => {
            const previous = pages[index - 1];
            const showEllipsis = previous !== undefined && item - previous > 1;

            return (
              <Fragment key={item}>
                {showEllipsis ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}

                <PaginationItem>
                  <PaginationLink
                    type="button"
                    isActive={item === page}
                    className={
                      pending
                        ? "cursor-not-allowed opacity-50 pointer-events-none"
                        : ""
                    }
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              </Fragment>
            );
          })}
          <PaginationItem>
            <PaginationNext
              type="button"
              className={
                page >= pageCount || pending
                  ? "cursor-not-allowed opacity-50 pointer-events-none"
                  : ""
              }
              onClick={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
