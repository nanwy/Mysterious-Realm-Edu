import Link from "next/link";
import type { ReactNode } from "react";

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
          : "flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
      }
    >
      <div className={compact ? "max-w-xl space-y-2" : "max-w-2xl space-y-3"}>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary dark:text-sky-300">
          {eyebrow}
        </p>
        <h2
          className={
            compact
              ? "font-heading text-[clamp(2rem,3vw,2.9rem)] font-black tracking-[-0.06em] text-foreground"
              : "font-heading text-[clamp(2.3rem,3.8vw,3.8rem)] font-black tracking-[-0.07em] text-foreground"
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
          className="inline-flex items-center gap-2 self-start rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm font-bold text-primary transition-colors hover:border-primary/20 hover:bg-muted dark:border-white/10 dark:bg-white/5 dark:text-sky-300"
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
    <div className="rounded-[1rem] border border-primary/15 bg-[linear-gradient(180deg,rgba(79,70,255,0.06),rgba(79,70,255,0.02))] px-4 py-3 text-xs text-muted-foreground dark:border-sky-400/20 dark:bg-sky-400/5 dark:text-slate-300">
      <div className="font-bold uppercase tracking-[0.16em] text-primary dark:text-sky-300">
        内容同步中
      </div>
      <div className="mt-1 font-medium">
        当前模块暂未拿到实时数据，已切换到占位展示。{message}
      </div>
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
