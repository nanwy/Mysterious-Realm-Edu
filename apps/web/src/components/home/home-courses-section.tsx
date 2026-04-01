import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";

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
  const visibleCourses = (
    courses.length ? courses : new Array(4).fill({})
  ).slice(0, 4);

  const featuredCourse = visibleCourses[0] ?? {};
  const secondaryCourses = visibleCourses.slice(1, 4);

  const visibleAnnouncements = (
    announcements.length
      ? announcements
      : [{ titile: "接口可用后会在这里展示教务通知与首页公告。" }]
  ).slice(0, 2);

  return (
    <HomeSection
      eyebrow="课程中心"
      title="学习总览"
      subtitle="保留课程主入口，但用更紧凑的主卡和次级课程列表呈现，避免第二屏信息失衡。"
      href="/courses"
    >
      <MotionReveal className="grid gap-4" direction="left">
        <ErrorLine message={courseError} />
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:col-span-5">
            <div className="overflow-hidden bg-muted p-4">
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
                {resolveMediaUrl(String(featuredCourse.cover ?? "")) ? (
                  <img
                    src={resolveMediaUrl(String(featuredCourse.cover)) ?? ""}
                    alt={toText(featuredCourse.name, "课程封面")}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-16/10 items-center justify-center p-6">
                    <div className="rounded-full bg-background/90 px-4 py-2 text-[11px] font-bold tracking-[0.16em] text-primary shadow-sm">
                      课程聚焦
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-3">
                <Badge className="w-fit rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/10">
                  推荐课程
                </Badge>
                <h3 className="text-xl font-extrabold text-foreground">
                  {toText(featuredCourse.name, "课程学习路径")}
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted px-4 py-4">
                  <p className="text-xs font-bold text-muted-foreground">
                    学习人数
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-foreground">
                    {String(featuredCourse.learnerNumber ?? 0)} 人
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted px-4 py-4">
                  <p className="text-xs font-bold text-muted-foreground">
                    课程价格
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-foreground">
                    {featuredCourse.isFree
                      ? "免费"
                      : `￥${String(featuredCourse.price ?? "--")}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/courses/${String(featuredCourse.id ?? "")}`}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  进入课程
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                >
                  全部课程
                </Link>
              </div>
            </div>
          </article>

          <MotionStagger
            className="space-y-4 lg:col-span-4"
            delayChildren={0.1}
          >
            {secondaryCourses.map((item, index) => (
              <MotionItem key={index}>
                <article className="group cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                        推荐课 {index + 2}
                      </span>
                      <h3 className="text-lg font-extrabold text-foreground transition-colors group-hover:text-primary">
                        {toText(item.name, `热门课程 ${index + 2}`)}
                      </h3>
                    </div>
                    <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                      课程
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                      {String(item.learnerNumber ?? 0)} 人学习
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      {item.isFree ? "免费" : `￥${String(item.price ?? "--")}`}
                    </span>
                  </div>
                </article>
              </MotionItem>
            ))}
          </MotionStagger>

          <div className="grid gap-4 lg:col-span-3 flex-col">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    教务动态
                  </p>
                  <h2 className="text-lg font-extrabold text-foreground">
                    教务通知
                  </h2>
                </div>
                <span className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                  实时
                </span>
              </div>
              <div className="mt-4">
                <ErrorLine message={announcementError} />
              </div>
              <div className="mt-4 grid gap-3">
                {visibleAnnouncements.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/60 bg-muted px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-foreground/80">
                        {toText(item.titile ?? item.title, `通知 ${index + 1}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">
                学习进度
              </p>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
                84%
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[84%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-md shadow-primary/20">
              <p className="text-xs font-bold text-primary-foreground/80">
                近期考试
              </p>
              <p className="mt-4 text-4xl font-extrabold tracking-tight">
                {examCount || 6}
              </p>
              <p className="mt-2 text-[10px] font-bold text-primary-foreground/80">
                待关注场次
              </p>
            </div>
            <MotionStagger
              className="grid gap-4 sm:grid-cols-3"
              delayChildren={0.1}
            >
              {[
                { label: "在线练习", href: "/practice", note: "题库训练" },
                { label: "在线考试", href: "/exams", note: "考试入口" },
                { label: "个人中心", href: "/me", note: "学习档案" },
              ].map((item) => (
                <MotionItem key={item.label}>
                  <Link
                    href={item.href}
                    className="group block rounded-xl border border-border bg-card p-3 text-center shadow-sm transition hover:bg-muted"
                  >
                    <p className="text-sm font-extrabold text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                      {item.note}
                    </p>
                  </Link>
                </MotionItem>
              ))}
            </MotionStagger>
          </div>
        </div>
      </MotionReveal>
    </HomeSection>
  );
}
