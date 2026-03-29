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
      eyebrow="Newsroom"
      title="文章资讯"
      subtitle="资讯区回到更清晰的教育平台信息流逻辑，承接精选内容与学习热点。"
      href="/news"
    >
      <ErrorLine message={recommendedNewsError} />
      <MotionStagger className="grid gap-4 sm:grid-cols-2" delayChildren={0.1}>
        {visibleRecommended.map((item, index) => (
          <MotionItem key={index}>
            <article className="overflow-hidden rounded-[28px] border border-white/80 bg-white/85 shadow-[0_18px_42px_rgba(37,99,235,0.06)] dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_18px_42px_rgba(2,6,23,0.3)]">
              <div className="overflow-hidden bg-[linear-gradient(135deg,#dbeafe,#eff6ff)] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(15,23,42,0.96))]">
                {resolveMediaUrl(String(item.coverImg ?? "")) ? (
                  <img
                    src={resolveMediaUrl(String(item.coverImg)) ?? ""}
                    alt={toText(item.title, `资讯 ${index + 1}`)}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-end p-5">
                    <div className="rounded-2xl bg-white/75 px-4 py-3 backdrop-blur dark:bg-slate-950/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                        News
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        资讯封面待接入
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <h3 className="line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                  {toText(item.title, `推荐资讯 ${index + 1}`)}
                </h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
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
