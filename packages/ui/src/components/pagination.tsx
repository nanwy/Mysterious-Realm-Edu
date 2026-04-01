"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = ComponentProps<typeof Button> & {
  isActive?: boolean;
};

export function PaginationLink({
  className,
  isActive,
  size = "icon-sm",
  variant,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      size={size}
      variant={variant ?? (isActive ? "default" : "outline")}
      className={cn("rounded-xl", className)}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  size = "sm",
  children = "上一页",
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      size={size}
      className={cn("px-3", className)}
      {...props}
    >
      <ChevronLeft data-icon="inline-start" />
      {children}
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  size = "sm",
  children = "下一页",
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      data-slot="pagination-next"
      size={size}
      className={cn("px-3", className)}
      {...props}
    >
      {children}
      <ChevronRight data-icon="inline-end" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-7 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <MoreHorizontal />
      <span className="sr-only">More pages</span>
    </span>
  );
}
