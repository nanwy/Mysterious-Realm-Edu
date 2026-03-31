import type { ReactNode } from "react";
import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          : "flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      }
    >
      <div className={compact ? "max-w-xl space-y-2" : "max-w-2xl space-y-3"}>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-sky-300">
          {eyebrow}
        </p>
        <h2
          className={
            compact
              ? "text-2xl font-extrabold tracking-tight text-foreground sm:text-[2rem]"
              : "text-2xl font-extrabold tracking-tight text-foreground"
          }
        >
          {title}
        </h2>
        <p
          className={
            compact
              ? "max-w-md text-sm font-medium leading-relaxed text-muted-foreground"
              : "max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground"
          }
        >
          {subtitle}
        </p>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 self-start text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-sky-300"
        >
          查看全部
          <span aria-hidden="true" className="text-base leading-none">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function HomeSection({
  eyebrow,
  title,
  subtitle,
  href,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="grid gap-6">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        href={href}
        compact={compact}
      />
      {children}
    </section>
  );
}

export function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      接口暂未连通：{message}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-4 shadow-[0_16px_40px_rgba(91,75,255,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_16px_50px_rgba(2,6,23,0.3)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}
