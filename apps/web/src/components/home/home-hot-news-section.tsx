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
  const visibleHot = (hotNews.length ? hotNews : new Array(5).fill({})).slice(
    0,
    5
  );

  return (
    <HomeSection
      eyebrow="热点追踪"
      title="热点追踪"
      subtitle="把文章热度与浏览量集中成一组轻量排行。"
      compact
    >
      <MotionReveal
        direction="left"
        className="rounded-3xl border border-border bg-card p-6 text-foreground shadow-sm dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.96))] dark:text-white dark:shadow-[0_24px_60px_rgba(2,6,23,0.4)]"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-sky-300">
            热点追踪
          </p>
          <div className="rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:border-white/10 dark:bg-white/6 dark:text-white/70">
            Updated
          </div>
        </div>
        <ErrorLine message={hotNewsError} />
        <div className="mt-5 space-y-4">
          {visibleHot.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div
                className={`flex size-8 items-center justify-center rounded-xl text-sm font-extrabold group-hover:scale-110 ${
                  index === 0
                    ? "bg-indigo-600 text-white"
                    : index === 1
                      ? "bg-indigo-400 text-white"
                      : index === 2
                        ? "bg-indigo-300 text-white"
                        : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 border-b border-border/60 pb-3 last:border-0 last:pb-0 dark:border-white/10">
                <p className="text-sm font-bold text-foreground transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-600">
                  {toText(item.title, `热门资讯 ${index + 1}`)}
                </p>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground dark:text-slate-500">
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
