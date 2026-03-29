import type { ReactNode } from "react";
import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href?: string;
}) {
  return (
    <div className="flex min-h-26 flex-col gap-4 md:flex-row md:items-start md:justify-between xl:min-h-30">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl">
          {title}
        </h2>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex h-8 min-w-30 shrink-0 items-center justify-center gap-2 self-start whitespace-nowrap rounded-full border border-sky-200/90 bg-white/90 px-4 text-sm font-medium text-slate-700 shadow-[0_12px_28px_rgba(59,130,246,0.08)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-[0_12px_28px_rgba(2,6,23,0.25)] dark:hover:border-sky-500 dark:hover:text-sky-300"
        >
          查看更多
          <span className="text-xs uppercase tracking-[0.18em] text-sky-500">View</span>
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
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        href={href}
      />
      {children}
    </section>
  );
}

export function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
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
    <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_16px_50px_rgba(59,130,246,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_16px_50px_rgba(2,6,23,0.3)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  );
}
