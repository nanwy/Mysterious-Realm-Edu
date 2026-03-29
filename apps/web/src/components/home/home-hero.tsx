import Link from "next/link";
import {
  MotionFloat,
  MotionItem,
  MotionReveal,
  MotionStagger,
} from "@workspace/motion";
import { Badge } from "@workspace/ui";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, StatCard } from "./home-section-heading";

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
    <section className="w-full">
      <div className="overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(255,255,255,0.94)_40%,rgba(59,130,246,0.1))] p-6 shadow-[0_30px_80px_rgba(14,116,144,0.12)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(15,23,42,0.96)_42%,rgba(37,99,235,0.22))] dark:shadow-[0_30px_80px_rgba(2,6,23,0.35)] sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:items-start">
          <MotionStagger className="space-y-6">
            <MotionItem className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-sky-600 px-3 py-1 text-white hover:bg-sky-600">
                Student Platform
              </Badge>
              <span className="rounded-full border border-sky-100 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                云学考系统 · 学习与考试一体化
              </span>
            </MotionItem>

            <MotionItem className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-slate-950 dark:text-white sm:text-5xl xl:text-6xl">
                更轻盈地进入课程
                <span className="block bg-[linear-gradient(90deg,#0284c7,#2563eb,#4f46e5)] bg-clip-text text-transparent">
                  更清晰地完成练习与考试
                </span>
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                保留旧系统真实接口和业务入口，把首页改造成更年轻的学习平台首页。课程发现、考试快讯、问卷与资讯都被重新组织成更直观的数字化面板。
              </p>
            </MotionItem>

            <MotionItem className="flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
              >
                <span className="text-white dark:text-slate-950">开始学习</span>
                <span className="text-xs uppercase tracking-[0.2em] text-sky-200 dark:text-slate-900/70">
                  Courses
                </span>
              </Link>
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-sky-500 dark:hover:text-sky-300"
              >
                <span>查看考试</span>
                <span className="text-xs uppercase tracking-[0.2em] text-sky-500 dark:text-sky-300">
                  Exams
                </span>
              </Link>
            </MotionItem>
          </MotionStagger>

          <MotionReveal
            direction="left"
            delay={0.18}
            className="grid gap-4 xl:max-w-136 xl:justify-self-end"
          >
            <MotionFloat y={8}>
              <div className="overflow-hidden rounded-[30px] border border-white/80 bg-slate-950 p-5 text-white shadow-[0_30px_70px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/95">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                      今日推荐
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {toText(banner?.title ?? banner?.name, "首页主视觉")}
                    </p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                    实时内容
                  </div>
                </div>

                <div className="mt-4">
                  <ErrorLine message={bannerError} />
                </div>

                <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/60">
                  {leadBannerImage ? (
                    <img
                      src={leadBannerImage}
                      alt={toText(banner?.title ?? banner?.name, "首页 Banner")}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-4/3 items-center justify-center px-6 text-center text-sm text-white/60">
                      Banner 接口可用后，这里会显示首页主图。
                    </div>
                  )}
                </div>
              </div>
            </MotionFloat>
          </MotionReveal>
        </div>

        <MotionStagger
          className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5"
          delayChildren={0.12}
        >
          <MotionItem>
            <StatCard
              label="热门课程"
              value={`${hotCourseCount || 8}+`}
              note="课程、学习进度与学习入口"
            />
          </MotionItem>
          <MotionItem>
            <StatCard
              label="最新考试"
              value={`${examCount || 6}+`}
              note="开考状态、分数与时长信息"
            />
          </MotionItem>
          <MotionItem>
            <StatCard
              label="精选资讯"
              value={`${newsCount || 4}+`}
              note="公告、文章与热点内容聚合"
            />
          </MotionItem>
          <MotionItem>
            <StatCard
              label="问卷调查"
              value={`${questionnaireCount || 4}`}
              note="首页可直接进入调查任务"
            />
          </MotionItem>
          <MotionItem>
            <StatCard
              label="首页公告"
              value={`${announcementCount || 4}`}
              note="重要通知与考试提醒聚合"
            />
          </MotionItem>
        </MotionStagger>
      </div>
    </section>
  );
}
