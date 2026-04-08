import Link from "next/link";
import { resolveMediaUrl, toText } from "@/lib/media";
import type { HomeRecord } from "./home-types";
import { ArrowRight } from "lucide-react";
import { MotionItem, MotionStagger } from "@workspace/motion";

export function HomeNewsSection({
  recommendedNews,
  recommendedNewsError,
}: {
  recommendedNews: HomeRecord[];
  recommendedNewsError: string | null;
}) {
  const visibleNews = recommendedNews.slice(0, 4);

  return (
    <section className="flex flex-col">
      <div className="flex items-baseline justify-between border-b border-border/40 pb-5 mb-8">
        <h2 className="text-2xl font-heading font-black tracking-tight text-foreground">
          推荐资讯
        </h2>
        <Link href="/news" className="group flex items-center text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors">
          信息流
          <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {recommendedNewsError && (
        <div className="py-4 text-sm text-destructive">{recommendedNewsError}</div>
      )}

      {visibleNews.length === 0 && !recommendedNewsError ? (
        <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl bg-muted/20 border border-border/30">
          <p className="text-sm font-semibold text-foreground">资讯流待更新</p>
          <p className="text-xs text-muted-foreground mt-1">系统暂无推荐的最新文章</p>
        </div>
      ) : (
        <MotionStagger className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4" delayChildren={0.05}>
          {visibleNews.map((news, index) => {
            const coverUrl = resolveMediaUrl(String(news.cover ?? ""));
            return (
              <MotionItem key={index}>
                <Link
                  href={`/news/${String(news.id ?? "")}`}
                  className="group flex flex-col gap-4"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30 border border-border/40 rounded-2xl isolation-auto">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={toText(news.title, `资讯 ${index + 1}`)}
                        className="object-cover w-full h-full transition-transform duration-[600ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex bg-card items-center justify-center h-full w-full">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">暂无缩略图</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="line-clamp-2 text-sm font-bold tracking-tight leading-loose text-foreground transition-colors group-hover:text-primary">
                      {toText(news.title, "未知资讯")}
                    </h3>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {toText(news.publishTime ?? news.time, "未知时间")}
                    </div>
                  </div>
                </Link>
              </MotionItem>
            );
          })}
        </MotionStagger>
      )}
    </section>
  );
}
