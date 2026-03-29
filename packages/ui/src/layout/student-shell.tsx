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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(180deg,_#f8fcff_0%,_#edf5ff_100%)]">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(233,247,255,0.9))] px-6 py-8 shadow-[0_36px_120px_rgba(15,23,42,0.12)] sm:px-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Student Portal
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
        </section>
        {children}
      </main>
    </div>
  );
}

