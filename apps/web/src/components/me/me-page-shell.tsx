"use client";

import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { MotionReveal } from "@workspace/motion";
import { SurfaceCard } from "@workspace/ui";
import { MeNavigation } from "./me-navigation";
import { type MeEntryGroup, ME_ENTRY_GROUPS } from "./me-data";
import { MeSectionGrid } from "./me-section-grid";

function findGroups(groupIds: string[]) {
  return groupIds
    .map((groupId) => ME_ENTRY_GROUPS.find((group) => group.id === groupId))
    .filter((group): group is MeEntryGroup => group !== undefined);
}

export function MePageShell() {
  const priorityGroups = findGroups(["my-courses", "my-exams", "course-study", "message-center"]);

  const supportGroups = findGroups(["basic-settings", "my-orders", "certificates"]);

  return (
    <div className="grid gap-6 lg:gap-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_320px]" data-testid="me-portal-hero">
        <MotionReveal direction="up">
          <section className="overflow-hidden rounded-[32px] border border-border/80 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(15,23,42,0.02))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(15,23,42,0.82))]">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    Student Portal
                  </div>
                  <div className="grid gap-3">
                    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                      先确认你的学习状态，再继续课程、考试与消息处理。
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                      这里把个人资料、课程学习、考试安排、订单服务和消息提醒收进同一入口门户，让你进入页面时先看到当前该处理的事，再展开全部分区。
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2" data-testid="me-priority-actions">
                  {priorityGroups.map((group, index) => {
                    const Icon = group.icon;
                    const primaryItem = group.items[0];

                    return (
                      <MotionReveal key={group.id} direction="up" delay={index * 0.05}>
                        <Link
                          href={primaryItem.href}
                          className="group flex h-full flex-col justify-between rounded-[28px] border border-border/70 bg-background/80 p-5 transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid gap-2">
                              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                                <Icon className="size-3.5 text-primary" />
                                {group.title}
                              </span>
                              <div>
                                <p className="text-lg font-semibold text-foreground">
                                  {primaryItem.title}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                  {primaryItem.description}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                          </div>
                          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                            <span>进入 {primaryItem.routeLabel}</span>
                            <span>{group.items.length} 个相关入口</span>
                          </div>
                        </Link>
                      </MotionReveal>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] border border-border/70 bg-background/75 p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl border border-border/70 bg-muted/70 p-3 text-primary">
                      <Compass className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">页面主用途</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        快速继续学习，并集中查看考试、资料与服务入口。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[28px] border border-border/70 bg-background/60 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">常用分区</p>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        把高频服务放在首屏右侧，移动端则在主内容之后顺序承接。
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground">
                      {ME_ENTRY_GROUPS.length} 个分区
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {supportGroups.map((group) => {
                      const primaryItem = group.items[0];

                      return (
                        <Link
                          key={group.id}
                          href={primaryItem.href}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition hover:border-primary/35 hover:bg-accent/50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{group.title}</p>
                            <p className="mt-1 text-xs leading-6 text-muted-foreground">
                              {group.description}
                            </p>
                          </div>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </MotionReveal>

        <MotionReveal direction="up" delay={0.06}>
          <SurfaceCard
            eyebrow="Navigation"
            title="个人中心导航"
            description="保留完整旧站分组，桌面端作为门户地图固定在右侧，移动端按阅读顺序自然下接。"
          >
            <MeNavigation groups={ME_ENTRY_GROUPS} />
          </SurfaceCard>
        </MotionReveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" data-testid="me-layout">
        <MotionReveal direction="up" delay={0.08}>
          <SurfaceCard
            eyebrow="All Sections"
            title="全部入口分区"
            description="继续保留旧站个人中心的信息架构，但把它放到首屏任务之后，形成从“先处理什么”到“还有哪些入口”的稳定阅读路径。"
          >
            <MeSectionGrid groups={ME_ENTRY_GROUPS} />
          </SurfaceCard>
        </MotionReveal>

        <MotionReveal direction="up" delay={0.1}>
          <aside className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[28px] border border-border/80 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-sm font-semibold text-foreground">阅读顺序</p>
              <div className="mt-4 grid gap-3">
                {[
                  "先从课程、考试、学习进度和消息入口继续当下任务。",
                  "再用右侧导航快速跳到订单、证书或资料设置等低频分区。",
                  "所有分组保持可访问，避免迁移期丢失旧站路径。",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm leading-7 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </MotionReveal>
      </div>
    </div>
  );
}
