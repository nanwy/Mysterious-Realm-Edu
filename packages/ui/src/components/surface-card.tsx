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
    <section className="rounded-[28px] border border-border/80 bg-card/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
      {eyebrow ? (
        <p className="text-primary mb-3 text-xs font-semibold uppercase tracking-[0.28em]">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <h2 className="text-card-foreground text-2xl font-semibold">{title}</h2>
        {description ? <p className="text-muted-foreground max-w-2xl text-sm leading-7">{description}</p> : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
