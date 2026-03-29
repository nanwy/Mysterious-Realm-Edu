import { MotionReveal } from "@workspace/motion";
import { toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";

export function HomeHotNewsSection({
  hotNews,
  hotNewsError,
}: {
  hotNews: HomeRecord[];
  hotNewsError: string | null;
}) {
  const visibleHot = (hotNews.length ? hotNews : new Array(5).fill({})).slice(0, 5);

  return (
    <HomeSection
      eyebrow="Hot Tracking"
      title="热度排行"
      subtitle="聚合热点资讯，帮助学员快速锁定高关注内容。"
    >
      <MotionReveal
        direction="left"
        className="rounded-[30px] border border-sky-200/70 bg-[linear-gradient(180deg,rgba(248,251,255,0.96),rgba(235,245,255,0.94))] p-6 text-slate-900 shadow-[0_28px_70px_rgba(59,130,246,0.12)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.96))] dark:text-white dark:shadow-[0_28px_70px_rgba(2,6,23,0.4)]"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
            热点追踪
          </p>
          <div className="rounded-full border border-sky-200/80 bg-white/85 px-3 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/6 dark:text-white/70">
            Updated
          </div>
        </div>
        <ErrorLine message={hotNewsError} />
        <div className="mt-5 grid gap-4">
          {visibleHot.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[auto_1fr] gap-4 rounded-[22px] border border-sky-100/90 bg-white/85 px-4 py-4 shadow-[0_14px_36px_rgba(59,130,246,0.08)] dark:border-white/6 dark:bg-white/4.5 dark:shadow-none"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                {index + 1}
              </div>
              <div>
                <p className="line-clamp-2 text-sm leading-7 text-slate-900 dark:text-white">
                  {toText(item.title, `热门资讯 ${index + 1}`)}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-500">
                  浏览量 {String(item.commentNum ?? item.viewCount ?? 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MotionReveal>
    </HomeSection>
  );
}
