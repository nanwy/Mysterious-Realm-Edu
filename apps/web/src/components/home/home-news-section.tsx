import { MotionItem, MotionStagger } from "@workspace/motion";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ErrorLine, HomeSection } from "./home-section-heading";

export function HomeNewsSection({
  recommendedNews,
  recommendedNewsError,
}: {
  recommendedNews: HomeRecord[];
  recommendedNewsError: string | null;
}) {
  const visibleRecommended = (
    recommendedNews.length ? recommendedNews : new Array(4).fill({})
  ).slice(0, 4);

  return (
    <HomeSection
      eyebrow="资讯中心"
      title="精选资讯"
      subtitle="承接旧系统文章接口，用更克制的卡片节奏展示课程资讯和平台动态。"
      href="/news"
    >
      <ErrorLine message={recommendedNewsError} />
      <MotionStagger className="grid gap-6 sm:grid-cols-2" delayChildren={0.1}>
        {visibleRecommended.map((item, index) => (
          <MotionItem key={index}>
            <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:bg-slate-900/75">
              <div className="overflow-hidden bg-muted dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(15,23,42,0.96))]">
                {resolveMediaUrl(String(item.coverImg ?? "")) ? (
                  <img
                    src={resolveMediaUrl(String(item.coverImg)) ?? ""}
                    alt={toText(item.title, `资讯 ${index + 1}`)}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center">
                    <div className="rounded-2xl bg-card px-4 py-3 backdrop-blur dark:bg-slate-950/70">
                      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-indigo-600">
                        News
                      </p>
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        资讯封面待接入
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <h3 className="line-clamp-2 text-lg font-extrabold text-foreground">
                  {toText(item.title, `推荐资讯 ${index + 1}`)}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {toText(item.remark ?? item.summary, "推荐资讯将在这里承接旧系统文章摘要。")}
                </p>
              </div>
            </article>
          </MotionItem>
        ))}
      </MotionStagger>
    </HomeSection>
  );
}
