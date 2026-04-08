import type { ReactNode } from "react";
import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { ArrowUpRight, Play, TerminalSquare } from "lucide-react";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";

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
    <section className="grid xl:grid-cols-[1fr_360px] divide-y xl:divide-y-0 xl:divide-x divide-border/50 bg-background">
      {/* 左侧：Bolder 的动态产品语境面板 */}
      <div className="flex flex-col p-8 lg:p-12 xl:p-16">
        <MotionReveal direction="up">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-muted/40 text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase mb-8 border border-border/40">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            Session Active
          </div>
          <h1 className="text-[clamp(2.7rem,5.5vw,5.2rem)] font-medium leading-[1.02] tracking-[-0.05em] text-foreground">
            周二早安。 <br />
            继续推进<span className="text-muted-foreground">主线课程</span>，
            <br />
            今日核心目标 4 项<span className="text-primary">.</span>
          </h1>
          <MotionItem className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-6 text-sm font-bold text-background transition-transform hover:scale-[0.98]"
            >
              继续今日学习
              <Play className="size-4 fill-current outline-none" />
            </Link>
            <Link
              href="/exams"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border/60 bg-transparent px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 hover:text-primary"
            >
              查看考试安排
              <ArrowUpRight className="size-4 opacity-50" />
            </Link>
          </MotionItem>
        </MotionReveal>

        <MotionStagger
          delayChildren={0.05}
          className="mt-20 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 border-t border-border/50 pt-10"
        >
          <MotionItem className="group cursor-default">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 transition-colors group-hover:text-foreground">
              进行中课程
            </div>
            <div className="text-4xl font-semibold tracking-tighter text-foreground font-mono">
              {hotCourseCount || 2}
            </div>
          </MotionItem>
          <MotionItem className="group cursor-default">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 transition-colors group-hover:text-foreground">
              待考安排
            </div>
            <div className="text-4xl font-semibold tracking-tighter text-foreground font-mono">
              {examCount || 0}
            </div>
          </MotionItem>
          <MotionItem className="group cursor-default">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 transition-colors group-hover:text-foreground">
              教务通知
            </div>
            <div className="text-4xl font-semibold tracking-tighter text-foreground font-mono">
              {announcementCount || 4}
            </div>
          </MotionItem>
          <MotionItem className="group cursor-default">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 transition-colors group-hover:text-foreground">
              待办事项
            </div>
            <div className="text-4xl font-semibold tracking-tighter text-foreground font-mono">
              {questionnaireCount || 1}
            </div>
          </MotionItem>
        </MotionStagger>
      </div>

      {/* 右侧：硬切面 Banner */}
      <MotionReveal
        direction="left"
        delay={0.1}
        className="relative group bg-muted/10 overflow-hidden min-h-[360px] xl:min-h-full"
      >
        {bannerError && (
          <div className="absolute top-4 right-4 z-20 text-[10px] font-mono text-destructive uppercase tracking-wider bg-background/90 px-2 py-1">
            {bannerError}
          </div>
        )}

        {leadBannerImage ? (
          <>
            <img
              src={leadBannerImage}
              alt={toText(banner?.title ?? banner?.name, "焦点推荐")}
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-all duration-[1000ms] group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            <Link
              href="#"
              className="absolute inset-0 z-10"
              aria-label="查看推荐"
            >
              <div className="absolute bottom-0 left-0 p-8 right-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                  焦点推荐
                </div>
                <h3 className="text-2xl font-medium text-white mb-2 leading-tight">
                  {toText(
                    banner?.title ?? banner?.name,
                    "云端进阶：高可用架构精讲"
                  )}
                </h3>
                <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors duration-300">
                  即刻探索{" "}
                  <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:-translate-y-0 transition-all duration-300" />
                </div>
              </div>
            </Link>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/5 transition-colors group-hover:bg-muted/10">
            <TerminalSquare className="w-8 h-8 mb-4 opacity-20" />
            <span className="text-sm font-medium tracking-tight">
              内容同步预处理
            </span>
            <span className="text-xs mt-2 opacity-50 font-mono">
              CONNECTION_WAITING
            </span>
          </div>
        )}
      </MotionReveal>
    </section>
  );
}
