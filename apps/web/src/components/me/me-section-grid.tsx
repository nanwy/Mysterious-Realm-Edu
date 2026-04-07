import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import type { MeEntryGroup } from "./me-data";

export function MeSectionGrid({ groups }: { groups: MeEntryGroup[] }) {
  return (
    <div className="grid gap-6" data-testid="me-section-grid">
      {groups.map((group, groupIndex) => {
        const Icon = group.icon;

        return (
          <MotionReveal key={group.id} direction="up" delay={groupIndex * 0.04}>
            <section
              id={group.id}
              className="overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_24px_70px_rgba(15,23,42,0.06)]"
            >
              <div className="border-b border-border/70 bg-muted/20 px-5 py-5 md:px-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex size-14 items-center justify-center rounded-[22px] border border-border/70 bg-background text-primary shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                      <Icon className="size-5" />
                    </span>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground/75">
                          Group {String(groupIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                          {group.items.length} 个入口
                        </span>
                      </div>
                      <h2 className="text-[1.4rem] font-semibold tracking-[-0.03em] text-foreground">
                        {group.title}
                      </h2>
                      <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                      Scan
                    </span>
                    <span>优先浏览标题，再进入对应子入口</span>
                  </div>
                </div>
              </div>

              <MotionStagger className="grid gap-px bg-border/70 md:grid-cols-2" delayChildren={0.05}>
                {group.items.map((item, itemIndex) => (
                  <MotionItem key={item.title}>
                    <article className="group flex h-full flex-col justify-between bg-background px-5 py-5 transition duration-300 hover:bg-accent/30 md:px-6">
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground/75">
                                Entry {String(itemIndex + 1).padStart(2, "0")}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                                <ArrowUpRight className="size-3" />
                                分组入口
                              </span>
                            </div>
                            <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                              {item.title}
                            </p>
                          </div>
                          <span className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground">
                            <ArrowRight className="size-4" />
                          </span>
                        </div>

                        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                          {item.description}
                        </p>

                        <div className="rounded-[20px] border border-dashed border-border/70 bg-muted/25 px-3.5 py-3">
                          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground/70">
                            Target Route
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">{item.routeLabel}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-3">
                        <div className="max-w-[14rem] text-xs leading-6 text-muted-foreground">
                          保留旧站锚点与分组结构，当前先提供静态入口说明。
                        </div>
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:translate-x-0.5 hover:opacity-90"
                        >
                          进入{item.title}
                          <ArrowUpRight className="size-4" />
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
