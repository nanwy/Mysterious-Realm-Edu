import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
              className="rounded-[1.45rem] border border-border/80 bg-card/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur"
            >
              <div className="flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <span className="rounded-[1rem] border border-border/70 bg-muted/70 p-3 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                      Workspace Section
                    </p>
                    <h2 className="font-heading text-[1.35rem] font-black tracking-[-0.04em] text-foreground">
                      {group.title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>
                <div className="rounded-[1rem] border border-border/70 bg-background/60 px-4 py-3 text-xs leading-6 text-muted-foreground">
                  当前可用入口：{group.items.length}
                </div>
              </div>

              <MotionStagger className="mt-5 grid gap-4 md:grid-cols-2" delayChildren={0.05}>
                {group.items.map((item) => (
                  <MotionItem key={item.title}>
                    <article className="group flex h-full flex-col rounded-[1.2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.92))] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/35 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(15,23,42,0.88))]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/75">
                            Destination
                          </p>
                          <p className="mt-2 text-[1.05rem] font-black tracking-[-0.03em] text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <span className="rounded-full border border-border/70 bg-muted/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary/75">
                          {group.title}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            Destination Path
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold tracking-[-0.02em] text-foreground/80">
                            {item.routeLabel}
                          </p>
                        </div>
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                          进入页面
                          <ArrowRight className="size-4" />
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
