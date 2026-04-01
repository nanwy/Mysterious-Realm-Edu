import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import {
  meNavigationGroups,
  meOverviewBadge,
  meOverviewHighlights,
  meOverviewStats,
} from "./me-navigation";

export function MePageShell() {
  const OverviewIcon = meOverviewBadge.icon;

  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <section
          className="overflow-hidden rounded-[32px] border border-border bg-card/85 p-6 shadow-sm"
          data-testid="me-overview-section"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
            <div className="space-y-4">
              <Badge className="rounded-full">{meOverviewBadge.label}</Badge>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <OverviewIcon className="size-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">{meOverviewBadge.title}</h2>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {meOverviewBadge.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {meOverviewStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-background/65 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">迁移说明</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                {meOverviewHighlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 size-2 rounded-full bg-primary/70" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </MotionReveal>

      <MotionStagger className="grid gap-6 xl:grid-cols-2" delayChildren={0.08}>
        {meNavigationGroups.map((group) => (
          <MotionItem key={group.id}>
            <section className="h-full rounded-[32px] border border-border bg-card/90 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Navigation
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{group.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                  {group.items.length} 项
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center justify-between gap-4 rounded-[24px] border border-border/70 bg-background/70 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <ItemIcon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  );
                })}
              </div>
            </section>
          </MotionItem>
        ))}
      </MotionStagger>
    </div>
  );
}
