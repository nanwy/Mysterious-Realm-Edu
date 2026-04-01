import Link from "next/link";
import { MotionItem, MotionReveal, MotionStagger } from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine } from "./home-section-heading";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Layout,
  HelpCircle,
} from "lucide-react";

function HeroStat({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon ? icon : <div className="size-2 rounded-full bg-current" />}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            {label}
          </span>
          <span className="text-xl font-extrabold text-foreground">
            {value}
          </span>
        </div>
        <div className="mt-0.5 text-xs font-medium text-muted-foreground">
          {note}
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

  const heroStats = [
    {
      label: "课程",
      value: `${hotCourseCount || 8}+`,
      desc: "学习入口",
      icon: <BookOpen className="size-6" />,
    },
    {
      label: "考试",
      value: `${examCount || 6}+`,
      desc: "近期安排",
      icon: <FileText className="size-6" />,
    },
    {
      label: "资讯",
      value: `${newsCount + announcementCount || 8}+`,
      desc: "教务动态",
      icon: <Layout className="size-6" />,
    },
    {
      label: "问卷",
      value: `${questionnaireCount || 4}`,
      desc: "待办任务",
      icon: <HelpCircle className="size-6" />,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col lg:flex-row">
          <MotionStagger className="flex-1 p-8 lg:p-12" delayChildren={0.06}>
            <MotionItem>
              <Badge className="mb-6 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider text-primary hover:bg-primary/10">
                新一代学习中枢
              </Badge>
            </MotionItem>
            <MotionItem>
              <h1 className="mb-6 max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
                把课程与练习
                <br />
                <span className="text-primary">
                  放进更清晰的学习路径
                </span>
              </h1>
            </MotionItem>
            <MotionItem>
              <p className="mb-8 max-w-lg text-lg font-medium leading-relaxed text-muted-foreground">
                首页聚合课程入口、考试提醒、学习进度和教务通知，让学员一进来就知道下一步该做什么。
              </p>
            </MotionItem>
            <MotionItem className="flex flex-wrap items-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                进入课程中心
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/exams"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted"
              >
                查看近期考试
              </Link>
            </MotionItem>
          </MotionStagger>

          <MotionReveal
            direction="left"
            delay={0.16}
            className="border-t border-border bg-muted p-8 lg:w-[400px] lg:border-l lg:border-t-0"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  学习总览
                </div>
                <h2 className="text-lg font-extrabold text-foreground">
                  今日学习面板
                </h2>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                实时同步
              </div>
            </div>

            <p className="mb-6 text-sm font-medium text-muted-foreground">
              课程、考试和首页主视觉在这里汇总，减少首屏干扰。
            </p>

            <div className="mb-6">
              <ErrorLine message={bannerError} />
            </div>

            <div className="mb-6 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-[linear-gradient(135deg,var(--muted),var(--background))] shadow-inner">
              {leadBannerImage ? (
                <img
                  src={leadBannerImage}
                  alt={toText(banner?.title ?? banner?.name, "首页 Banner")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-20 w-32">
                  <div className="absolute bottom-2 left-1/2 h-10 w-24 -translate-x-1/2 rounded-full bg-indigo-300/50 blur-lg" />
                  <div className="absolute bottom-4 left-6 h-10 w-10 rounded-full bg-blue-300/50 blur-lg" />
                  <div className="absolute bottom-3 right-6 h-12 w-12 rounded-full bg-indigo-200/50 blur-lg" />
                  <div className="absolute bottom-3 left-1/2 h-8 w-20 -translate-x-1/2 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-sm" />
                  <div className="absolute bottom-6 left-6 h-8 w-8 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-sm" />
                  <div className="absolute bottom-5 right-6 h-10 w-10 rounded-full border border-white/80 bg-white/60 shadow-sm backdrop-blur-sm" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
                <div className="mb-1 text-xs font-bold text-muted-foreground">
                  学习聚焦
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  42%
                </div>
              </div>
              <div className="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
                <div className="mb-1 text-xs font-bold text-muted-foreground">
                  今日提醒
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {examCount || 6} 项
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>

      <MotionStagger
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        delayChildren={0.1}
      >
        {heroStats.map((stat) => (
          <MotionItem key={stat.label}>
            <HeroStat
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              note={stat.desc}
            />
          </MotionItem>
        ))}
      </MotionStagger>
    </section>
  );
}
