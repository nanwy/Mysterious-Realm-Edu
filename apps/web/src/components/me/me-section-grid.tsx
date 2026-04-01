import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import type { MeEntryGroup } from "./me-data";

export function MeSectionGrid({ groups }: { groups: MeEntryGroup[] }) {
  return (
    <div className="grid gap-5" data-testid="me-section-grid">
      {groups.map((group, groupIndex) => {
        const Icon = group.icon;

        return (
          <MotionReveal key={group.id} direction="up" delay={groupIndex * 0.04}>
            <section
              id={group.id}
              className="rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur"
            >
              <div className="flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="rounded-2xl border border-border/70 bg-muted/70 p-3 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 px-4 py-3 text-xs leading-6 text-muted-foreground">
                  旧站入口数：{group.items.length}
                </div>
              </div>

              <MotionStagger className="mt-5 grid gap-4 md:grid-cols-2" delayChildren={0.05}>
                {group.items.map((item) => (
                  <MotionItem key={item.title}>
                    <article className="flex h-full flex-col rounded-3xl border border-border/70 bg-background/75 p-5 transition hover:border-primary/35 hover:bg-accent/50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-foreground">{item.title}</p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <span className="rounded-full border border-border/70 bg-muted/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                          入口卡片
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="rounded-xl border border-border/70 bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                          目标路由 {item.routeLabel}
                        </span>
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                        >
                          进入{item.title}
                        </Link>
                      </div>
                    </article>
                  </MotionItem>
                ))}
              </MotionStagger>
            </section>
          </MotionReveal>
        );
      })}
    </div>
  );
}
