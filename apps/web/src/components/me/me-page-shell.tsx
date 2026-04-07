"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { MotionReveal } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { MeNavigation } from "./me-navigation";
import { ME_ENTRY_GROUPS } from "./me-data";
import { MeSectionGrid } from "./me-section-grid";
import {
  ArrowRight,
  BellDot,
  BookOpen,
  ClipboardList,
  Play,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function WorkspaceSignal({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1rem] border border-border/70 bg-background/80 px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tracking-[-0.05em] text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">
        {note}
      </div>
    </div>
  );
}

export function MePageShell() {
  const primaryGroups = ME_ENTRY_GROUPS.filter((group) =>
    ["my-courses", "my-exams", "message-center"].includes(group.id)
  );
  const accountGroups = ME_ENTRY_GROUPS.filter((group) =>
    ["basic-settings", "my-orders", "certificates"].includes(group.id)
  );
  const archiveGroups = ME_ENTRY_GROUPS;
  const leadGroups = primaryGroups.map((group) => ({
    ...group,
    primaryItem: group.items[0],
  }));

  return (
    <div className="grid gap-8">
      <MotionReveal direction="up">
        <section className="relative overflow-hidden rounded-[1.8rem] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(243,246,255,0.96))] shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,14,26,0.96))]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:linear-gradient(180deg,black,transparent_90%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
          <div className="relative grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,1.15fr)_340px] xl:p-8">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/10">
                  Personal Workspace
                </Badge>
                <span className="text-[11px] font-medium text-muted-foreground">
                  学习主线 / 考试安排 / 消息处理 / 账户入口
                </span>
              </div>

              <div className="max-w-4xl">
                <h2 className="font-heading text-[clamp(2.7rem,6vw,4.8rem)] font-black leading-[0.92] tracking-[-0.07em] text-foreground">
                  先回到今天要做的事，
                  <br />
                  再展开完整个人空间。
                </h2>
                <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-muted-foreground md:text-lg">
                  个人页首屏只保留真正高频的动作入口。课程、考试、消息和账户管理会按处理优先级出现，剩余分组留在下方完整工作层里。
                </p>
              </div>

              <div className="flex flex-wrap gap-3" data-testid="me-lead-actions">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-[0.95rem] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <Play className="size-4" />
                  继续课程
                </Link>
                <Link
                  href="/exams"
                  className="inline-flex items-center gap-2 rounded-[0.95rem] border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent/40"
                >
                  <ClipboardList className="size-4" />
                  查看考试
                </Link>
                <Link
                  href="/me/messages"
                  className="inline-flex items-center gap-2 rounded-[0.95rem] border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent/40"
                >
                  <BellDot className="size-4" />
                  处理消息
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {leadGroups.map((group, index) => {
                  const Icon = group.icon;
                  return (
                    <MotionReveal
                      key={group.id}
                      direction="up"
                      delay={index * 0.05}
                    >
                      <Link
                        href={group.primaryItem.href}
                        className="group flex h-full flex-col rounded-[1.2rem] border border-border/70 bg-card/88 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/35 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-[0.95rem] border border-border/70 bg-background/70 p-2 text-primary transition group-hover:border-primary/30">
                            <Icon className="size-5" />
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                            {group.items.length} 个入口
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            {group.title}
                          </p>
                          <p className="mt-3 text-[1.35rem] font-black tracking-[-0.04em] text-foreground">
                            {group.primaryItem.title}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {group.primaryItem.description}
                          </p>
                        </div>
                        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-foreground transition group-hover:text-primary">
                          进入入口
                          <ArrowRight className="size-4" />
                        </span>
                      </Link>
                    </MotionReveal>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,#0b1327_0%,#121d36_100%)] p-5 text-white shadow-[0_24px_64px_rgba(15,23,42,0.28)]">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/90">
                  Today Focus
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                  把主线入口放到最前
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  课程、考试和消息都已经回到首屏动作层。导航退回辅助定位，完整分组留在下方继续浏览。
                </p>

                <div className="mt-5 grid gap-3">
                  <LinkCard
                    href="/courses"
                    icon={<BookOpen className="size-4" />}
                    title="继续课程"
                    note="优先回到今天的学习主线"
                    dark
                  />
                  <LinkCard
                    href="/exams"
                    icon={<ClipboardList className="size-4" />}
                    title="查看考试"
                    note="从首屏直接确认考试安排"
                    dark
                  />
                  <LinkCard
                    href="/me/messages"
                    icon={<BellDot className="size-4" />}
                    title="消息中心"
                    note="处理通知、服务消息和课程提醒"
                    dark
                  />
                </div>
              </div>

              <div className="rounded-[1.3rem] border border-border/80 bg-card/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                  Account Actions
                </div>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-foreground">
                  账户入口集中在这里
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  不再把账户说明做成大面积状态面板，只保留可执行入口。
                </p>
                <div className="mt-4 grid gap-3">
                  {accountGroups.slice(0, 2).map((group) => {
                    const Icon = group.icon;
                    return (
                      <LinkCard
                        key={group.id}
                        href={`#${group.id}`}
                        icon={<Icon className="size-4" />}
                        title={group.title}
                        note={group.description}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      <div
        className="grid gap-6 xl:grid-cols-[272px_minmax(0,1fr)]"
        data-testid="me-layout"
      >
        <aside className="grid gap-6 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[1.45rem] border border-border/80 bg-card/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              Navigation
            </div>
            <h3 className="mt-2 font-heading text-[1.7rem] font-black tracking-[-0.05em] text-foreground">
              个人空间导航
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              先完成上方主线动作，再按分组进入学习、消息、账户与资产管理。
            </p>
            <div className="mt-4 max-h-[calc(100vh-15rem)] overflow-y-auto pr-1">
              <MeNavigation groups={ME_ENTRY_GROUPS} />
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-border/80 bg-card/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              Workspace Signals
            </div>
            <div className="mt-4 grid gap-3">
              <WorkspaceSignal
                label="入口分组"
                value={String(archiveGroups.length)}
                note="所有个人入口已经按主题归档"
              />
              <WorkspaceSignal
                label="学习主线"
                value="课程优先"
                note="首屏主动作直接回到学习路径"
              />
              <WorkspaceSignal
                label="账户区域"
                value="已收纳"
                note="资料、安全和资产入口集中在辅助层"
              />
            </div>
          </section>
        </aside>

        <div className="grid gap-6">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
            <div className="rounded-[1.45rem] border border-border/80 bg-card/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    Learning + Signals
                  </div>
                  <h3 className="mt-2 font-heading text-[2rem] font-black tracking-[-0.05em] text-foreground">
                    继续今天的学习主线
                  </h3>
                </div>
                <LinkCard
                  href="/courses"
                  icon={<ArrowRight className="size-4" />}
                  title="进入课程"
                  note="继续学习"
                  compact
                />
              </div>

              <div className="mt-5">
                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-[linear-gradient(135deg,rgba(79,70,255,0.08),rgba(79,70,255,0.02)_42%,rgba(255,255,255,0.96)_100%)]">
                    <div className="p-5">
                      <div className="mb-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                          Main Path
                        </div>
                        <div className="mt-3 max-w-2xl text-[clamp(1.8rem,3vw,3rem)] font-heading font-black leading-[0.95] tracking-[-0.06em] text-foreground">
                          先回到课程主线，
                          <br />
                          再处理考试与消息。
                        </div>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                          这块只负责一件事：把你拉回今天最重要的学习路径。考试安排和未读消息在侧边辅助，不再和主线抢位置。
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 rounded-[0.95rem] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                          >
                            <Play className="size-4" />
                            继续课程
                          </Link>
                          <Link
                            href="/me/study-progress"
                            className="inline-flex items-center gap-2 rounded-[0.95rem] border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent/40"
                          >
                            查看进度
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <WorkspaceSignal
                          label="学习主线"
                          value="课程中"
                          note="当前课程可以继续进入"
                        />
                        <WorkspaceSignal
                          label="消息处理"
                          value="消息中心"
                          note="优先查看系统与课程提醒"
                        />
                        <WorkspaceSignal
                          label="考试安排"
                          value="本周安排"
                          note="考试入口已放到主线旁边"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 grid gap-4 md:grid-cols-2">
                    {primaryGroups.slice(0, 2).map((group) => {
                      const Icon = group.icon;
                      return (
                        <div
                          key={group.id}
                          className="rounded-[1.15rem] border border-border/70 bg-background/75 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="rounded-[0.9rem] border border-border/70 bg-muted/70 p-2 text-primary">
                              <Icon className="size-4" />
                            </span>
                            <div>
                              <div className="text-sm font-black tracking-[-0.02em] text-foreground">
                                {group.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {group.description}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 space-y-3">
                            {group.items.map((item) => (
                              <Link
                                key={item.title}
                                href={item.href}
                                className="flex items-center justify-between rounded-[0.95rem] border border-border/70 bg-card px-3 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent/40"
                              >
                                <span>{item.title}</span>
                                <ArrowRight className="size-4 text-muted-foreground" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-border/80 bg-card/88 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                Identity + Security
              </div>
              <h3 className="mt-2 font-heading text-[1.9rem] font-black tracking-[-0.05em] text-foreground">
                账户与安全
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                资料、密码、登录设备和账户状态不需要单独找页面，这里先集中给你一个清晰入口。
              </p>

              <div className="mt-5 rounded-[1.15rem] border border-border/70 bg-[linear-gradient(180deg,var(--muted),rgba(255,255,255,0.85))] p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-[0.9rem] bg-primary/10 p-2 text-primary">
                    <UserRound className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-black text-foreground">
                      个人资料
                    </div>
                    <div className="text-xs text-muted-foreground">
                      头像、姓名、联系方式
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-[0.9rem] border border-border/70 bg-card px-3 py-3 text-sm font-medium text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  当前账户状态正常，可继续前往安全设置
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {accountGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <LinkCard
                      key={group.id}
                      href={`#${group.id}`}
                      icon={<Icon className="size-4" />}
                      title={group.title}
                      note={group.description}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                  Workspace Layers
                </div>
                <h3 className="mt-2 font-heading text-[2rem] font-black tracking-[-0.05em] text-foreground">
                  学习记录、资产与历史轨迹
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  把成绩、证书、练习记录、订单和已购内容压缩进更清晰的次级工作层，而不是一组平权菜单。
                </p>
              </div>
            </div>

            <MeSectionGrid groups={archiveGroups} />
          </section>
        </div>
      </div>
    </div>
  );
}

function LinkCard({
  href,
  icon,
  title,
  note,
  dark = false,
  compact = false,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  note: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        compact
          ? "inline-flex items-center gap-2 rounded-[0.95rem] border border-border/70 bg-background/75 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent/40"
          : dark
            ? "group flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 transition hover:border-sky-300/20 hover:bg-white/8"
            : "group flex items-start gap-3 rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3 transition hover:border-primary/30 hover:bg-accent/40"
      }
    >
      <span
        className={
          dark
            ? "mt-0.5 rounded-[0.85rem] border border-white/10 bg-white/8 p-2 text-sky-300"
            : "mt-0.5 rounded-[0.85rem] border border-border/70 bg-muted/70 p-2 text-primary"
        }
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={
            dark
              ? "block text-sm font-bold text-white"
              : "block text-sm font-bold text-foreground"
          }
        >
          {title}
        </span>
        <span
          className={
            dark
              ? "mt-1 block text-xs leading-6 text-slate-400"
              : "mt-1 block text-xs leading-6 text-muted-foreground"
          }
        >
          {note}
        </span>
      </span>
      {!compact ? (
        <ArrowRight
          className={
            dark
              ? "mt-1 size-4 text-slate-500 transition group-hover:text-sky-300"
              : "mt-1 size-4 text-muted-foreground transition group-hover:text-primary"
          }
        />
      ) : null}
    </Link>
  );
}
