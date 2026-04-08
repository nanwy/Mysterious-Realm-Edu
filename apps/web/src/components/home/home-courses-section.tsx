import Link from "next/link";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ArrowUpRight, ArrowRight, BellDot } from "lucide-react";
import { MotionItem, MotionStagger } from "@workspace/motion";

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
  const visibleCourses = courses.slice(0, 8);
  const visibleAnnouncements = announcements.slice(0, 3);

  return (
    <section className="flex flex-col gap-10">
      {/* 平台公告区（复原丢失的数据） */}
      {visibleAnnouncements.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-primary opacity-80"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">教务公告</span>
          </div>
          {announcementError && <div className="text-sm text-destructive">{announcementError}</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            {visibleAnnouncements.map((ann, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-[1rem] border border-border/40 bg-muted/20 px-4 py-3">
                <BellDot className="size-4 text-primary shrink-0" />
                <span className="truncate text-sm font-medium text-foreground">{toText(ann.titile ?? ann.title, "系统公告")}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">{toText(ann.publishTime ?? ann.time, "")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 课程区 */}
      <div className="flex flex-col">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-5 mb-8">
          <h2 className="text-2xl font-heading font-black tracking-tight text-foreground">
            主线课程
          </h2>
        <Link href="/courses" className="group flex items-center text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors">
          查看全部
          <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {courseError && (
        <div className="py-4 text-sm text-destructive">{courseError}</div>
      )}

      {visibleCourses.length === 0 && !courseError ? (
        <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl bg-muted/20 border border-border/30">
          <p className="text-sm font-semibold text-foreground">暂无课程数据</p>
          <p className="text-xs text-muted-foreground mt-1">课程计划正在同步中</p>
        </div>
      ) : (
        <MotionStagger className="grid gap-x-8 gap-y-10 sm:grid-cols-2" delayChildren={0.05}>
          {visibleCourses.map((course, index) => {
            const coverUrl = resolveMediaUrl(String(course.cover ?? ""));
            return (
              <MotionItem key={index}>
                <Link
                  href={`/courses/${String(course.id ?? "")}`}
                  className="group flex flex-col gap-4"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40 border border-border/40 rounded-[1.25rem] isolation-auto">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={toText(course.name, `课程 ${index + 1}`)}
                        className="object-cover w-full h-full transition-transform duration-[600ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex bg-card items-center justify-center h-full w-full">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">待接入内容</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {toText(course.name, "未命名专题课程")}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      <span>{String(course.learnerNumber ?? 0)} 参与讨论</span>
                      <span className="text-foreground/80">
                        {course.isFree ? "限时免费" : `￥${String(course.price ?? "--")}`}
                      </span>
                    </div>
                  </div>
                </Link>
              </MotionItem>
            );
          })}
        </MotionStagger>
      )}
      </div>
    </section>
  );
}
