import Link from "next/link";
import type { HomeRecord } from "./home-types";
import { toText } from "@/lib/media";

export function HomeHotNewsSection({
  hotNews,
  hotNewsError,
}: {
  hotNews: HomeRecord[];
  hotNewsError: string | null;
}) {
  const visibleNews = hotNews.slice(0, 5);

  return (
    <section className="flex flex-col">
      <div className="flex items-baseline justify-between border-b border-border/60 pb-3 mb-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
          最新公告
        </h3>
      </div>

      {hotNewsError && (
        <div className="py-2 text-sm text-destructive">{hotNewsError}</div>
      )}

      {visibleNews.length === 0 && !hotNewsError ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">状态异常 / 同步中</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {visibleNews.map((news, index) => (
            <Link
              key={index}
              href={`/news/${String(news.id ?? "")}`}
              className="group flex flex-col gap-1.5"
            >
              <h4 className="line-clamp-2 text-sm font-semibold leading-relaxed tracking-tight text-foreground transition-colors group-hover:text-primary">
                {toText(news.title, `公告 ${index + 1}`)}
              </h4>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground opacity-70">
                {toText(news.publishTime ?? news.time, "未知时间")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
