import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";

export function StudentShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_30%),linear-gradient(180deg,var(--background)_0%,var(--muted)_100%)]">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-border/70 bg-[linear-gradient(135deg,var(--card),var(--accent))] px-6 py-8 shadow-[0_36px_120px_rgba(15,23,42,0.12)] sm:px-8 lg:px-10">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.28em]">
            Student Portal
          </p>
          <h1 className="text-foreground mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-8">{description}</p>
        </section>
        {children}
      </main>
    </div>
  );
}
