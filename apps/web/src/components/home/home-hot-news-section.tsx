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
      eyebrow="Signal Column"
      title="热点追踪"
      subtitle="作为门户的信号列存在，承接平台当前最值得注意的热点，而不是与主内容平权竞争。"
      compact
    >
      <MotionReveal
        direction="left"
        className="rounded-[1.55rem] border border-border/80 bg-card p-6 text-foreground shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.96))] dark:text-white dark:shadow-[0_24px_60px_rgba(2,6,23,0.4)]"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary dark:text-sky-300">
            热点追踪
          </p>
          <div className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary dark:border-white/10 dark:bg-white/6 dark:text-white/70">
            Updated
          </div>
        </div>
        <ErrorLine message={hotNewsError} />
        <div className="mt-5 space-y-3">
          {visibleHot.map((item, index) => (
            <div
              key={index}
              className="group flex items-center gap-4 rounded-[1rem] border border-border/60 bg-muted/55 px-4 py-3 transition hover:border-primary/20 hover:bg-muted dark:border-white/10 dark:bg-white/4"
            >
              <div
                className={`flex size-8 items-center justify-center rounded-xl text-sm font-extrabold transition group-hover:scale-110 ${
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
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-600">
                  {toText(item.title, `热门资讯 ${index + 1}`)}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground dark:text-slate-500">
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
