import type { ReactNode } from "react";

export function SurfaceCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-7 text-slate-600">{description}</p> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

