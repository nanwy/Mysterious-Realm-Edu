import type { ReactNode } from "react";
import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine } from "./home-section-heading";
import {
  ArrowRight,
  BellDot,
  BookOpen,
  Radar,
  ScanSearch,
  Sparkles,
} from "lucide-react";

function FocusChip({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/85 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-extrabold tracking-[-0.04em] text-foreground">
          {value}
        </div>
        <div className="pb-1 text-[11px] font-semibold text-muted-foreground">
          {note}
        </div>
      </div>
    </div>
  );
}

function WorkspaceStrip({
  icon,
  title,
  value,
  note,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white/6 px-4 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          {title}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-extrabold text-white">{value}</span>
          <span className="truncate text-xs font-medium text-slate-400">{note}</span>
        </div>
      </div>
    </div>
  );
}

export function HomeHero({
  banner,
  bannerError,
  hotCourseCount,
  examCount,
  newsCount,
  questionnaireCount,
  announcementCount,
}: {
  banner: HomeRecord | undefined;
  bannerError: string | null;
  hotCourseCount: number;
  examCount: number;
  newsCount: number;
  questionnaireCount: number;
  announcementCount: number;
}) {
  const leadBannerImage = resolveMediaUrl(
    String(banner?.imgUrl ?? banner?.image ?? "")
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,248,255,0.98))] shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(7,12,25,0.98))]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:linear-gradient(180deg,black,transparent_82%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(91,75,255,0.18),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_68%)]" />
      <div className="pointer-events-none absolute right-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.08),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(96,165,250,0.14),transparent_68%)]" />

      <div className="relative grid gap-10 p-5 md:p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] xl:p-10">
        <MotionStagger className="space-y-8" delayChildren={0.06}>
          <MotionItem className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary hover:bg-primary/10">
              Today Board
            </Badge>
            <span className="text-[11px] font-medium text-muted-foreground">
              云学考系统 / 平台门户 / 今日中枢
            </span>
          </MotionItem>

          <MotionItem className="max-w-4xl">
            <h1 className="max-w-4xl text-[clamp(3.2rem,7vw,6rem)] font-black leading-[0.92] tracking-[-0.07em] text-foreground">
              平台重点
              <br />
              课程、考试与动态
              <br />
              <span className="text-primary">先看这一屏</span>
            </h1>
          </MotionItem>

          <MotionItem className="max-w-2xl">
            <p className="text-base font-medium leading-8 text-muted-foreground md:text-lg">
              首页不再只是功能目录。课程入口、考试安排、教务通知和推荐内容会先被编排，再告诉你今天从哪里开始。
            </p>
          </MotionItem>

          <MotionItem className="flex flex-wrap items-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_16px_36px_rgba(91,75,255,0.28)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              继续今日学习
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background"
            >
              查看考试安排
            </Link>
          </MotionItem>

          <MotionItem>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FocusChip label="课程" value={`${hotCourseCount || 8}+`} note="学习入口" />
              <FocusChip label="考试" value={`${examCount || 6}+`} note="今日信号" />
              <FocusChip label="动态" value={`${announcementCount || 4}+`} note="教务更新" />
              <FocusChip label="内容" value={`${newsCount || 4}+`} note="推荐资讯" />
            </div>
          </MotionItem>
        </MotionStagger>

        <MotionReveal
          direction="left"
          delay={0.12}
          className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#0b1327_0%,#121d36_100%)] p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.32)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,75,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_32%)]" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-300/90">
                  Live Workspace
                </div>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-white">
                  实时工作区
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold text-slate-300">
                同步在线
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <WorkspaceStrip
                icon={<BookOpen className="size-4" />}
                title="课程进度"
                value="42%"
                note="今日主线"
              />
              <WorkspaceStrip
                icon={<BellDot className="size-4" />}
                title="考试提醒"
                value={String(examCount || 6)}
                note="即将开始"
              />
              <WorkspaceStrip
                icon={<ScanSearch className="size-4" />}
                title="内容扫描"
                value={String(newsCount + announcementCount || 8)}
                note="平台更新"
              />
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Focus Stream
                </div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    今日焦点
                  </div>
                </div>

              <ErrorLine message={bannerError} />

              <div className="mt-3 grid gap-3">
                <div className="relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(129,140,248,0.16),rgba(56,189,248,0.12))] p-4">
                  {leadBannerImage ? (
                    <img
                      src={leadBannerImage}
                      alt={toText(banner?.title ?? banner?.name, "首页 Banner")}
                      className="h-40 w-full rounded-[1rem] object-cover opacity-80"
                    />
                  ) : (
                    <div className="grid h-40 place-items-center rounded-[1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
                      <div className="space-y-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                          <Sparkles className="size-5 text-sky-300" />
                        </div>
                        <div>
                        <div className="text-sm font-bold text-white">主内容面板</div>
                        <div className="mt-1 text-xs font-medium text-slate-400">
                          课程、考试与推荐内容会在这里联动组织
                        </div>
                      </div>
                    </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.1rem] border border-white/10 bg-white/6 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        平台流
                      </div>
                      <div className="mt-2 text-lg font-extrabold text-white">
                        {newsCount || 4} 条推荐内容
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-400">
                      新课程、新文章与平台动态正在更新
                    </div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/10 bg-white/6 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        待处理
                      </div>
                      <div className="mt-2 text-lg font-extrabold text-white">
                        {questionnaireCount || 4} 项待处理
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-400">
                      问卷、通知和考试提醒会集中出现在这里
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
