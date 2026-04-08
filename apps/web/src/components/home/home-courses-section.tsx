import Link from "next/link";
import { MotionReveal } from "@workspace/motion";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";

export function HomeCoursesSection({
  courses,
  courseError,
}: {
  courses: HomeRecord[];
  courseError: string | null;
  announcements?: HomeRecord[];
  announcementError?: string | null;
  examCount?: number;
}) {
  const visibleCourses = (courses.length ? courses : new Array(4).fill({})).slice(0, 4);
  const featuredCourse = visibleCourses[0] ?? {};
  const secondaryCourses = visibleCourses.slice(1, 4);

  const coverUrl = resolveMediaUrl(String(featuredCourse.cover ?? ""));

  return (
    <section className="flex flex-col bg-background">
      <div className="flex items-end justify-between px-6 py-6 lg:px-10 lg:py-8 border-b border-border/50 bg-background/50">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> 
            Learning Path
          </span>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">学习序列</h2>
            {courseError && <span className="text-[10px] text-destructive font-mono uppercase bg-destructive/10 px-2 py-0.5">{courseError}</span>}
          </div>
        </div>
        <Link href="/courses" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center group mb-1">
          显示全部 <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </Link>
      </div>

      <MotionReveal direction="up">
        <div className="grid lg:grid-cols-[1.3fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border/50">
          
          {/* Main Course */}
          <Link href={`/courses/${String(featuredCourse.id ?? "")}`} className="flex flex-col p-8 lg:p-12 relative group hover:bg-muted/5 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">进度主线</span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 border border-border/50 px-2 py-0.5">PRIORITY: HIGH</span>
            </div>
            
            <div className="mb-10 aspect-[16/9] relative bg-muted/20 overflow-hidden border border-border/40">
              {coverUrl ? (
                <img src={coverUrl} alt="封面" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 font-mono text-xs uppercase tracking-widest">
                  <LayoutDashboard className="w-6 h-6 mb-2" />
                  Missing Media
                </div>
              )}
            </div>

            <h3 className="text-2xl lg:text-3xl font-medium tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
              {toText(featuredCourse.name, "进程同步预备中：数据结构与高级算法设计")}
            </h3>
            
            <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground mt-auto">
              <div>
                <span className="text-[10px] block uppercase tracking-widest mb-2 text-muted-foreground/60 font-medium">在学人数</span>
                <span className="text-lg font-mono text-foreground font-medium">{String(featuredCourse.learnerNumber ?? 0)}</span>
              </div>
              <div>
                <span className="text-[10px] block uppercase tracking-widest mb-2 text-muted-foreground/60 font-medium">状态</span>
                <span className="text-lg font-mono text-foreground font-medium">{featuredCourse.isFree ? "FREE" : `￥${String(featuredCourse.price ?? "--")}`}</span>
              </div>
            </div>
          </Link>

          {/* Sub Courses Stream */}
          <div className="flex flex-col divide-y divide-border/50 bg-background">
            <div className="px-8 py-4 border-b border-border/50 bg-muted/5 flex items-center">
              <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/70 uppercase">推荐流池</span>
            </div>
            
            {secondaryCourses.map((item, index) => (
              <Link
                key={index}
                href={`/courses/${String(item.id ?? "")}`}
                className="flex-1 flex flex-col justify-center px-8 py-8 hover:bg-muted/5 transition-colors group"
              >
                <h4 className="text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary leading-snug">
                  {toText(item.name, `待更新学习队列 #${index + 1}`)}
                </h4>
                <div className="mt-6 flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-muted-foreground">ID_{String(index).padStart(4, '0')}</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground"><span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span> {String(item.learnerNumber ?? 0)}</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground/20 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}
