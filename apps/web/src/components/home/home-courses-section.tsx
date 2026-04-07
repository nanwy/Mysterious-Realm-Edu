import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";
import { ArrowRight, BellDot, BookOpen, PenSquare } from "lucide-react";

function QuickAccess({
  label,
  note,
  href,
}: {
  label: string;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border/70 bg-card/90 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background"
    >
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        快捷入口
      </div>
      <div className="mt-3 text-lg font-extrabold tracking-[-0.03em] text-foreground">
        {label}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{note}</div>
    </Link>
  );
}

export function HomeCoursesSection({
  courses,
  courseError,
  announcements,
  announcementError,
  examCount,
}: {
  courses: HomeRecord[];
  courseError: string | null;
  announcements: HomeRecord[];
  announcementError: string | null;
  examCount: number;
}) {
  const visibleCourses = (courses.length ? courses : new Array(4).fill({})).slice(0, 4);
  const featuredCourse = visibleCourses[0] ?? {};
  const secondaryCourses = visibleCourses.slice(1, 4);
  const visibleAnnouncements = (
    announcements.length
      ? announcements
      : [{ titile: "接口可用后会在这里展示教务通知与首页公告。" }]
  ).slice(0, 2);

  const coverUrl = resolveMediaUrl(String(featuredCourse.cover ?? ""));

  return (
    <HomeSection
      eyebrow="Learning Workspace"
      title="学习工作区"
      subtitle="把课程主线、推荐流和平台信号压缩到一个更像原生工具的学习工作区，而不是继续排一排独立模块。"
      href="/courses"
    >
      <MotionReveal className="grid gap-4" direction="left">
        <ErrorLine message={courseError} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.72fr)_280px]">
          <article className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                    Main Path
                  </div>
                  <h3 className="mt-2 text-[clamp(1.7rem,2.8vw,2.6rem)] font-black tracking-[-0.05em] text-foreground">
                    {toText(featuredCourse.name, "课程学习路径")}
                  </h3>
                </div>
                <Badge className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary hover:bg-primary/10">
                  推荐课程
                </Badge>
              </div>
            </div>

            <div className="grid gap-0 2xl:grid-cols-[1.08fr_0.92fr]">
              <div className="border-b border-border/60 p-5 2xl:border-b-0 2xl:border-r">
                <div className="overflow-hidden rounded-[1.4rem] border border-border/60 bg-[linear-gradient(180deg,var(--muted),rgba(255,255,255,0.7))] p-3">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={toText(featuredCourse.name, "课程封面")}
                      className="aspect-[16/10] w-full rounded-[1rem] object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[16/10] place-items-center rounded-[1rem] border border-border/60 bg-card">
                      <div className="space-y-3 text-center">
                        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <BookOpen className="size-5" />
                        </div>
                        <div className="text-sm font-bold text-foreground">课程主路径面板</div>
                        <div className="max-w-xs text-xs font-medium text-muted-foreground">
                          继续学习、专题课程和推荐路径会聚合到这里
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted px-4 py-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      学习人数
                    </div>
                    <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-foreground">
                      {String(featuredCourse.learnerNumber ?? 0)} 人
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted px-4 py-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      课程价格
                    </div>
                    <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-foreground">
                      {featuredCourse.isFree ? "免费" : `￥${String(featuredCourse.price ?? "--")}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-5">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-muted px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        学习焦点
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Path 01
                      </span>
                    </div>
                    <div className="mt-3 text-lg font-extrabold text-foreground">
                      继续主线课程，优先完成今日目标
                    </div>
                    <div className="mt-2 text-sm font-medium leading-7 text-muted-foreground">
                      首页会把课程发现压缩成更像工作区的主路径，而不是普通课程列表。
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-card px-4 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        继续学习
                      </div>
                      <div className="mt-2 text-xl font-extrabold text-foreground">
                        进入主课程
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card px-4 py-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        发现课程
                      </div>
                      <div className="mt-2 text-xl font-extrabold text-foreground">
                        查看全部
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/courses/${String(featuredCourse.id ?? "")}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    进入学习
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/courses"
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                  >
                    全部课程
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <MotionStagger className="space-y-4" delayChildren={0.08}>
            {secondaryCourses.map((item, index) => (
              <MotionItem key={index}>
                <article className="group rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                        Stream {index + 2}
                      </div>
                      <h3 className="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary">
                        {toText(item.name, `热门课程 ${index + 2}`)}
                      </h3>
                    </div>
                    <div className="rounded-full border border-border/60 bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                      课程
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted px-4 py-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        学习人数
                      </div>
                      <div className="mt-2 text-lg font-extrabold text-foreground">
                        {String(item.learnerNumber ?? 0)} 人
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        价格
                      </div>
                      <div className="mt-2 text-lg font-extrabold text-foreground">
                        {item.isFree ? "免费" : `￥${String(item.price ?? "--")}`}
                      </div>
                    </div>
                  </div>
                </article>
              </MotionItem>
            ))}
          </MotionStagger>

          <div className="grid gap-4 auto-rows-min">
            <section className="rounded-[1.5rem] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,246,255,0.92))] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:bg-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                    Signal Rail
                  </div>
                  <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-foreground">
                    平台信号
                  </h3>
                </div>
                <div className="rounded-full border border-border/60 bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground">
                  LIVE
                </div>
              </div>

              <div className="mt-4">
                <ErrorLine message={announcementError} />
              </div>

              <div className="mt-4 space-y-3">
                {visibleAnnouncements.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-border/60 bg-muted px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {index === 0 ? <BellDot className="size-4" /> : <PenSquare className="size-4" />}
                      </div>
                      <div className="text-sm font-medium leading-7 text-foreground/80">
                        {toText(item.titile ?? item.title, `通知 ${index + 1}`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  学习进度
                </div>
                <div className="mt-3 text-4xl font-black tracking-[-0.06em] text-foreground">
                  84%
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[84%] rounded-full bg-primary" />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(91,75,255,0.96),rgba(69,56,255,1))] p-5 text-primary-foreground shadow-[0_20px_48px_rgba(91,75,255,0.28)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground/70">
                  考试提醒
                </div>
                <div className="mt-3 text-4xl font-black tracking-[-0.06em]">
                  {examCount || 6}
                </div>
                <div className="mt-2 text-xs font-medium text-primary-foreground/80">
                  今天值得优先关注的考试场次
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <QuickAccess label="在线练习" note="题库训练" href="/practice" />
              <QuickAccess label="在线考试" note="考试入口" href="/exams" />
              <QuickAccess label="个人中心" note="学习档案" href="/me" />
            </div>
          </div>
        </div>
      </MotionReveal>
    </HomeSection>
  );
}
