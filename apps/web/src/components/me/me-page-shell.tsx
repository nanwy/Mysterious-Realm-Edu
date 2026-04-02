"use client";

import { MotionReveal } from "@workspace/motion";
import { SurfaceCard } from "@workspace/ui";
import { MeNavigation } from "./me-navigation";
import { ME_ENTRY_GROUPS, ME_OVERVIEW_STATS } from "./me-data";
import { MeSectionGrid } from "./me-section-grid";

export function MePageShell() {
  return (
    <div className="grid gap-6">
      <MotionReveal direction="up">
        <SurfaceCard
          eyebrow="Profile Hub"
          title="学员中心入口总览"
          description="把旧 Vue 个人中心的菜单分组迁到 Next.js /me，先完整呈现信息架构与入口文案，再逐项补齐真实子路由和接口。"
        >
          <div className="grid gap-4 md:grid-cols-3" data-testid="me-overview-stats">
            {ME_OVERVIEW_STATS.map((item, index) => {
              const Icon = item.icon;

              return (
                <MotionReveal key={item.label} direction="up" delay={index * 0.05}>
                  <div className="rounded-[24px] border border-border/70 bg-muted/40 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                          {item.value}
                        </p>
                      </div>
                      <span className="rounded-2xl border border-border/70 bg-background/70 p-2 text-primary">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </SurfaceCard>
      </MotionReveal>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]" data-testid="me-layout">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <SurfaceCard
            eyebrow="Navigation"
            title="个人中心导航"
            description="桌面端保留左侧导航逻辑，移动端改为顶部堆叠卡片，便于快速定位对应分组。"
          >
            <MeNavigation groups={ME_ENTRY_GROUPS} />
          </SurfaceCard>
        </aside>

        <div className="grid gap-6">
          <SurfaceCard
            title="入口分组"
            description="以下入口卡片完整对应旧站个人中心信息架构；当前仅提供静态迁移结果和目标路由说明，不接真实接口。"
          >
            <MeSectionGrid groups={ME_ENTRY_GROUPS} />
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
