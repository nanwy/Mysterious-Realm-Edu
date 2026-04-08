import type { ReactNode } from "react";
import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine } from "./home-section-heading";
import { ArrowUpRight, ArrowRight, BookOpen, Clock, Play } from "lucide-react";

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
    <section className="relative border-b border-border/40 pb-16 pt-8 lg:pt-20">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-12">
        
        {/* 左侧主视觉文案：极简、高对比度黑白灰排版 */}
        <MotionStagger className="space-y-10" delayChildren={0.05}>
          <MotionItem>
            <h1 className="font-heading text-[clamp(2.8rem,5.5vw,5rem)] font-black leading-[1.05] tracking-tight text-foreground">
              全新学习中枢，
              <br className="hidden md:block" />
              汇集你的所有进度。
            </h1>
          </MotionItem>

          <MotionItem className="max-w-2xl">
            <p className="text-base text-muted-foreground leading-[1.8] sm:text-lg lg:max-w-[85%]">
              平台信息流已自动整合。获取最新推荐课程、接收即时考试提醒与教务公告，随时随地推进你的学习计划。
            </p>
          </MotionItem>

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
        </MotionStagger>

        {/* 右侧：状态与轮播位组合体。去卡片化，仅用细线分割 */}
        <MotionReveal
          direction="up"
          delay={0.15}
          className="flex flex-col border-t border-border/40 pt-12 lg:border-t-0 lg:border-l lg:pl-16 lg:pt-0"
        >
          {/* 数据指标 */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 pb-8 border-b border-border/40">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">待办与通知</p>
              <p className="text-4xl font-heading font-bold tracking-tight text-foreground">{questionnaireCount + announcementCount || 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">推荐内容</p>
              <p className="text-4xl font-heading font-bold tracking-tight text-foreground">{newsCount || 0}</p>
            </div>
          </div>
          
          <div className="pt-8 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span>焦点推荐</span>
              <span className="flex items-center gap-2 text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-primary opacity-80"></span>
                </span>
                同步状态正常
              </span>
            </div>
            
            <ErrorLine message={bannerError} />

            {/* Banner位 */}
            <div className="group relative w-full flex-1 aspect-[16/9] lg:aspect-auto rounded-[1.25rem] overflow-hidden bg-muted/40 border border-border/40 isolation-auto">
              {leadBannerImage ? (
                <img
                  src={leadBannerImage}
                  alt={toText(banner?.title ?? banner?.name, "首页焦点")}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-card/50">
                  <Clock className="size-6 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-semibold text-foreground">状态：待更新</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">当前暂无全站优先级推荐内容，信息流处于待同步保护态。</p>
                </div>
              )}
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
